'use strict';
require('dotenv').config();
const { mongodb, queue, covid19 } = require('config');
const logger = require('../utils/logger');
const mapSeries = require('../utils/map-series');
const { getNextDate, isReportDateValid } = require('../utils/date');
const { curateCountryName } = require('../utils/country');
const mongoose = require('mongoose');
const { MongooseQueue } = require('mongoose-queue');
const Payload = require('./models/payload');
const Country = require('./models/country');
const World = require('./models/world');
const MetaData = require('../data-accessor/models/metadata');

const mongooseQueue = new MongooseQueue(
  queue.modelName,
  queue.workerId,
  queue.options
);

mongoose.connect(mongodb.uris, mongodb.connectionOptions);

const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
  logger.info('Connection to MongoDB has been made.');
});

const cleanQueue = () => {
  mongooseQueue.clean((err) => {
    if (err) {
      logger.error(`Error cleaning the message queue: ${err}`);
    } else {
      logger.info('The message queue has been successfully cleaned.');
    }
  });
};

// See {"reportDate": "2020-04-29"} in the response of API https://covid19.mathdro.id/api/daily
// reportDate will be used later to call API https://covid19.mathdro.id/api/daily/2020-04-29
const publish = async (reportDate) => {
  if (!isReportDateValid(reportDate)) {
    logger.error(`Invalid reportDate: ${reportDate}`);
    return;
  }

  const alreadyInQueue = await isQueued(reportDate);
  if (alreadyInQueue) {
    logger.info(`${reportDate} already in the message queue. Skip it.`);
    return;
  }

  const payload = new Payload({ reportDate });
  logger.info(`New payload: ${payload}`);

  payload
    .save()
    .then((saved) => {
      logger.info(`Payload to publish: ${saved}`);
      try {
        mongooseQueue.add(saved, (err, jobId) => {
          if (err) {
            logger.error(`Error adding ${reportDate} to the queue: ${err}`);
            return;
          }

          logger.info(`Job enqueued with ID ${jobId}`);
        });
      } catch (error) {
        logger.error(`Exception adding ${reportDate} to the queue: ${error}`);
      }
    })
    .catch((err) => {
      logger.error(`Error saving the payload: ${payload}, err: ${err}`);
    });
};

/* handleJob:
 *  1. Promise based job handler
 *  2. If failed for any reason, must throw an error
 *
 * The caller must handle the potential exception
 */

const consume = (handleJob) => {
  return new Promise((resolve, reject) => {
    try {
      mongooseQueue.get(async (err, job) => {
        if (err) {
          logger.error(`Error getting from queue: ${err}`);
          reject();
          return;
        }

        if (!job) {
          logger.info('No jobs. Next time.');
          resolve(0);
          return;
        }

        const { payload, id, blockedUntil, done } = job;

        logger.info(
          `About to process the job got from queue: ${id}, ${blockedUntil}, ${done}, ${payload}`
        );
        await handleJob(payload.reportDate);
        logger.info(`Job done: ${id}, ${blockedUntil}, ${done}, ${payload}`);

        mongooseQueue.ack(id, (err, job) => {
          if (err) {
            logger.error(`Error acking job: ${id}, error ${err}`);
            reject();
            return;
          }

          const { payload, id, blockedUntil, done } = job;
          logger.info(`Job acked: ${id}, ${blockedUntil}, ${done}, ${payload}`);
          resolve(1);
        });
      });
    } catch (error) {
      logger.error(`Error consuming a job from the queue: ${error}`);
      reject();
    }
  });
};

/*
 * true: already updated for the given reportDate
 */
const isUpdated = async (reportDate) => {
  const metadata = await MetaData.findOne({});
  return (
    metadata && new Date(reportDate) <= new Date(metadata.latestReportDate)
  );
};

const updateMetadata = async (reportDate) => {
  await MetaData.findOneAndUpdate(
    {},
    { $set: { latestReportDate: reportDate } },
    { upsert: true }
  );
};

const getCountryDailyStats = async (countryName) => {
  const country = await Country.findOne(
    {
      $or: [
        { name: countryName },
        // { aliases: countryName },
        // { iso2: countryName },
        // { iso3: countryName },
      ],
    },
    '-_id name dailyStats.confirmed dailyStats.recovered dailyStats.deaths dailyStats.active dailyStats.reportDate'
  );
  return country;
};

const getLatestDailyStats = async () => {
  const countries = await Country.aggregate([
    {
      $match: {
        dailyStats: { $exists: true },
      },
    },
    {
      $project: {
        name: 1,
        iso2: {
          $cond: {
            if: { $eq: [null, '$iso2'] },
            then: '$$REMOVE',
            else: '$iso2',
          },
        },
        latestReportDate: {
          $arrayElemAt: [
            '$dailyStats',
            {
              $indexOfArray: [
                '$dailyStats.reportDate',
                { $max: '$dailyStats.reportDate' },
              ],
            },
          ],
        },
      },
    },
  ]);
  return countries;
};

const getAllCountryNames = async () => {
  const countries = await Country.aggregate([
    {
      $match: {
        dailyStats: { $exists: true },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        iso2: {
          $cond: {
            if: { $eq: [null, '$iso2'] },
            then: '$$REMOVE',
            else: '$iso2',
          },
        },
        icon: {
          $cond: {
            if: { $eq: [null, '$icon'] },
            then: '$$REMOVE',
            else: '$icon',
          },
        },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]);
  return countries;
};

const getAllCountries = async () => {
  const country = await Country.find({});
  return country;
};

const saveCountryNames = async (countryNames) => {
  await mapSeries(countryNames, async (countryName) => {
    await Country.findOneAndUpdate({ name: countryName.name }, countryName, {
      upsert: true,
    });
  });
};

const findReportDate = (allCountries, countryName, reportDate) => {
  return allCountries.find((c) => {
    if (c.name.toUpperCase() === countryName.toUpperCase()) {
      if (c.dailyStats) {
        return c.dailyStats.find((stats) => stats.reportDate === reportDate);
      }
    }
    return false;
  });
};

// Add stats to the dailyStats array
const updateCountriesToDB = async (
  allCountries,
  updatedCountries,
  reportDate
) => {
  const countryNames = Object.keys(updatedCountries);
  await mapSeries(countryNames, async (countryName) => {
    // Skip reportDate if already added
    if (!findReportDate(allCountries, countryName, reportDate)) {
      if (updatedCountries[countryName].newlyAdded) {
        await Country.findOneAndUpdate(
          {
            name: countryName,
          },
          {
            $set: {
              newlyAdded: true,
              iso2: updatedCountries[countryName].iso2,
              icon: updatedCountries[countryName].icon,
              code: updatedCountries[countryName].code,
              lastUpdate: updatedCountries[countryName].lastUpdate,
            },
            $push: {
              dailyStats: updatedCountries[countryName].stats,
            },
          },
          {
            upsert: true,
          }
        );
      } else {
        await Country.findOneAndUpdate(
          {
            name: countryName,
          },
          {
            $set: {
              lastUpdate: updatedCountries[countryName].lastUpdate,
            },
            $push: {
              dailyStats: updatedCountries[countryName].stats,
            },
          },
          {
            upsert: true,
          }
        );
      }
    }
  });

  return;
};

const getLatestReportDate = async () => {
  const metadata = await MetaData.findOne({});
  if (!metadata) {
    return null;
  }
  return metadata.latestReportDate;
};

const isQueued = async (reportDate) => {
  if (!conn.db) {
    logger.warn(`Connection to MongoDB is not ready yet.`);
    return false;
  }

  try {
    const result = await conn.db
      .collection('queues')
      .aggregate([
        { $unwind: '$payload' },
        {
          $lookup: {
            from: 'payloads',
            localField: 'payload',
            foreignField: '_id',
            as: 'payloadDetails',
          },
        },
        {
          $match: {
            retries: { $lte: queue.options.maxRetries },
            done: false,
            'payloadDetails.reportDate': reportDate,
          },
        },
      ])
      .toArray();
    return result && result.length > 0;
  } catch (error) {
    logger.error(`Error checking the queue: ${error}`);
    return false;
  }
};

const updateWorldDaily = async (worldDaily) => {
  logger.info(`Updating world daily stats`);
  const latestReportDate = worldDaily.reduce(
    (a, b) => {
      return a.reportDate > b.reportDate ? a : b;
    },
    { reportDate: covid19.earliestReportDate }
  );
  logger.info(
    `The current latest report date is ${latestReportDate.reportDate}`
  );

  const world = await World.find();
  let nextReportDate = covid19.earliestReportDate;
  while (new Date(nextReportDate) <= new Date(latestReportDate.reportDate)) {
    const stats = worldDaily.find(
      (daily) => daily.reportDate === nextReportDate
    );
    if (!stats) {
      logger.warn(
        `Odd, world daily stats does not have stats for ${nextReportDate}`
      );
      nextReportDate = getNextDate(nextReportDate);
      continue;
    }
    if (
      !world ||
      world.length <= 0 ||
      !world.find((d) => d.reportDate === nextReportDate)
    ) {
      const newWorldDaily = new World({
        confirmed: stats.totalConfirmed,
        recovered: stats.totalRecovered,
        deaths: stats.deaths.total,
        active:
          stats.totalConfirmed - stats.totalRecovered - stats.deaths.total,
        reportDate: nextReportDate,
      });

      await newWorldDaily.save();
      logger.info(`World daily stats saved for ${nextReportDate}`);
    }
    nextReportDate = getNextDate(nextReportDate);
  }
  logger.info(`Updating world daily stats - done`);
};

module.exports = {
  cleanQueue,
  consume,
  conn,
  getCountryDailyStats,
  getAllCountryNames,
  getAllCountries,
  getLatestDailyStats,
  getLatestReportDate,
  isUpdated,
  publish,
  saveCountryNames,
  updateCountriesToDB,
  updateMetadata,
  updateWorldDaily,
};
