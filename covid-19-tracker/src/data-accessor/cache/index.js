require('dotenv').config();
const memjs = require('memjs');
const { memcached } = require('config');
const logger = require('../../utils/logger');

const host = process.env.MEMCACHED_HOST || 'localhost';
const client = memjs.Client.create(`${host}:11211`);

const setCache = async (key, value) => {
  if (!key || !value) {
    logger.error(`Error setting cache. Empty key or value`);
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), {
      expires: memcached.expires,
    });
  } catch (error) {
    logger.error(`Error caching ${key}: ${error}`);
  }
};

const getCache = async (key) => {
  if (!key) {
    logger.error(`Error getting cache. Empty key`);
    return;
  }

  try {
    const cache = await client.get(key);
    if (cache && cache.value) {
      logger.info(`Got cache for ${key}`);
      return JSON.parse(cache.value.toString());
    }
  } catch (error) {
    logger.error(`Error getting cache ${key}: ${error}`);
  }
  return;
};

module.exports = {
  setCache,
  getCache,
};
