import Redis from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Get or create Redis connection
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required');
  }
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  redisClient.on('connect', () => {
  });

  redisClient.on('error', (err) => {
  });

  redisClient.on('close', () => {
  });

  return redisClient;
}

/**
 * Close Redis connection
 */
export function closeRedisConnection(): void {
  if (redisClient) {
    redisClient.disconnect();
    redisClient = null;
  }
}

