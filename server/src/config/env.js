import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const envFilePath = fileURLToPath(new URL("../../.env", import.meta.url));

dotenv.config({ path: envFilePath, quiet: true });

const DEFAULT_PORT = 5000;
const DEFAULT_CLIENT_URL = "http://localhost:5173";

function parsePort(value) {
  const port = Number.parseInt(value ?? DEFAULT_PORT, 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function parseClientUrl(value) {
  const clientUrl = value || DEFAULT_CLIENT_URL;

  try {
    return new URL(clientUrl).origin;
  } catch {
    throw new Error("CLIENT_URL must be a valid absolute URL");
  }
}

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  clientUrl: parseClientUrl(process.env.CLIENT_URL),
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || "",
  nodeEnv: process.env.NODE_ENV || "development",
});

export function validateServerConfig() {
  console.log(`GEMINI_API_KEY configured: ${Boolean(env.geminiApiKey)}`);

  if (!env.geminiApiKey) {
    console.warn(
      "GEMINI_API_KEY is not configured. Health routes remain available, but session creation is disabled.",
    );
  }
}
