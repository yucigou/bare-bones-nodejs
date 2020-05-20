const allCountries = require('../resource/countries');
const processNewCountryName = (name) => name.trim();

const curateCountryName = (countryName) => {
  const { name } = countryName;
  if (name === 'Bahamas') {
    countryName.aliases.push('The Bahamas');
    countryName.aliases.push('Bahamas, The');
    return countryName;
  }
  if (name === 'China') {
    countryName.aliases.push('Mainland China');
    countryName.aliases.push('Hong Kong');
    countryName.aliases.push('Hong Kong SAR');
    countryName.aliases.push('Macao');
    countryName.aliases.push('Macao SAR');
    countryName.aliases.push('Macau');
    countryName.aliases.push('Macau SAR');
    return countryName;
  }
  if (name === 'Congo (Brazzaville)') {
    countryName.aliases.push('Republic of the Congo');
    return countryName;
  }
  if (name === 'Gambia') {
    countryName.aliases.push('The Gambia');
    countryName.aliases.push('Gambia, The');
    return countryName;
  }
  if (name === 'Iran, Islamic Republic of') {
    countryName.aliases.push('Iran (Islamic Republic of)');
    return countryName;
  }
  if (name === 'Ireland') {
    countryName.aliases.push('Republic of Ireland');
    return countryName;
  }
  if (name === 'Holy See (Vatican City State)') {
    countryName.aliases.push('Vatican City');
    countryName.aliases.push('Holy See');
    return countryName;
  }
  if (name === 'Korea, Republic of') {
    countryName.aliases.push('South Korea');
    countryName.aliases.push('Republic of Korea');
    return countryName;
  }
  if (name === 'Moldova') {
    countryName.aliases.push('Republic of Moldova');
    return countryName;
  }
  if (name === 'Palestine') {
    countryName.aliases.push('Palestinian');
    countryName.aliases.push('occupied Palestinian territory');
    return countryName;
  }
  if (name === 'Saint Martin (French part)') {
    countryName.aliases.push('Saint Martin');
    countryName.aliases.push('St. Martin');
    return countryName;
  }
  if (name.match(/Taiwan/)) {
    countryName.name = 'Taiwan, Republic of China';
    countryName.aliases.push('Taiwan');
    countryName.aliases.push('Taiwan*');
    countryName.aliases.push('Taipei and environs');
    countryName.aliases.push('Taiwan, Province of China');
    return countryName;
  }
  if (name === 'Timor-Leste') {
    countryName.aliases.push('East Timor');
    return countryName;
  }
  if (name === 'United Kingdom') {
    countryName.aliases.push('UK');
    countryName.aliases.push('North Ireland');
    return countryName;
  }
  if (name === 'United States') {
    countryName.aliases.push('USA');
    return countryName;
  }
  if (name === 'Vietnam') {
    countryName.aliases.push('Viet Nam');
    return countryName;
  }

  return countryName;
};

const handleSpecialRegions = (country) => {
  let region;
  if (country.name.match(/Macau/i)) {
    region = allCountries.find((c) => c.name === 'Macao');
  } else if (country.name.match(/Hong Kong/i)) {
    region = allCountries.find((c) => c.name === 'Hong Kong');
  } else if (country.name.match(/Taiwan/i)) {
    region = allCountries.find((c) => c.name === 'Taiwan');
  }

  if (region) {
    country.icon = region.icon;
    country.iso2 = region.iso2;
    country.code = region.code;
    return country;
  }

  return country;
};

const curateCountryNames = (countryNames) => {
  return countryNames.map((countryName) => curateCountryName(countryName));
};

module.exports = {
  curateCountryNames,
  processNewCountryName,
  handleSpecialRegions,
};
