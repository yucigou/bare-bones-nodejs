require('dotenv').config();

module.exports = {
  mongodb: {
    uris: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/covid19?authSource=admin`,
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
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
    default: 'Default LOG',
  },
  logger: {
    labels: [],
  },
};
