const logger = require('../../utils/logger');
const { publish, updateWorldDaily } = require('../../data-accessor');
const { getWorldDailyReportFromAPI } = require('../../utils/date');

const main = async () => {
  logger.info(`Cronjob updating covid-19 stats`);
  const { latestReportDate, worldDaily } = await getWorldDailyReportFromAPI();
  logger.info(`To publish the current latest report date ${latestReportDate}`);
  await publish(latestReportDate);
  logger.info(`Published the current latest report date ${latestReportDate}`);
  await updateWorldDaily(worldDaily);
};

main();
