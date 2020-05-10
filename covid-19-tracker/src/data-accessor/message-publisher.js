'use strict';
require('dotenv').config();
const { logger, mongodb, queue } = require('config');
const mongoose = require('mongoose');
var MongooseQueue = require('mongoose-queue').MongooseQueue;
var Helper = require('./helper.js');

// mongoose.set('debug', true);
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

var Payload = require('./models/payload-schema');
var payload = Helper.randomPayload();

mongooseQueue.add(payload, function (err, jobId) {
  if (err) {
    console.error(err);
    return;
  }

  console.log('jobId', jobId);
});
