const transformCountryList = (countryList) => {
  return countryList.map((country) => country.name);
};

module.exports = { transformCountryList };
