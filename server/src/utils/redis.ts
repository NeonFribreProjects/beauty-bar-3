import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    // Retry connection up to 3 times
    if (times > 3) {
      return null;
    }
    return Math.min(times * 50, 2000);
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
}); 