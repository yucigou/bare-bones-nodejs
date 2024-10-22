'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const logger = require('../utils/logger');
const { isReportDateValid } = require('../utils/date');
const mapSeries = require('../utils/map-series');
const { consume, isUpdated, updateAllCountries } = require('../data-accessor');
const { getWorldDaily, getDailyStats } = require('../api/covid19');
const { addDailyStats } = require('./accessory');

// Update every country with reportDate
const updateWith = async (reportDate) => {
  // Check if reportDate has already been dealt with
  if (await isUpdated(reportDate)) {
    logger.info(`Our repo is updated for ${reportDate}`);
    return;
  }

  const dailyStats = await getDailyStats(reportDate);
  await updateAllCountries(dailyStats);
};

/* handleJob:
 *  1. Promise based job handler
 *  2. If failed for any reason, must throw an error
 */
const handleJob = async (reportDate) => {
  if (!isReportDateValid(reportDate)) {
    throw new Error(`Invalid reportDate: ${reportDate}`);
  }

  await addDailyStats(reportDate);

  /*
  // Check if reportDate has already been dealt with
  if (await isUpdated(reportDate)) {
    logger.info(`Our repo is updated for ${reportDate}`);
    return;
  }

  const worldDaily = await getWorldDaily();
  const reportDates = worldDaily.map((daily) => daily.reportDate);
  // Get the world daily to find all reportDate entries that have not been dealt with, and deal with them
  await mapSeries(reportDates, updateWith);
  */
};

const loadData = async () => {
  logger.info('About to check payload and load data');
  let moreJob = true;
  try {
    while (moreJob) {
      moreJob = await consume(handleJob);
    }
  } catch (error) {
    logger.error(`Error consuming the job queue: ${error}`);
  } finally {
    logger.info('Done with the job batch');
    setTimeout(loadData, 60000);
  }
};

loadData();
logger.info('Started the data loading job');
