import "dotenv/config";
import mongoose from "mongoose";

async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        // Exiting is the clearest signal locally, but on Vercel it would kill
        // the whole instance over a transient Atlas hiccup — rethrow there and
        // let the caller log it so the next request can retry.
        if (process.env["VERCEL"]) throw error;
        process.exit(1);
    }
}

async function disconnectDB(): Promise<void> {
    await mongoose.disconnect();
}

export { mongoose, connectDB, disconnectDB };
