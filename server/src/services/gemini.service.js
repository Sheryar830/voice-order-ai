import { GoogleGenAI, Modality } from "@google/genai";
import { env } from "../config/env.js";

export const LIVE_MODEL = "gemini-3.8-live";

const SESSION_START_WINDOW_MS = 60 * 1000;
const TOKEN_LIFETIME_MS = 30 * 60 * 1000;

function createServiceError(message, statusCode, code, cause) {
  const error = new Error(message, { cause });
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export async function createLiveSessionToken() {
  if (!env.geminiApiKey) {
    throw createServiceError(
      "Gemini API is not configured",
      503,
      "GEMINI_NOT_CONFIGURED",
    );
  }

  const now = Date.now();
  const client = new GoogleGenAI({ apiKey: env.geminiApiKey });

  try {
    const authToken = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + TOKEN_LIFETIME_MS).toISOString(),
        newSessionExpireTime: new Date(
          now + SESSION_START_WINDOW_MS,
        ).toISOString(),
        liveConnectConstraints: {
          model: LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
          },
        },
        lockAdditionalFields: [],
      },
    });

    if (!authToken.name) {
      throw new Error("Gemini returned an empty ephemeral token");
    }

    return {
      token: authToken.name,
      model: LIVE_MODEL,
      expireTime: authToken.expireTime,
      newSessionExpireTime: authToken.newSessionExpireTime,
    };
  } catch (error) {
    throw createServiceError(
      "Unable to create Gemini Live session",
      502,
      "GEMINI_SESSION_FAILED",
      error,
    );
  }
}
