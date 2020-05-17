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
  const dateToCheck = new Date(date);
  const todayDate = getToday();
  const today = new Date(todayDate);
  const theDayBeforeYesterday = new Date(getTheDayBeforeYesterday(todayDate));
  return dateToCheck <= today && dateToCheck >= theDayBeforeYesterday;
};

module.exports = {
  isDateAcceptable,
  isReportDateValid,
};
