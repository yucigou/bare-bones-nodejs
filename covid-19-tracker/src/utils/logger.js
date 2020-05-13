const { processor } = require('config');
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
  format: combine(
    label({ label: processor.dataLoader }),
    timestamp(),
    logFormat
  ),
  transports: [consoleTransport, dailyRotateFileTransport],
});

const webServiceLogger = createLogger({
  format: combine(
    label({ label: processor.webService }),
    timestamp(),
    logFormat
  ),
  transports: [consoleTransport, dailyRotateFileTransport],
});

const dataAccessorLogger = createLogger({
  format: combine(
    label({ label: processor.dataAccess }),
    timestamp(),
    logFormat
  ),
  transports: [consoleTransport, dailyRotateFileTransport],
});

const jobCrontabLogger = createLogger({
  format: combine(
    label({ label: processor.jobCrontab }),
    timestamp(),
    logFormat
  ),
  transports: [consoleTransport, dailyRotateFileTransport],
});

const defaultLogger = createLogger({
  format: combine(label({ label: processor.default }), timestamp(), logFormat),
  transports: [consoleTransport, dailyRotateFileTransport],
});

const LoggerMap = {
  [processor.dataLoader]: dataLoaderLogger,
  [processor.webService]: webServiceLogger,
  [processor.dataAccess]: dataAccessorLogger,
  [processor.jobCrontab]: jobCrontabLogger,
};

const getLogger = () => {
  if (process.env.PROCESSOR in LoggerMap) {
    return LoggerMap[process.env.PROCESSOR];
  }
  return defaultLogger;
};

module.exports = getLogger;
