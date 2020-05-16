'use strict';
require('dotenv').config();
const { mongodb } = require('config');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const Country = require('../data-accessor/models/country');
const {
  getCountryNames,
  getDailyStats,
  getWorldDaily,
} = require('../api/covid19');
const mapSeries = require('../utils/map-series');
const { extraCountries } = require('../utils/country');

mongoose.connect(mongodb.uris, mongodb.connectionOptions);

const db = mongoose.connection;
db.on('error', () => {
  logger.error('Error connecting to the DB');
});

db.once('open', async () => {
  logger.info('Connected to the DB');

  const allCountries = await getAllCountriesFromDB();
  const allDatesAvailable = await getAllDatesAvailableFromAPI();
  // const allDatesAvailable = ['2020-02-28'];
  await mapSeries(allDatesAvailable, async (reportDate) => {
    logger.info(`Start to add stats for ${reportDate}`);
    const dailyStats = await getDailyStats(reportDate);
    const staged = combineCountryRegions(dailyStats);
    const updatedCountries = comebineCountryAliases(
      allCountries,
      staged,
      reportDate
    );
    await updateCountriesToDB(updatedCountries);
    logger.info(`Finish adding stats for ${reportDate}`);
  });

  mongoose.connection.close();
});

// Add stats to the dailyStats array
const updateCountriesToDB = async (updatedCountries) => {
  const countryNames = Object.keys(updatedCountries);
  await mapSeries(countryNames, async (countryName) => {
    await Country.findOneAndUpdate(
      { name: countryName },
      { $push: { dailyStats: updatedCountries[countryName] } },
      { new: true }
    );
  });

  return;
};

const getAllCountriesFromDB = async () => {
  let allCountries = await Country.find({});
  if (allCountries && allCountries.length > 100) {
    logger.info(`Got all countries from the DB`);
    return allCountries;
  }

  const names = await getCountryNames();
  let countryNames = names.countries;
  countryNames = countryNames.concat(extraCountries);
  await mapSeries(countryNames, async (countryName) => {
    const curatedCountryName = curateCountryName(countryName);
    await Country.findOneAndUpdate(
      { name: curatedCountryName.name },
      curatedCountryName,
      {
        upsert: true,
      }
    );
  });

  allCountries = await Country.find({});
  if (allCountries && allCountries.length <= 100) {
    logger.error(`Error getting all countries`);
    return null;
  }

  return allCountries;
};

const getAllDatesAvailableFromAPI = async () => {
  const worldDaily = await getWorldDaily();
  const allDatesAvailable = worldDaily.map((daily) => daily.reportDate);
  return allDatesAvailable;
};

/* Pipeline Stage 1: Combine all regions of a country */
const combineCountryRegions = (dailyStats) => {
  const staged = {};
  dailyStats.forEach(
    ({ countryRegion, lastUpdate, confirmed, deaths, recovered }) => {
      countryRegion = countryRegion.trim(); // ' Azerbaijan'
      confirmed = confirmed ? parseInt(confirmed) : 0;
      deaths = deaths ? parseInt(deaths) : 0;
      recovered = recovered ? parseInt(recovered) : 0;
      if (countryRegion in staged) {
        staged[countryRegion].confirmed += confirmed;
        staged[countryRegion].deaths += deaths;
        staged[countryRegion].recovered += recovered;
        staged[countryRegion].active += confirmed - recovered - deaths;
      } else {
        staged[countryRegion] = {
          lastUpdate,
          confirmed,
          deaths,
          recovered,
          active: confirmed - recovered - deaths,
        };
      }
    }
  );
  return staged;
};

const COUNTRY_NOT_FOUND = [];
const isCountryAlreadyMissed = (country) => {
  if (COUNTRY_NOT_FOUND.length <= 0) {
    return false;
  }
  const regex = new RegExp(COUNTRY_NOT_FOUND.join('|'), 'i');
  return regex.test(country);
};

/* Pipeline Stage 2: Combine all aliases of a country */
const comebineCountryAliases = (allCountries, staged, reportDate) => {
  const countryUpdated = {};
  const countryRegions = Object.keys(staged);
  countryRegions.forEach((countryRegion) => {
    const stats = staged[countryRegion];
    stats.reportDate = reportDate;
    const country = findCountry(allCountries, countryRegion);
    if (!country) {
      if (!isCountryAlreadyMissed(country)) {
        COUNTRY_NOT_FOUND.push(country);
        const errMsg = `${countryRegion} not found in the DB`;
        logger.error(errMsg);
      }

      // const errMsg = `${countryRegion} not found in the DB`;
      // logger.error(errMsg);
      // throw new Error(errMsg);
      return;
    }

    if (country.name in countryUpdated) {
      countryUpdated[country.name].confirmed += stats.confirmed;
      countryUpdated[country.name].recovered += stats.recovered;
      countryUpdated[country.name].deaths += stats.deaths;
      countryUpdated[country.name].active += stats.active;
    } else {
      countryUpdated[country.name] = stats;
    }
  });
  return countryUpdated;
};

const findCountry = (allCountries, countryRegion) => {
  return allCountries.find((country) => {
    if (country.aliases && country.aliases.length > 0) {
      const regex = new RegExp(country.aliases.join('|'), 'i');
      return (
        country.name.toUpperCase() === countryRegion.toUpperCase() ||
        regex.test(countryRegion)
      );
    } else {
      return country.name.toUpperCase() === countryRegion.toUpperCase();
    }
  });
};

const curateCountryName = ({ name, iso2, iso3 }) => {
  if (name === 'Bahamas') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['The Bahamas'],
    };
  }
  if (name === 'China') {
    return {
      name,
      iso2,
      iso3,
      aliases: [
        'Mainland China',
        'Hong Kong',
        'Hong Kong SAR',
        'Macau',
        'Macao SAR',
      ],
    };
  }
  if (name === 'Congo (Brazzaville)') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Republic of the Congo'],
    };
  }
  if (name === 'Iran') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Iran (Islamic Republic of)'],
    };
  }
  if (name === 'Ireland') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Republic of Ireland'],
    };
  }
  if (name === 'Korea, South') {
    return {
      name: 'South Korea',
      iso2,
      iso3,
      aliases: [name, 'Republic of Korea'],
    };
  }
  if (name === 'Moldova') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Republic of Moldova'],
    };
  }
  if (name === 'Russia') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Russian Federation'],
    };
  }
  if (name.match(/Taiwan/)) {
    return {
      name: 'Taiwan',
      iso2,
      iso3,
      aliases: ['Taiwan*', 'Taipei and environs'],
    };
  }
  if (name === 'United Kingdom') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['UK', 'North Ireland'],
    };
  }
  if (name === 'Vietnam') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Viet Nam'],
    };
  }

  return { name: name.trim(), iso2, iso3 };
};
