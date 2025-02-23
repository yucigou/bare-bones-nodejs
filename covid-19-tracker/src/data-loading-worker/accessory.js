const { covid19 } = require('config');
const logger = require('../utils/logger');
const { getCountryNames, getDailyStats } = require('../api/covid19');
const {
  getAllCountries,
  getLatestReportDate,
  updateCountriesToDB,
  updateMetadata,
} = require('../data-accessor');
const sendMail = require('../utils/email');
const {
  processNewCountryName,
  handleSpecialRegions,
} = require('../utils/country');
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

  if (new Date(nextDateToReport) > new Date(reportDate)) {
    logger.info(
      `Job redundant: next date ${nextDateToReport} > asked date ${reportDate}`
    );
    return;
  }

  while (new Date(nextDateToReport) <= new Date(reportDate)) {
    await addSingleDailyStats(nextDateToReport);
    nextDateToReport = getNextDate(nextDateToReport);
  }
};

const addSingleDailyStats = async (reportDate) => {
  logger.info(`Start to add stats for ${reportDate}`);
  const allCountries = await getAllCountriesFromDB();
  const dailyStats = await getDailyStats(reportDate);
  if (!dailyStats || dailyStats.length <= 0) {
    logger.warn(`No daily stats available from mathdro for ${reportDate}`);
    return;
  }
  const staged = combineCountryRegions(allCountries, dailyStats);
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
  if (allCountries && allCountries.length <= 100) {
    logger.error(`Error getting all countries`);
    return null;
  }

  return allCountries;
};

/* Pipeline Stage 1: Combine all regions of a country and also keep all regions*/
const combineCountryRegions = (allCountries, dailyStats) => {
  const staged = {};
  dailyStats.forEach((daily) => {
    let {
      provinceState,
      countryRegion,
      lastUpdate,
      confirmed,
      deaths,
      recovered,
    } = daily;
    provinceState =
      daily[Object.keys(daily).find((p) => p.match(/provinceState/))];
    provinceState = provinceState ? provinceState.trim() : '';
    countryRegion = countryRegion ? countryRegion.trim() : '';

    confirmed = confirmed ? parseInt(confirmed) : 0;
    deaths = deaths ? parseInt(deaths) : 0;
    recovered = recovered ? parseInt(recovered) : 0;

    if (countryRegion in staged) {
      staged[countryRegion].confirmed += confirmed;
      staged[countryRegion].deaths += deaths;
      staged[countryRegion].recovered += recovered;
      staged[countryRegion].active += confirmed - recovered - deaths;
    } else {
      if (countryRegion) {
        staged[countryRegion] = {
          lastUpdate,
          confirmed,
          deaths,
          recovered,
          active: confirmed - recovered - deaths,
        };
      } else {
        logger.warn(
          `countryRegion not defined for provinceState ${provinceState}`
        );
      }
    }

    if (
      provinceState &&
      countryRegion &&
      !countryRegion.match(/Taiwan/i) &&
      !countryRegion.match(/Taipei/i)
    ) {
      let combinedKey;
      let country = findCountry(allCountries, countryRegion);
      if (country) {
        combinedKey = `${provinceState}, ${country.name}`;
      } else {
        combinedKey = `${provinceState}, ${countryRegion}`;
      }
      staged[combinedKey] = {
        lastUpdate,
        confirmed,
        deaths,
        recovered,
        active: confirmed - recovered - deaths,
      };
    }
  });
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
      logger.info(`${countryRegion} not found in the DB. Add it new.`);
      // sendMail({
      //   subject: process.env.PROCESSOR || 'Default - Seeding',
      //   text: warning,
      // });
      country = {
        name: countryRegion,
        newlyAdded: true,
      };
      country = handleSpecialRegions(country);
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
        iso2: country.iso2,
        icon: country.icon,
        code: country.code,
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
