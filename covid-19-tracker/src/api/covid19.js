const logger = require('../utils/logger');
const axios = require('axios');

const getSummary = () => {
  return axios
    .get('https://covid19.mathdro.id/api')
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      logger.error('Error getting Covid-19 stats summary');
    })
    .finally(function () {
      logger.info('Got Covid-19 stats summary');
    });
};

// date: YYYY-MM-DD, e.g., 2020-05-01
const getDailyStats = (date) => {
  return axios
    .get(`https://covid19.mathdro.id/api/daily/${date}`)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      logger.error(`Error getting Covid-19 daily stats for ${date}: `, error);
    })
    .finally(function () {
      logger.info(`Got Covid-19 daily stats for ${date}`);
    });
};

const getWorldDaily = () => {
  return axios
    .get('https://covid19.mathdro.id/api/daily')
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      logger.error('Error getting Covid-19 world daily stats', error);
    })
    .finally(function () {
      logger.info(`Got Covid-19 world daily stats`);
    });
};

const getCountryNames = () => {
  return axios
    .get('https://covid19.mathdro.id/api/countries')
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      logger.error('Error getting Covid-19 country names', error);
    })
    .finally(function () {
      logger.info(`Got Covid-19 country names`);
    });
};

module.exports = {
  getSummary,
  getDailyStats,
  getWorldDaily,
  getCountryNames,
};
