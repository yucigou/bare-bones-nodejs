const cron = require('node-cron');
const logger = require('../utils/logger');
const { publish, cleanQueue, updateWorldDaily } = require('../data-accessor');
const { getWorldDailyReportFromAPI } = require('../utils/date');

cron.schedule('*/10 * * * *', async () => {
  logger.info(`Cronjob updating covid-19 stats`);
  const { latestReportDate, worldDaily } = await getWorldDailyReportFromAPI();
  logger.info(`To publish the current latest report date ${latestReportDate}`);
  publish(latestReportDate);
  logger.info(`Published the current latest report date ${latestReportDate}`);
  updateWorldDaily(worldDaily);
});

cron.schedule('0 */1 * * *', () => {
  logger.info(`Cronjob cleaning message queue`);
  cleanQueue();
  logger.info(`Cronjob cleaning message queue - done`);
});
