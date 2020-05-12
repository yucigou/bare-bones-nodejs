const cron = require('node-cron');

cron.schedule('* * * * *', function () {
  console.log('Running a task every minute');
});
