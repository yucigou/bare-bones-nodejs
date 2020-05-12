'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const { dataLoaderLogger: logger } = require('../utils/logger');
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

mongooseQueue.clean(function (err) {
  if (err) {
    console.log('Error: ', err);
  } else {
    console.log('The queue was successfully cleaned.');
  }

  mongoose.connection.close();
});
