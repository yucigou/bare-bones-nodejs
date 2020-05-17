'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
const MongooseQueue = require('mongoose-queue').MongooseQueue;
require('../models/payload');

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

  mongooseQueue.get(function (err, job) {
    if (err) {
      console.log('Error getting: ', err);
      return;
    }

    if (!job) {
      console.log('No more jobs');
      return;
    }

    console.log('Job got: ', job);

    console.log('Payload report date: ', job.payload.reportDate);

    mongooseQueue.ack(job.id, (err, j) => {
      if (err) {
        console.log('Error acking: ', err);
        return;
      }

      console.log('Job acked: ', j);
    });
  });
});
