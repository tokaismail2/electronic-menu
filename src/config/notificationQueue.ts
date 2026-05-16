import Bull from 'bull';
import Redis from 'ioredis';

// Prefer explicit REDIS_URL from environment (set in docker-compose). Fallback to service name 'redis'.
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const createRedisClient = (type: 'client' | 'subscriber' | 'bclient') => {
  const options = {
    enableReadyCheck: false,
    maxRetriesPerRequest: null as null,
  };

  if (redisUrl) {
    return (type === 'subscriber' || type === 'bclient')
      ? new Redis(redisUrl, options)
      : new Redis(redisUrl);
  }

  return new Redis({
    host: '127.0.0.1',
    port: 6379,
    ...options,
  });
};

export const notificationQueue = new Bull('notification', {
  createClient: createRedisClient,

  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  },
});

export async function addNotificationToQueue(
  phoneNumber: string,
  templateType: string,
  data: any,
  channel: string
) {
  await notificationQueue.add({
    receiver: phoneNumber,
    templateType,
    data,
    channel,
  });

  console.log(`📥 Notification queued → ${phoneNumber}`);
}



