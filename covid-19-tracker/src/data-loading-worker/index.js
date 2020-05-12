'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const { dataLoaderLogger: logger } = require('../utils/logger');
const mongoose = require('mongoose');
var MongooseQueue = require('mongoose-queue').MongooseQueue;
require('../data-accessor/models/payload');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  logger.info('We are connected!');
});

mongoose.connect(mongodb.uris, mongodb.connectionOptions);

const mongooseQueue = new MongooseQueue(
  queue.modelName,
  queue.workerId,
  queue.options
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const handlePayload = (reportDate) => {
  // Check if reportDate has already been dealt with
  // Get the world daily to find all reportDate entries that have not been dealt with, and deal with them
  // Get the daily stats one by one and put them into each country
};

const handleQueue = () => {
  return new Promise((resolve, reject) => {
    mongooseQueue.get(async (err, job) => {
      if (err) {
        console.log('Error getting: ', err);
        reject();
        return;
      }

      if (!job) {
        console.log('No jobs. Next time.');
        resolve();
        return;
      }

      console.log('Job got: ', job);

      console.log('Payload report date: ', job.payload.reportDate);

      console.log('Sleeping');
      await sleep(10000);
      console.log('Woke up');

      mongooseQueue.ack(job.id, (err, j) => {
        if (err) {
          console.log('Error acking: ', err);
          reject();
          return;
        }

        console.log('Job acked: ', j);

        resolve();
        console.log('Resolved');
      });
    });
  });
};

const loadData = async () => {
  console.log('About to load data');
  try {
    await handleQueue();
  } catch (error) {
    console.log('Error: ', error);
  } finally {
    console.log('Done with the job');
    setTimeout(loadData, 1000);
  }
};

loadData();
console.log('Started the data loading job');

// Keep connection open
