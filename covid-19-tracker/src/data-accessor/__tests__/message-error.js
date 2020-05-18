'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
var MongooseQueue = require('mongoose-queue').MongooseQueue;

// mongoose.set('debug', true);
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

mongooseQueue.error(
  '5ec263d3cc32d2089d4f4e19',
  'This one failed horribly',
  function (err, job) {
    if (err) return done(err);

    console.log(
      'The job with id ' +
        job.id +
        ' and payload ' +
        job.payload +
        ' failed with ' +
        job.error
    );

    // Print all info returned in job object
    console.log(job.payload);
    console.log(job.blockedUntil);
    console.log(job.done);
    console.log(job.error);

    mongoose.connection.close();
  }
);
