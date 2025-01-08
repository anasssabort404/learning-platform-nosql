// Question : Comment gérer efficacement le cache avec Redis ?
// Réponse :
// Question: Quelles sont les bonnes pratiques pour les clés Redis ?
// Réponse :

// Fonctions utilitaires pour Redis
const db = require("../config/db");

async function cacheData(key, data, ttl = 3600) {
  try {
    const serializedData = JSON.stringify(data);
    await db.getRedisClient().set(key, serializedData, {
      EX: ttl,
    });
  } catch (error) {
    console.error("Error caching data:", error);
    throw error;
  }
}

async function getCachedData(key) {
  try {
    const data = await db.getRedisClient().get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting cached data:", error);
    throw error;
  }
}

async function invalidateCache(key) {
  try {
    await db.getRedisClient().del(key);
  } catch (error) {
    console.error("Error invalidating cache:", error);
    throw error;
  }
}

module.exports = {
  cacheData,
  getCachedData,
  invalidateCache,
};
