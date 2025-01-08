// Question: Pourquoi est-il important de valider les variables d'environnement au démarrage ?
// Réponse :
// Question: Que se passe-t-il si une variable requise est manquante ?
// Réponse :

const dotenv = require("dotenv");
dotenv.config();

const requiredEnvVars = ["MONGODB_URI", "MONGODB_DB_NAME", "REDIS_URI"];

function validateEnv() {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env file or environment configuration."
    );
  }
}

validateEnv();

module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
  },
  redis: {
    uri: process.env.REDIS_URI,
  },
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || "development",
};
