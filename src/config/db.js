const { MongoClient } = require("mongodb");
const redis = require("redis");
const config = require("./env");

let mongoClient, redisClient, db;

async function connectMongo() {
  try {
    mongoClient = new MongoClient(config.mongodb.uri, {
      maxPoolSize: 50,
      connectTimeoutMS: 5000,
      retryWrites: true,
    });

    await mongoClient.connect();
    db = mongoClient.db(config.mongodb.dbName);
    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

async function connectRedis() {
  try {
    redisClient = redis.createClient({
      url: config.redis.uri,
    });

    redisClient.on("error", (error) => {
      console.error("Redis Client Error:", error);
    });

    await redisClient.connect();
    console.log("Redis connected successfully");
    return redisClient;
  } catch (error) {
    console.error("Redis connection error:", error);
    throw error;
  }
}

async function closeConnections() {
  try {
    if (mongoClient) await mongoClient.close();
    if (redisClient) await redisClient.quit();
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error);
    throw error;
  }
}

module.exports = {
  connectMongo,
  connectRedis,
  closeConnections,
  getDb: () => db,
  getRedisClient: () => redisClient,
};
