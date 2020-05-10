require('dotenv').config();
const winston = require('winston');
require('winston-daily-rotate-file');

winston.add(
  new winston.transports.DailyRotateFile({
    dirname: './logs',
    filename: 'covid-19-tracker.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxFiles: '30d',
  })
);

module.exports = {
  logger: winston,
  mongodb: {
    uris: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/covid19?authSource=admin`,
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
    },
  },
  queue: {
    payloadModel: 'payload',
    workerId: 'data-loading-worker',
    options: {
      queueCollection: 'queue',
      blockDuration: 300000,
      maxRetries: 5,
    },
  },
};
