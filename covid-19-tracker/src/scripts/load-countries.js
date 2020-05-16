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
const {
  extraCountries,
  curateCountryName,
  processNewCountryName,
} = require('../utils/country');

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
    await updateCountriesToDB(allCountries, updatedCountries, reportDate);
    logger.info(`Finish adding stats for ${reportDate}`);
  });

  mongoose.connection.close();
});

const findReportDate = (allCountries, countryName, reportDate) => {
  return allCountries.find((c) => {
    if (c.name.toUpperCase() === countryName.toUpperCase()) {
      if (c.dailyStats) {
        return c.dailyStats.find((stats) => stats.reportDate === reportDate);
      }
    }
    return false;
  });
};

// Add stats to the dailyStats array
const updateCountriesToDB = async (
  allCountries,
  updatedCountries,
  reportDate
) => {
  const countryNames = Object.keys(updatedCountries);
  await mapSeries(countryNames, async (countryName) => {
    if (!findReportDate(allCountries, countryName, reportDate)) {
      if (updatedCountries[countryName].newlyAdded) {
        await Country.findOneAndUpdate(
          { name: countryName },
          {
            $set: { newlyAdded: true },
            $push: { dailyStats: updatedCountries[countryName].stats },
          },
          { upsert: true }
        );
      } else {
        await Country.findOneAndUpdate(
          { name: countryName },
          { $push: { dailyStats: updatedCountries[countryName].stats } },
          { upsert: true }
        );
      }
    }
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

/* Pipeline Stage 2: Combine all aliases of a country */
const comebineCountryAliases = (allCountries, staged, reportDate) => {
  const countryUpdated = {};
  const countryRegions = Object.keys(staged);
  countryRegions.forEach((countryRegion) => {
    const stats = staged[countryRegion];
    stats.reportDate = reportDate;
    let country = findCountry(allCountries, countryRegion);
    if (!country) {
      logger.warn(`${countryRegion} not found in the DB`);
      country = {
        name: processNewCountryName(countryRegion),
        newlyAdded: true,
      };
    }

    if (country.name in countryUpdated) {
      countryUpdated[country.name].stats.confirmed += stats.confirmed;
      countryUpdated[country.name].stats.recovered += stats.recovered;
      countryUpdated[country.name].stats.deaths += stats.deaths;
      countryUpdated[country.name].stats.active += stats.active;
    } else {
      countryUpdated[country.name] = { newlyAdded: country.newlyAdded, stats };
    }
  });
  return countryUpdated;
};

const findCountry = (allCountries, countryRegion) => {
  return allCountries.find((country) => {
    if (country.aliases) {
      return (
        country.name.toUpperCase() === countryRegion.toUpperCase() ||
        country.aliases.find(
          (alias) => alias.toUpperCase() === countryRegion.toUpperCase()
        )
      );
    } else {
      return country.name.toUpperCase() === countryRegion.toUpperCase();
    }
  });
};
