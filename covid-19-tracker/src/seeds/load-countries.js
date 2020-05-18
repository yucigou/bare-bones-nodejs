'use strict';
const logger = require('../utils/logger');
const { conn } = require('../data-accessor/index');
const { addDailyStats } = require('../data-loading-worker/accessory');
const { getWorldDailyReportFromAPI } = require('../utils/date');

const main = async () => {
  logger.info('Connected to the DB');
  const { latestReportDate } = await getWorldDailyReportFromAPI();
  // const latestReportDate = '2020-02-18';
  logger.info(
    `To fill up to the current latest report date ${latestReportDate}`
  );
  await addDailyStats(latestReportDate);
  logger.info(`Closing DB connection`);
  conn.close();
};

main();
