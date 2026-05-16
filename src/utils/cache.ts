import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export const remember = async <T>(key: string, fn: () => Promise<T>, ttl = 300): Promise<T> => {
  try {
    const client = getRedisClient();
    const cached = await client.get(key);

    if (cached) {
      return JSON.parse(cached);
    }
    const result = await fn();
    const serialized = JSON.stringify(result);

    if (ttl > 0) {
      await client.setex(key, ttl, serialized);
    } else {
      await client.set(key, serialized); // No expiration
    }

    return result;
  } catch (error) {
    return fn(); // fallback
  }
};

export const recall = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logger.error(error, `Error recalling cache key ${key}:`);
    return null;
  }
};


export const rememberForever = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  return remember(key, fn, 0);
};


export const forget = async (key: string) => {
  try {
    const client = getRedisClient();
    await client.del(key);
    logger.debug(`Cache forgotten: ${key}`);
  } catch (error) {
    logger.error(error, `Error forgetting cache key ${key}:`);
  }
};


export const flush = async () => {
  try {
    const client = getRedisClient();
    await client.flushdb();
    logger.debug('Cache flushed');
  } catch (error) {
    logger.error(error, 'Error flushing cache:');
  }
};


export const exists = async (key: string) => {
  try {
    const client = getRedisClient();
    return (await client.exists(key)) === 1;
  } catch (error) {
    logger.error(error, `Error checking cache key ${key}:`);
    return false;
  }
};


export const getTTL = async (key: string) => {
  try {
    const client = getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    logger.error(error, `Error getting TTL for key ${key}:`);
    return -2;
  }
};

export const set = async (key: string, value: any, ttl: number | null = null) => {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);

    if (ttl && ttl > 0) {
      await client.setex(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }

    logger.debug(`Cache set: ${key}`);
  } catch (error) {
    logger.error(error, `Error setting cache key ${key}:`);
  }
};


export const get = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logger.error(error, `Error getting cache key ${key}:`);
    return null;
  }
};



