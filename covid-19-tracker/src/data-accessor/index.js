'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const logger = require('../utils/logger');
const mapSeries = require('../utils/map-series');
const { isReportDateValid } = require('../utils/date');
const { curateCountryName } = require('../utils/country');
const mongoose = require('mongoose');
const { MongooseQueue } = require('mongoose-queue');
const Payload = require('./models/payload');
const Country = require('./models/country');
const MetaData = require('../data-accessor/models/metadata');

const mongooseQueue = new MongooseQueue(
  queue.modelName,
  queue.workerId,
  queue.options
);

mongoose.connect(mongodb.uris, mongodb.connectionOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  logger.info('We are connected!');
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
const publish = (reportDate) => {
  if (!isReportDateValid(reportDate)) {
    logger.error(`Invalid reportDate: ${reportDate}`);
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
          resolve();
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
          resolve();
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

const getAllCountryNames = async () => {
  const country = await Country.find({}, '-_id name', {
    sort: { name: 1 },
  });
  return country;
};

const getAllCountries = async () => {
  const country = await Country.find({});
  return country;
};

const saveCountryNames = async (countryNames) => {
  await mapSeries(countryNames, async (countryName) => {
    const curatedCountryName = curateCountryName(countryName);
    await Country.findOneAndUpdate(
      { name: curatedCountryName.name },
      curatedCountryName,
      {
        upsert: true,
      }
    );
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

module.exports = {
  cleanQueue,
  consume,
  db,
  getCountryDailyStats,
  getAllCountryNames,
  getAllCountries,
  getLatestReportDate,
  isUpdated,
  publish,
  saveCountryNames,
  updateCountriesToDB,
  updateMetadata,
};
