const { transports, createLogger, format } = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'Data Loader' }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      dirname: './logs',
      filename: 'covid-19-tracker.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '30d',
    }),
  ],
});

module.exports = { logger };
