const reportDateRegExp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

// See {"reportDate": "2020-04-29"} in the response of API https://covid19.mathdro.id/api/daily
// reportDate will be used to call API https://covid19.mathdro.id/api/daily/2020-04-29
const isReportDateValid = (reportDate) => {
  return reportDateRegExp.test(reportDate);
};

module.exports = {
  isReportDateValid,
};
