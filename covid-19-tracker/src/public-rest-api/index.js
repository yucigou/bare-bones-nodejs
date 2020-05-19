require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('../utils/logger');
const { isDateAcceptable } = require('../utils/date');
const {
  sortDailyStats,
  transformCountryList,
  transformLatestDailyStats,
} = require('./transformer');
const {
  getAllCountryNames,
  getCountryDailyStats,
  getLatestDailyStats,
  publish,
} = require('../data-accessor');

const app = express();
app.use(cors());

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
 * /api/daily/[region]/[mostRecentDate]
 * Example: http://localhost:3000/api/daily/USA/2020-05-11
 */
app.get('/api/daily/:region/:mostRecentDate?', async (req, res) => {
  const { region, mostRecentDate } = req.params;
  const countryStats = await getCountryDailyStats(region);
  if (shallPublish(countryStats, mostRecentDate)) {
    // Send a message to the data loading worker to check if the daily stats of countries are up-to-date.
    publish(mostRecentDate);
    logger.info(`Published request for ${req.params.mostRecentDate}`);
  } else {
    logger.info(`No need to publish request for ${req.params.mostRecentDate}`);
  }
  if (countryStats) {
    res.json(sortDailyStats(countryStats));
  } else {
    res.json({});
  }
});

app.get('/api/daily', async (req, res) => {
  const countryStats = await getLatestDailyStats();
  if (countryStats) {
    res.json(transformLatestDailyStats(countryStats));
  } else {
    res.json({});
  }
});

app.get('/api/regions', async (req, res) => {
  const regions = await getAllCountryNames();
  const countryNameList = transformCountryList(regions);
  res.json(countryNameList);
});

const port = process.env.WS_PORT || 3000;

app.listen(port, () =>
  logger.info(`Covid-19 Tracker API listening at http://localhost:${port}`)
);
