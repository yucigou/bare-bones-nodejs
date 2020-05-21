const logger = require('../utils/logger');

const sortDailyStats = ({ name, dailyStats }) => {
  if (!dailyStats) {
    return { name, dailyStats };
  }
  return {
    name,
    dailyStats: dailyStats.sort((a, b) =>
      a.reportDate > b.reportDate ? 1 : -1
    ),
  };
};

const transformLatestDailyStats = (statsList) => {
  return statsList.map(({ name, iso2, latestReportDate }) => {
    if (latestReportDate) {
      const {
        confirmed,
        deaths,
        recovered,
        active,
        reportDate,
      } = latestReportDate;
      return { name, iso2, confirmed, deaths, recovered, active, reportDate };
    } else {
      logger.error(`No updated stats for ${name}`);
      return { name };
    }
  });
};

module.exports = {
  sortDailyStats,
  transformLatestDailyStats,
};
