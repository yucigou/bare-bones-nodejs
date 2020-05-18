'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
var MongooseQueue = require('mongoose-queue').MongooseQueue;

const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', async () => {
  logger.info('We are connected!');

  // const result = await conn.db
  //   .collection('queues')
  //   .find({ done: false })
  //   .toArray();
  const result = await conn.db
    .collection('queues')
    .aggregate([
      { $unwind: '$payload' },
      {
        $lookup: {
          from: 'payloads',
          localField: 'payload',
          foreignField: '_id',
          as: 'payloadDetails',
        },
      },
      {
        $match: {
          retries: { $lte: queue.options.maxRetries },
          done: false,
          'payloadDetails.reportDate': '2020-03-09',
        },
      },
    ])
    .toArray();
  logger.info(result);
  conn.close();
});

mongoose.connect(mongodb.uris, mongodb.connectionOptions);
