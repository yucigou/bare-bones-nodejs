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

module.exports = { logger: winston };
