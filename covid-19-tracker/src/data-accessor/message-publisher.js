'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const logger = require('../utils/logger')();
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

  const payload = new Payload({ reportDate: '2020-04-30' });
  console.log('Payload: ', payload);

  payload.save().then((saved) => {
    console.log('Saved: ', saved);
    mongooseQueue.add(saved, function (err, jobId) {
      if (err) {
        console.error(err);
        return;
      }

      console.log('jobId', jobId);
      mongoose.connection.close();
    });
  });
});
