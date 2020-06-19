require('dotenv').config();

module.exports = {
  mongodb: {
    uris: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}?authSource=admin`,
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      poolSize: 10,
    },
  },
  queue: {
    modelName: 'payload',
    workerId: 'data-loading-worker',
    options: {
      queueCollection: 'queue',
      blockDuration: 300000,
      maxRetries: 5,
    },
  },
  country: {
    modelName: 'country',
  },
  processor: {
    dataLoader: 'Data_Loader',
    dataAccess: 'DB_Accesser',
    webService: 'Web_Service',
    jobCrontab: 'Job_Crontab',
    seedCountry: 'SeedCountry',
    default: 'Default LOG',
  },
  logger: {
    level: 'debug',
  },
  covid19: {
    earliestReportDate: '2020-01-22',
  },
  memcached: {
    expires: 600,
    cacheNames: {
      allCountryNames: 'AllCountryNames',
      countryDailyStats: 'CountryDailyStats',
      latestDailyStats: 'LatestDailyStats',
      latestReportDate: 'LatestReportDate',
      passedStats: 'PassedStats',
    },
  },
  publicApi: {
    passedPeriod: {
      day: 'day',
      week: 'week',
      month: 'month',
      alltime: 'alltime',
    },
  },
};
