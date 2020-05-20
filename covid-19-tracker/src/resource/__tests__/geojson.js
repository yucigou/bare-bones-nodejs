const countries = require('../countries');
const geojson = require('../world-geo');

const main = async () => {
  geojson.features.forEach((feature) => {
    let found = countries.find(
      (country) => country.iso2 === feature.properties.iso_a2
    );
    if (!found) {
      console.error(
        `Error: ${feature.properties.name} with code ${feature.properties.iso_a2} does not exist in the countries file`
      );
    }
  });
};

main();
