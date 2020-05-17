const { getPopulation, getCountryNames } = require('../population');

(async () => {
  const population = await getPopulation('India');
  console.log('Population: ', population);
})();

(async () => {
  const countryNames = await getCountryNames();
  console.log('countryNames: ', countryNames);
})();
