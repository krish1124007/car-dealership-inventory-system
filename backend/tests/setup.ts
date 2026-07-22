// Loaded by Jest (setupFiles) before any test module is imported.
// Provides safe defaults for env vars the app reads, without overriding
// values already supplied by .env or the shell.
import "dotenv/config";

process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
