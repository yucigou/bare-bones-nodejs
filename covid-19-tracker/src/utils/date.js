const { covid19 } = require('config');
const { getWorldDaily } = require('../api/covid19');
const reportDateRegExp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

// See {"reportDate": "2020-04-29"} in the response of API https://covid19.mathdro.id/api/daily
// reportDate will be used to call API https://covid19.mathdro.id/api/daily/2020-04-29
const isReportDateValid = (reportDate) => {
  return reportDateRegExp.test(reportDate);
};

const formatDate = (date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const getToday = () => {
  const today = new Date();
  return formatDate(today);
};

const getTheDayBeforeYesterday = (today) => {
  const date = new Date(today);
  date.setDate(date.getDate() - 2);
  return formatDate(date);
};

const isDateAcceptable = (date) => {
  if (!isReportDateValid(date)) {
    return false;
  }
  const todayDate = getToday();
  return new Date(date) <= new Date(todayDate);
};

const getNextDate = (reportDate) => {
  const date = new Date(reportDate);
  date.setDate(date.getDate() + 1);
  return formatDate(date);
};

const getWorldDailyReportFromAPI = async () => {
  const worldDaily = await getWorldDaily();
  const latestRecord = worldDaily.reduce(
    (a, b) => {
      return a.reportDate > b.reportDate ? a : b;
    },
    { reportDate: covid19.earliestReportDate }
  );
  return {
    worldDaily,
    latestReportDate: latestRecord.reportDate,
  };
};

// ('2020-06-01', -1) => '2020-05-31'
const getShiftedDay = (baseDate, shifted) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + shifted);
  return formatDate(date);
};

// ('2020-01-17', -2) => '2019-11-17'
const getShiftedMonth = (baseDate, shifted) => {
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + shifted);
  return formatDate(date);
};

module.exports = {
  getShiftedDay,
  getShiftedMonth,
  getWorldDailyReportFromAPI,
  getNextDate,
  isDateAcceptable,
  isReportDateValid,
};
