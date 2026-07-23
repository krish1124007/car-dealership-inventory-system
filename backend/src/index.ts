// Must be the first import: ESM imports are hoisted, so app.ts (which reads
// CORS_ORIGIN at module load) would otherwise evaluate before .env is loaded.
import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import { ensureDemoAccounts } from "./utils/ensureDemoAccounts.js";

const port = process.env.PORT || 3000;

// Connect in the background rather than awaiting: Mongoose buffers queries
// until the connection is ready, so the server can start listening straight
// away. Vercel detects the HTTP server from the listen() call during module
// startup, so it must not be deferred inside a promise chain.
connectDB()
    .then(ensureDemoAccounts)
    .catch((err) => {
        console.error("Database startup failed", err);
    });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
