const cron = require('node-cron');
const logger = require('../utils/logger');
const { publish, cleanQueue } = require('../data-accessor');

cron.schedule('*/10 * * * *', async () => {
  logger.info(`Cronjob updating covid-19 stats`);
  const { reportDate } = await getLatestReportDateFromAPI();
  logger.info(`To publish the current latest report date ${reportDate}`);
  await publish(reportDate);
  logger.info(`Published the current latest report date ${reportDate}`);
});

cron.schedule('0 */1 * * *', () => {
  logger.info(`Cronjob cleaning message queue`);
  cleanQueue();
  logger.info(`Cronjob cleaning message queue - done`);
});
