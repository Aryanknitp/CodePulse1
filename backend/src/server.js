import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { startScheduler } from "./jobs/scheduler.js";

const PORT = env.port;

// 1. Ek async function banayein server start karne ke liye
async function startServer() {
  try {
    // Database connect karein
    const dbConnected = await connectDatabase();
    if (dbConnected) {
      console.log("[server] Database connected successfully.");
    }

    // Root route setup
    app.get("/", (req, res) => {
      res.send("Backend is up and running smoothly!");
    });

    // Server listen start karein
    app.listen(PORT, () => {
      console.log(`[server] API listening on port ${PORT}`);
    });

    // Scheduler start karein
    startScheduler();
  } catch (error) {
    console.error("[server] Failed to start server:", error);
    process.exit(1); // Server crash hone par exit karein taaki Render ko pata chale
  }
}

// 2. Server ko invoke karein
startServer();
