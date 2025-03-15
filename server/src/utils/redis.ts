import Redis from 'ioredis';

// Add console.log to debug the URL being used
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
console.log('Connecting to Redis at:', redisUrl);

export const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    // Retry connection up to 3 times
    if (times > 3) {
      return null;
    }
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 3
});

// Add error handling
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
}); 