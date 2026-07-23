/**
 * Verifies the Cloudinary credentials before a deployment relies on them.
 *
 * Run with: npm run check:cloudinary
 *
 * Reads either CLOUDINARY_URL or the three CLOUDINARY_* variables, pings the
 * account and prints what it resolved. Never prints the API secret.
 */
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const url = process.env["CLOUDINARY_URL"];
const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
const apiKey = process.env["CLOUDINARY_API_KEY"];
const apiSecret = process.env["CLOUDINARY_API_SECRET"];

/** Cloudinary rejects with `{ error: { message, http_code } }`, not an Error. */
function reason(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (err && typeof err === "object") {
        const inner = (err as { error?: unknown }).error ?? err;
        if (inner && typeof inner === "object") {
            const { message, http_code } = inner as {
                message?: string;
                http_code?: number;
            };
            if (message) {
                return http_code ? `${message} (HTTP ${http_code})` : message;
            }
        }
        try {
            return JSON.stringify(err);
        } catch {
            return String(err);
        }
    }
    return String(err);
}

async function main(): Promise<void> {
    if (!url && !(cloudName && apiKey && apiSecret)) {
        console.error(
            "No Cloudinary configuration found.\n" +
                "Set CLOUDINARY_URL, or all three of CLOUDINARY_CLOUD_NAME, " +
                "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, in backend/.env"
        );
        process.exitCode = 1;
        return;
    }

    if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
        console.log("Using the three CLOUDINARY_* variables.");
    } else {
        cloudinary.config({ secure: true });
        console.log("Using CLOUDINARY_URL.");
    }

    const config = cloudinary.config();
    console.log(`  cloud name : ${config.cloud_name}`);
    console.log(`  api key    : ${config.api_key}`);
    console.log(`  api secret : ${config.api_secret ? "set (hidden)" : "MISSING"}`);

    try {
        const res = (await cloudinary.api.ping()) as { status?: string };
        console.log(`\nCloudinary reachable — status: ${res.status ?? "ok"}`);
        console.log("Credentials are valid. Uploads will go to Cloudinary.");
    } catch (err) {
        console.error(`\nCloudinary rejected the credentials: ${reason(err)}`);
        console.error(
            "Check the cloud name, API key and secret in your Cloudinary dashboard."
        );
        process.exitCode = 1;
    }
}

void main();
