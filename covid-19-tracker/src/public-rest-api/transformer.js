const transformCountryList = (countryList) => {
  return countryList.map((country) => country.name);
};

const sortDailyStats = ({ name, dailyStats }) => {
  return {
    name,
    dailyStats: dailyStats.sort((a, b) =>
      a.dailyStats > b.dailyStats ? -1 : 1
    ),
  };
};

module.exports = { transformCountryList, sortDailyStats };
