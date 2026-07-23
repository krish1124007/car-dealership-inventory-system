// Must be the first import: ESM imports are hoisted, so app.ts (which reads
// CORS_ORIGIN at module load) would otherwise evaluate before .env is loaded.
import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import { ensureDefaultAdmin } from "./utils/ensureAdmin.js";

const port = process.env.PORT || 3000;

connectDB().then(async () => {
    await ensureDefaultAdmin();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch((err) => {
        console.log("Error connecting to database", err);
    })
