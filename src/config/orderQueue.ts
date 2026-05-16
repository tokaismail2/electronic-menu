import Bull from 'bull';
import Redis from 'ioredis';

// Prefer explicit REDIS_URL from environment
const redisUrl = process.env.REDIS_URL;


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

// Queue config
export const orderQueue = new Bull('order-status-queue', {
    createClient: createRedisClient,

    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
    },
});
