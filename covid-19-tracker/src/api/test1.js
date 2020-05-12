const { getSummary, getDailyStats } = require('./covid19');

(async () => {
  const summary = await getSummary();
  console.log('Summary: ', summary);
})();

(async () => {
  const dailyStats = await getDailyStats('04-30-2020');
  console.log('dailyStats: ', dailyStats);
})();
