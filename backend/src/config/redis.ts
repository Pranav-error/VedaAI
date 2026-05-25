import Redis from 'ioredis';

// Render (and Upstash) provide a REDIS_URL; fall back to host/port for local dev
const makeRedis = () =>
  process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, tls: process.env.REDIS_URL.startsWith('rediss') ? {} : undefined })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: null,
      });

export const redis = makeRedis();
export const redisSubscriber = makeRedis();

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));
