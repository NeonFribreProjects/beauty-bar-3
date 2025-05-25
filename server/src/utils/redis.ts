import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = new Redis(REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`Retrying Redis connection... Attempt ${times}`);
    return delay;
  },
  maxRetriesPerRequest: 5,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export const redis = redisClient; 