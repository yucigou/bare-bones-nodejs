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

const handleQueue = () => {
  mongooseQueue.get(function (err, job) {
    if (err) {
      console.log('Error getting: ', err);
      return;
    }

    if (!job) {
      console.log('No job. Next.');
      return;
    }

    console.log(job.id);
    console.log(job.payload);
    console.log(job.blockedUntil);
    console.log(job.done);

    mongooseQueue.ack(job.id, (err, j) => {
      if (err) return done(err);

      console.log(
        'The job with id ' + j.id + ' and payload ' + j.payload + ' is done.'
      );

      // Print all info returned in job object
      console.log(j.payload);
      console.log(j.blockedUntil);
      console.log(j.done);
    });
  });
};

setInterval(() => {
  handleQueue();
}, 2000);
