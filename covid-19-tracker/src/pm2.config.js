const pm2Config = {
  apps: [
    {
      name: 'dataLoadingWorker',
      script: './src/data-loading-worker/index.js',
      exec_mode: 'cluster_mode',
      instances: 1,
      env: {
        APP_NAME: 'dataLoadingWorker',
      },
    },
    {
      name: 'jobScheduler',
      script: './src/job-scheduler/index.js',
      exec_mode: 'cluster_mode',
      instances: 1,
      env: {
        APP_NAME: 'jobScheduler',
      },
    },
    {
      name: 'webService',
      script: './src/public-rest-api/index.js',
      exec_mode: 'cluster_mode',
      instances: 1,
      env: {
        APP_NAME: 'webService',
      },
    },
  ],
};

module.exports = pm2Config;
