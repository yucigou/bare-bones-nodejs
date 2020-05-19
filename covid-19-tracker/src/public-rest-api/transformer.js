const logger = require('../utils/logger');
const transformCountryList = (countryList) => {
  return countryList.map((country) => country.name);
};

const sortDailyStats = ({ name, dailyStats }) => {
  return {
    name,
    dailyStats: dailyStats.sort((a, b) =>
      a.reportDate > b.reportDate ? 1 : -1
    ),
  };
};

const transformLatestDailyStats = (statsList) => {
  return statsList.map(({ name, latestReportDate }) => {
    if (latestReportDate) {
      const {
        confirmed,
        deaths,
        recovered,
        active,
        reportDate,
      } = latestReportDate;
      return { name, confirmed, deaths, recovered, active, reportDate };
    } else {
      logger.error(`No updated stats for ${name}`);
      return { name };
    }
  });
};

module.exports = {
  sortDailyStats,
  transformCountryList,
  transformLatestDailyStats,
};
