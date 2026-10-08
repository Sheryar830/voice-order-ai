import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are VoiceOrder AI, a friendly restaurant voice ordering assistant.

Your job is to take a customer's food order.

Collect:
- item name
- quantity
- size when relevant
- additions/options
- special instructions

Rules:
1. Speak naturally and briefly.
2. Ask a short follow-up question if important information is missing.
3. Never invent food items.
4. Allow the customer to modify the order.
5. Before completing, summarize the entire order.
6. Ask the customer to confirm the order.
7. Do not complete the order before explicit confirmation.
8. After confirmation, call the complete_order function.
9. Do not read JSON aloud.

LANGUAGE BEHAVIOR:
- Detect the customer's spoken language.
- Understand English, Urdu, and mixed Urdu-English/Hinglish speech.
- Reply in the same language the customer uses.
- If speech is unclear, ask the customer to repeat instead of guessing.
- Do not invent or aggressively autocorrect unclear customer speech.
- If confidence seems low or the transcription is unclear, ask: "Sorry, could you repeat that?"
- Keep final JSON field names in English.
`;

const completeOrderTool = {
  functionDeclarations: [
    {
      name: "complete_order",
      description:
        "Call this only after the customer explicitly confirms the final restaurant order.",
      parametersJsonSchema: {
        type: "object",
        additionalProperties: false,
        required: ["customerIntent", "items", "status", "totalItems"],
        properties: {
          customerIntent: {
            type: "string",
            enum: ["place_order"],
          },
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "name",
                "quantity",
                "size",
                "includes",
                "specialInstructions",
              ],
              properties: {
                name: { type: "string" },
                quantity: { type: "integer", minimum: 1 },
                size: { type: "string" },
                includes: {
                  type: "array",
                  items: { type: "string" },
                },
                specialInstructions: { type: "string" },
              },
            },
          },
          status: {
            type: "string",
            enum: ["confirmed"],
          },
          totalItems: {
            type: "integer",
            minimum: 1,
          },
        },
      },
    },
  ],
};

export async function connectGeminiLive({
  token,
  model,
  onOpen,
  onClose,
  onError,
  onMessage,
}) {
  const ai = new GoogleGenAI({
    apiKey: token,
    httpOptions: {
      apiVersion: "v1alpha",
    },
  });

  const session = await ai.live.connect({
    model,
    callbacks: {
      onopen() {
        console.info("[VoiceOrder] Gemini Live connected");
        onOpen?.();
      },

      onmessage(message) {
        const content = message?.serverContent;
        const modelTurnParts = content?.modelTurn?.parts;

        const safeMessageDetails = {
          setupComplete: Boolean(message?.setupComplete),
          goAway: message?.goAway
            ? { timeLeft: message.goAway.timeLeft ?? null }
            : null,
          toolCall: message?.toolCall?.functionCalls?.map((call) => ({
            id: call.id ?? null,
            name: call.name ?? null,
          })) ?? null,
          interimInputTranscription:
            content?.interimInputTranscription ?? null,
          inputTranscription: content?.inputTranscription ?? null,
          outputTranscription: content?.outputTranscription ?? null,
          turnComplete: content?.turnComplete ?? false,
          generationComplete: content?.generationComplete ?? false,
          interrupted: content?.interrupted ?? false,
          modelTurnParts: modelTurnParts?.map((part) => ({
            hasText: Boolean(part.text),
            mimeType: part.inlineData?.mimeType ?? null,
            hasAudioData: Boolean(part.inlineData?.data),
          })) ?? null,
        };
        console.info(
          "[VoiceOrder] Gemini message details",
          JSON.stringify(safeMessageDetails),
        );
        onMessage?.(message);
      },

      onerror(event) {
        console.error(
          "[VoiceOrder] Gemini Live error",
          event?.type || "unknown",
        );
        onError?.(event);
      },

      onclose(event) {
        console.info(
          "[VoiceOrder] Gemini Live closed",
          event?.code ?? "unknown",
        );
        onClose?.(event);
      },
    },

    config: {
      responseModalities: [Modality.AUDIO],

      inputAudioTranscription: {},
      outputAudioTranscription: {},

      realtimeInputConfig: {
        automaticActivityDetection: {
          disabled: false,
          prefixPaddingMs: 300,
          silenceDurationMs: 700,
        },
      },

      systemInstruction: SYSTEM_INSTRUCTION,

      tools: [completeOrderTool],
    },
  });

  return session;
}
