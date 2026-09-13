import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("[db] Using existing MongoDB connection");
    return true; // ✅ Explicitly return true
  }

  mongoose.connection.on("connected", () => {
    isConnected = true;
    console.log("[db] MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    isConnected = false;
    console.error("[db] MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.log("[db] MongoDB disconnected");
  });

  try {
    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(env.mongodbUri, options);
    isConnected = true; // ✅ Ensure status is set immediately
    return true; // ✅ Return true on successful connection
  } catch (error) {
    console.error(
      "[db] Critical error during initial database connection:",
      error,
    );
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  if (!isConnected) {
    console.log("[db] No active connection to disconnect");
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
  } catch (error) {
    console.error("[db] Error while disconnecting from MongoDB:", error);
  }
}
