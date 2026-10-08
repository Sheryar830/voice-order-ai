import { createLiveSessionToken } from "../services/gemini.service.js";

export async function createSession(_request, response, next) {
  try {
    const session = await createLiveSessionToken();

    response.status(201).json({
      success: true,
      ...session,
    });
  } catch (error) {
    next(error);
  }
}
