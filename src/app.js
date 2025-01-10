const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("./config/env");
const db = require("./config/db");

const courseRoutes = require("./routes/courseRoutes");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

async function startServer() {
  try {
    // Initialization au connexion au bases de sonnées
    await db.connectMongo();
    await db.connectRedis();

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(limiter);

    // Routes
    app.use("/api/courses", courseRoutes);

    // Gestion des exception
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        error: "Something went wrong!",
      });
    });

    // Start server
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// fermeture des connexion au cas d'arret de serveur
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Starting graceful shutdown...");
  try {
    await db.closeConnections();
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

startServer();
