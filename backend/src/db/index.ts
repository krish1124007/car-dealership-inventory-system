import "dotenv/config";
import mongoose from "mongoose";

async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

async function disconnectDB(): Promise<void> {
    await mongoose.disconnect();
}

export { mongoose, connectDB, disconnectDB };
