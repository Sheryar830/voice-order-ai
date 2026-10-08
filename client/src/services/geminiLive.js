import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are VoiceOrder AI, a friendly restaurant voice ordering assistant.

Your job is to take a customer's food order.

LANGUAGE BEHAVIOR:
- Detect the customer's spoken language automatically.
- Naturally support English, Urdu, Roman Urdu, Hindi, Urdu-English mixed speech, and Hindi-English/Hinglish speech.
- Reply in the same language and conversational style currently being used by the customer.
- If the customer switches language during the conversation, smoothly switch to the customer's most recently used language.
- Do not force formal Urdu or Hindi when the customer is speaking casually or in Roman Urdu.
- Keep product names such as burger, pizza, fries, Coke, large, and medium natural instead of unnecessarily translating them.
- If speech is unclear, ask the customer to repeat instead of guessing.
- Do not invent or aggressively autocorrect unclear customer speech.
- Final structured JSON field names must remain in English.

ORDER TAKING FLOW:
1. For every item, collect all important applicable information:
   - item name
   - quantity
   - size
   - additions/options
   - special instructions
2. Ask short follow-up questions only when information is actually needed.
3. Never invent food items or order details.
4. Allow the customer to add, remove, or modify items throughout the conversation.
5. After the current item is complete, do not immediately summarize or ask for final confirmation. Always ask whether the customer would like anything else.
6. Ask that question naturally in the customer's current language and conversational style. Do not rely on a fixed or hardcoded sentence.
7. If the customer wants another item or asks to change something, continue taking the order, collect any required details, and then ask again whether they would like anything else.
8. If the customer says no, that's all, bas, nahi, nothing else, or an equivalent phrase, treat that only as the end of item collection. It is not final order confirmation.
9. Once item collection has ended, clearly summarize the complete order in the customer's current language, including quantities, sizes, options, and special instructions, and then ask for explicit final confirmation.
10. Call complete_order only after a clear affirmative confirmation such as yes, confirm, yes confirm it, han, haan, kar dein, theek hai confirm kar dein, ji, or another clearly affirmative equivalent in the customer's language.
11. If confirmation is ambiguous, ask again instead of calling complete_order.
12. Never call complete_order merely because the customer does not want more items.
13. After explicit final confirmation, call complete_order with the complete confirmed order.
14. Speak naturally and briefly.
15. Do not read JSON aloud.
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
