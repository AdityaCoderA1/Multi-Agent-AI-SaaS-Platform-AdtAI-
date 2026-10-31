import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCredentials() {
  // Option 1: Load from environment variable (JSON string or Base64)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      if (raw.startsWith("{")) {
        return JSON.parse(raw);
      }
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
    }
  }

  // Option 2: Load from local serviceAccount.json file if present
  const serviceAccountPath = path.resolve(__dirname, "../serviceAccount.json");
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const fileData = fs.readFileSync(serviceAccountPath, "utf-8");
      return JSON.parse(fileData);
    } catch (e) {
      console.error("Failed to read serviceAccount.json file:", e.message);
    }
  }

  console.warn(
    "[Firebase Warning] No serviceAccount.json found and FIREBASE_SERVICE_ACCOUNT_KEY not set. Provide credentials via .env or serviceAccount.json."
  );
  return null;
}

const credentials = getCredentials();

export const app = credentials
  ? (getApps().length === 0 ? initializeApp({ credential: cert(credentials) }) : getApp())
  : null;