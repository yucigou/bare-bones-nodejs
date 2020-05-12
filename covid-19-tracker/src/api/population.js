const { logger } = require('config');
const axios = require('axios');

// country: e.g., 'India'
const getPopulation = (country) => {
  return axios
    .get('https://world-population.p.rapidapi.com/population', {
      params: {
        country_name: country,
      },
      headers: {
        'x-rapidapi-host': 'world-population.p.rapidapi.com',
        'x-rapidapi-key': 'd83a565ecbmshdff39d7760824e5p1b67b5jsn1792ee70e166',
      },
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      logger.error(`Error getting population for ${country}`, error);
    })
    .finally(function () {
      logger.info(`Got population for ${country}`);
    });
};

const getCountryNames = () => {
  return axios
    .get('https://world-population.p.rapidapi.com/allcountriesname', {
      headers: {
        'x-rapidapi-host': 'world-population.p.rapidapi.com',
        'x-rapidapi-key': 'd83a565ecbmshdff39d7760824e5p1b67b5jsn1792ee70e166',
        useQueryString: true,
      },
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      logger.error('Error getting country names', error);
    })
    .finally(function () {
      logger.info('Got country names');
    });
};

module.exports = {
  getPopulation,
  getCountryNames,
};
