require('dotenv').config();
const express = require('express');
const logger = require('../utils/logger');
const { isDateAcceptable } = require('../utils/date');
const { transformCountryList } = require('./transformer');
const {
  publish,
  getCountryDailyStats,
  getAllCountries,
} = require('../data-accessor');
const app = express();
const port = process.env.WS_PORT || 3000;

const shallPublish = (countryStats, mostRecentDate) => {
  if (!countryStats) {
    return false;
  }

  if (countryStats.dailyStats) {
    const found = countryStats.dailyStats.find(
      (daily) => daily.reportDate === mostRecentDate
    );
    if (found) {
      return false;
    }
  }

  return isDateAcceptable(mostRecentDate);
};

/*
 * /api/daily/[country]/[mostRecentDate]
 * Example: http://localhost:3000/api/daily/USA/2020-05-11
 */
app.get('/api/daily/:country/:mostRecentDate?', async (req, res) => {
  const { country, mostRecentDate } = req.params;
  const countryStats = await getCountryDailyStats(country);
  if (shallPublish(countryStats, mostRecentDate)) {
    // Send a message to the data loading worker to check if the daily stats of countries are up-to-date.
    publish(mostRecentDate);
    logger.info(`Published request for ${req.params.mostRecentDate}`);
  }
  res.json(countryStats);
});

app.get('/api/regions', async (req, res) => {
  const regions = await getAllCountries();
  const countryNameList = transformCountryList(regions);
  res.json(countryNameList);
});

app.listen(port, () =>
  logger.info(`Covid-19 Tracker API listening at http://localhost:${port}`)
);
