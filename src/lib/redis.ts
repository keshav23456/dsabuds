import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 200, 5000),
  });

  let loggedError = false;

  client.on("connect", () => {
    loggedError = false;
    console.log("✅ Redis Connected");
  });

  client.on("error", (err) => {
    if (!loggedError) {
      console.error("Redis Error:", err.message);
      loggedError = true;
    }
  });

  return client;
}

const redisClient = globalForRedis.redisClient ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redisClient;
}

export default redisClient;
