// Question : Pourquoi créer un module séparé pour les connexions aux bases de données ?
// Réponse :

/*
Séparer la connexion à la base de données dans un module distinct permet une meilleure réutilisation du code à travers l'application,
facilite la maintenance en centralisant la configuration à un seul endroit, et améliore l'organisation du code en séparant clairement
les responsabilités. Cette approche modulaire rend le code plus propre et plus facile à gérer.
*/

// Question : Comment gérer proprement la fermeture des connexions ?
// Réponse :

/*
Pour gérer proprement la fermeture des connexions, il faut s'assurer de fermer la connexion à la base de données lorsque
l'application s'arrête. Cela se fait en écoutant les signaux de fermeture de l'application et en fermant proprement la
connexion avant que le programme ne se termine.
*/

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
