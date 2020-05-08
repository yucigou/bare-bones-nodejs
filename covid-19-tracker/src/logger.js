const logger = require('winston');
require('winston-daily-rotate-file');

logger.add(logger.transports.DailyRotateFile, {
  dirname: './logs',
  filename: 'covid-19-tracker.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '30d',
});

module.exports = logger;
