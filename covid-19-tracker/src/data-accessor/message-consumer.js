'use strict';
require('dotenv').config();
const { logger } = require('config');
const mongoose = require('mongoose');
var MongooseQueue = require('mongoose-queue').MongooseQueue;
var Helper = require('./helper.js');

// mongoose.set('debug', true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  logger.info('We are connected!');
});

mongoose.connect(
  `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/mydb?authSource=admin`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

var myOptions = {
  queueCollection: 'queue',
  blockDuration: 30000,
  maxRetries: 5,
};
var mongooseQueue = new MongooseQueue('payload', 'my-worker-id', myOptions);

mongooseQueue.get(function (err, job) {
  if (err) return done(err);

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
