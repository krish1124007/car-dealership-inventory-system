// Loaded by Jest (setupFiles) before any test module is imported.
import "dotenv/config";

process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
process.env.ADMIN_REGISTRATION_SECRET ??= "test-admin-secret";

// Always run the suite against a dedicated test database so the per-test
// wipes can never touch development data.
process.env.MONGODB_URI =
    process.env.MONGODB_URI_TEST ??
    "mongodb://127.0.0.1:27017/car_dealership_test";
