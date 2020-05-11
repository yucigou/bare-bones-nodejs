'use strict';
require('dotenv').config();
const { logger, mongodb, queue } = require('config');
const mongoose = require('mongoose');
var MongooseQueue = require('mongoose-queue').MongooseQueue;
require('../data-accessor/helper');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  logger.info('We are connected!');
});

mongoose.connect(mongodb.uris, mongodb.connectionOptions);

const mongooseQueue = new MongooseQueue(
  queue.payloadModel,
  queue.workerId,
  queue.options
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const handleQueue = () => {
  return new Promise((resolve, reject) => {
    mongooseQueue.get(async (err, job) => {
      if (err) {
        console.log('Error getting: ', err);
        reject();
        return;
      }

      if (!job) {
        console.log('No job. Next.');
        resolve();
        return;
      }

      console.log(job.id);
      console.log(job.payload);
      console.log(job.blockedUntil);
      console.log(job.done);

      console.log('Sleeping');
      await sleep(10000);
      console.log('Woke up');

      mongooseQueue.ack(job.id, (err, j) => {
        if (err) {
          console.log('Error acking: ', err);
          reject();
          return;
        }

        console.log(
          'The job with id ' + j.id + ' and payload ' + j.payload + ' is done.'
        );

        // Print all info returned in job object
        console.log(j.payload);
        console.log(j.blockedUntil);
        console.log(j.done);

        console.log('Resolving');
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
    setTimeout(loadData, 10000);
  }
};

loadData();
console.log('Started the data loading job');

// Keep connection open
