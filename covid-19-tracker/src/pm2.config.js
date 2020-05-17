const pm2Config = {
  apps: [
    {
      name: 'dataLoadingWorker',
      script: './src/data-loading-worker/index.js',
      exec_mode: 'cluster_mode',
      instances: 1,
      env: {
        PROCESSOR: 'Data_Loader',
      },
    },
    {
      name: 'jobScheduler',
      script: './src/job-scheduler/index.js',
      exec_mode: 'cluster_mode',
      instances: 1,
      env: {
        PROCESSOR: 'Job_Crontab',
      },
    },
    {
      name: 'webService',
      script: './src/public-rest-api/index.js',
      exec_mode: 'cluster_mode',
      instances: 1,
      env: {
        PROCESSOR: 'Web_Service',
      },
    },
  ],
};

module.exports = pm2Config;
