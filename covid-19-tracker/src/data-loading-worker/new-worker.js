'use strict';
require('dotenv').config();
const { mongodb, queue } = require('config');
const { logger } = require('../utils/logger');
const { consume } = require('../data-accessor');

const handleJob = async (reportDate) => {
  // Check if reportDate has already been dealt with
  // Get the world daily to find all reportDate entries that have not been dealt with, and deal with them
  // Get the daily stats one by one and put them into each country
};

const loadData = async () => {
  logger.info('About to check payload and load data');
  try {
    await consume(handleJob);
  } catch (error) {
    logger.error(`Error consuming the job queue: ${error}`);
  } finally {
    logger.info('Done with the job');
    setTimeout(loadData, 10000);
  }
};

loadData();
logger.info('Started the data loading job');
