const { getAllCountryNames } = require('../../data-accessor');
const countries = require('../countries');

const main = async () => {
  const countryNames = await getAllCountryNames();
  countryNames.forEach((countryName) => {
    const found = countries.find(
      (country) => country.iso2 === countryName.iso2
    );
    if (!found) {
      console.log(`${countryName.name} does not exist in the countries file`);
      if (countryName.iso2) {
        console.error(
          `Error: ${countryName.name} with code ${countryName.iso2} does not exist in the countries file`
        );
      }
    }
  });
};

main();
