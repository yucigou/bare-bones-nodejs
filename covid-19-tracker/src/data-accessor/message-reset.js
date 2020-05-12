'use strict';
require('dotenv').config();
const { logger, mongodb, queue } = require('config');
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

mongooseQueue.reset(function (err) {
  if (err) {
    logger.error(`Error: ${err}`);
  } else {
    logger.info('The queue was completely purged of all jobs.');
  }

  mongoose.connection.close();
  logger.info('Disconnected!');
});
