const { transports, createLogger, format } = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, label, printf } = format;
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const dailyRotateFileTransport = new transports.DailyRotateFile({
  dirname: './logs',
  filename: 'covid-19-tracker.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '30d',
});

const consoleTransport = new transports.Console();

const dataLoaderLogger = createLogger({
  format: combine(label({ label: 'Data Loader' }), timestamp(), logFormat),
  transports: [consoleTransport, dailyRotateFileTransport],
});

const webServiceLogger = createLogger({
  format: combine(label({ label: 'Web Service' }), timestamp(), logFormat),
  transports: [consoleTransport, dailyRotateFileTransport],
});

module.exports = { dataLoaderLogger, webServiceLogger };
