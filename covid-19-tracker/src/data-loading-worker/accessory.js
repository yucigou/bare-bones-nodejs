const { covid19 } = require('config');
const logger = require('../utils/logger');
const { getCountryNames, getDailyStats } = require('../api/covid19');
const {
  getAllCountries,
  getLatestReportDate,
  saveCountryNames,
  updateCountriesToDB,
  updateMetadata,
} = require('../data-accessor/index');
const sendMail = require('../utils/email');
const { extraCountries, processNewCountryName } = require('../utils/country');
const { isDateAcceptable, getNextDate } = require('../utils/date');

const addDailyStats = async (reportDate) => {
  if (!isDateAcceptable(reportDate)) {
    logger.warn(`Report date not acceptable: ${reportDate}`);
    return;
  }

  let nextDateToReport;
  const latestReportDate = await getLatestReportDate();
  if (latestReportDate) {
    nextDateToReport = getNextDate(latestReportDate);
  } else {
    nextDateToReport = covid19.earliestReportDate;
  }

  while (
    isDateAcceptable(nextDateToReport) &&
    new Date(nextDateToReport) <= new Date(reportDate)
  ) {
    await addSingleDailyStats(nextDateToReport);
    nextDateToReport = getNextDate(nextDateToReport);
  }
};

const addSingleDailyStats = async (reportDate) => {
  logger.info(`Start to add stats for ${reportDate}`);
  const allCountries = await getAllCountriesFromDB();
  const dailyStats = await getDailyStats(reportDate);
  const staged = combineCountryRegions(dailyStats);
  const updatedCountries = comebineCountryAliases(
    allCountries,
    staged,
    reportDate
  );
  await updateCountriesToDB(allCountries, updatedCountries, reportDate);
  await updateMetadata(reportDate);
  logger.info(`Finish adding stats for ${reportDate}`);
};

const getAllCountriesFromDB = async () => {
  let allCountries = await getAllCountries();
  if (allCountries && allCountries.length > 100) {
    logger.info(`Got all countries from the DB`);
    return allCountries;
  }

  // Not found, so seed it.
  const names = await getCountryNames();
  let countryNames = names.countries;
  countryNames = countryNames.concat(extraCountries);
  await saveCountryNames(countryNames);

  allCountries = await getAllCountries();
  if (allCountries && allCountries.length <= 100) {
    logger.error(`Error getting all countries`);
    return null;
  }

  return allCountries;
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
      const warning = `${countryRegion} not found in the DB`;
      logger.warn(warning);
      sendMail({
        subject: process.env.PROCESSOR || 'Default - Seeding',
        text: warning,
      });
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
      countryUpdated[country.name] = {
        newlyAdded: country.newlyAdded,
        stats,
        lastUpdate: stats.lastUpdate,
      };
    }
  });
  return countryUpdated;
};

// Find countryRegion in allCountries
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

module.exports = {
  addDailyStats,
};
