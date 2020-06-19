'use strict';
const logger = require('../utils/logger');
const {
  conn,
  getAllCountries,
  saveCountryNames,
  updateWorldDaily,
} = require('../data-accessor');
const { addDailyStats } = require('../data-loading-worker/accessory');
const { getWorldDailyReportFromAPI } = require('../utils/date');
const allCountries = require('../resource/countries');
const { getCountryNames } = require('../api/covid19');
const { curateCountryNames } = require('../utils/country');

const main = async () => {
  logger.info('Connected to the DB');
  await seedCountries();
  await seedStats();
  logger.info(`Closing DB connection`);
  await conn.close();
  logger.info(`Finished seeding`);
  process.exit();
};

const seedStats = async () => {
  let { latestReportDate, worldDaily } = await getWorldDailyReportFromAPI();
  await updateWorldDaily(worldDaily);

  // latestReportDate = '2020-03-11';
  // latestReportDate = '2020-01-22';
  logger.info(
    `To fill up to the current latest report date ${latestReportDate}`
  );
  await addDailyStats(latestReportDate);
};

const seedCountries = async () => {
  let countriesInDB = await getAllCountries();
  if (countriesInDB && countriesInDB.length >= allCountries.length) {
    logger.info(`Seems countries have been seeded in the DB. Skip.`);
    return;
  }

  // Get all countries from countries file
  const countries = allCountries.map((c) => {
    c.aliases = [];
    return c;
  });
  // Get all countries from mathdro, if iso2 matches abbr but names do not match, add as aliases
  const names = await getCountryNames();
  let countryNames = names.countries;
  countryNames.forEach(({ name, iso2 }) => {
    if (!iso2) {
      countries.push({ name: name.trim(), aliases: [] });
    } else {
      let country = countries.find(
        (c) => c.iso2.toUpperCase() === iso2.toUpperCase()
      );
      if (country) {
        if (country.name.trim().toUpperCase() !== name.trim().toUpperCase()) {
          country.aliases.push(name.trim());
        }
      }
    }
  });
  // Curate country names
  const curatedCountryNames = curateCountryNames(countries);
  // Save to the DB
  await saveCountryNames(curatedCountryNames);
};

main();
