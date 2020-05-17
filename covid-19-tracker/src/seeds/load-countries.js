'use strict';
const logger = require('../utils/logger');
const { db } = require('../data-accessor/index');
const { addDailyStats } = require('../data-loading-worker/accessory');
const { getLatestReportDateFromAPI } = require('../utils/date');

const main = async () => {
  logger.info('Connected to the DB');
  const { reportDate } = await getLatestReportDateFromAPI();
  logger.info(`To fill up to the current latest report date ${reportDate}`);
  await addDailyStats(reportDate);
  logger.info(`Closing DB connection`);
  db.close();
};

main();
