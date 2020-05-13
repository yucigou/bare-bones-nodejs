'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const logger = require('../utils/logger')(process.env.PROCESSOR);
const { isReportDateValid } = require('../utils/validator');
const mongoose = require('mongoose');
const { MongooseQueue } = require('mongoose-queue');
const Payload = require('./models/payload');

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

const isUpdated = async (reportDate) => {
  // TODO
};

const updateAllCountries = async (dailyStats) => {
  // TODO
};

module.exports = {
  publish,
  consume,
  isUpdated,
  updateAllCountries,
};
