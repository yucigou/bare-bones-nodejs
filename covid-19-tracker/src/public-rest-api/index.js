const express = require('express');
const { logger } = require('../utils/logger');
const { publish } = require('../data-accessor');
const app = express();
const port = 3000;

/*
 * /api/daily/[country]/[mostRecentDate]
 * Example: http://localhost:3000/api/daily/USA/2020-05-11
 */
app.get('/api/daily/:country/:mostRecentDate?', (req, res) => {
  const { country, mostRecentDate } = req.params;
  if (mostRecentDate) {
    // Send a message to the data loading worker to check if the daily stats of countries are up-to-date.
    publish(mostRecentDate);
    logger.info(
      `Responding to request for ${req.params.country} by ${req.params.mostRecentDate}`
    );
    res.send(`Hello ${req.params.country} by ${req.params.mostRecentDate}`);
  } else {
    res.send(`Hello ${req.params.country}`);
  }
});

app.listen(port, () =>
  logger.info(`Covid-19 Tracker API listening at http://localhost:${port}`)
);
