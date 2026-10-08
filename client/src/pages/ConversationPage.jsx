import { Lightbulb, RotateCcw, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ConversationPanel from "../components/ConversationPanel";
import FoodHeroImage from "../components/FoodHeroImage";
import ProgressSteps from "../components/ProgressSteps";
import VoiceOrb from "../components/VoiceOrb";
import AppLayout from "../layouts/AppLayout";

import { createLiveSession, finalizeOrder } from "../services/api";
import { connectGeminiLive } from "../services/geminiLive";

import { createAudioPlayer } from "../utils/audioPlayer";
import { startMicrophone } from "../utils/microphone";
import { saveFinalOrder } from "../utils/orderStorage";

function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mergeTranscript(current, incoming) {
  if (!incoming) return current;
  if (!current) return incoming.trimStart();

  if (incoming.startsWith(current)) {
    return incoming;
  }

  if (current.endsWith(incoming)) {
    return current;
  }

  const currentWithoutTrailingSpace = current.trimEnd();
  const incomingWithoutLeadingSpace = incoming.trimStart();

  if (incomingWithoutLeadingSpace.startsWith(currentWithoutTrailingSpace)) {
    return incomingWithoutLeadingSpace;
  }

  if (currentWithoutTrailingSpace.endsWith(incomingWithoutLeadingSpace)) {
    return current;
  }

  const needsSpace =
    current === currentWithoutTrailingSpace &&
    incoming === incomingWithoutLeadingSpace &&
    /[\p{L}\p{N},.!?;:]$/u.test(current) &&
    /^[\p{L}\p{N}]/u.test(incoming);

  return `${current}${needsSpace ? " " : ""}${incoming}`;
}

export default function ConversationPage() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("connecting");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const sessionRef = useRef(null);
  const microphoneRef = useRef(null);
  const playerRef = useRef(null);
  const mountedRef = useRef(true);
  const sessionAttemptRef = useRef(0);
  const userTranscriptBuffer = useRef("");
  const assistantTranscriptBuffer = useRef("");
  const orderFinalizationKeysRef = useRef(new Set());

  async function cleanup() {
    try {
      microphoneRef.current?.stop?.();
    } catch {
      // ignore
    }

    microphoneRef.current = null;

    try {
      await playerRef.current?.close?.();
    } catch {
      // ignore
    }

    playerRef.current = null;

    try {
      sessionRef.current?.close?.();
    } catch {
      // ignore
    }

    sessionRef.current = null;
  }

  function appendTranscript(role, text) {
    if (!text?.trim()) return;

    const buffer =
      role === "user" ? userTranscriptBuffer : assistantTranscriptBuffer;
    const mergedText = mergeTranscript(buffer.current, text);

    if (mergedText === buffer.current) return;
    buffer.current = mergedText;

    setMessages((current) => {
      let partialIndex = -1;

      for (let index = current.length - 1; index >= 0; index -= 1) {
        if (current[index].role === role && current[index].isPartial) {
          partialIndex = index;
          break;
        }
      }

      if (partialIndex >= 0) {
        return current.map((message, index) =>
          index === partialIndex
            ? { ...message, text: mergedText }
            : message,
        );
      }

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          role,
          text: mergedText,
          time: timeNow(),
          isPartial: true,
        },
      ];
    });
  }

  function finalizeTranscripts() {
    const finalUserTranscript = userTranscriptBuffer.current.trim();
    const finalAssistantTranscript = assistantTranscriptBuffer.current.trim();

    setMessages((current) =>
      current.map((message) => {
        if (!message.isPartial) return message;

        if (message.role === "user" && finalUserTranscript) {
          return {
            ...message,
            text: finalUserTranscript,
            isPartial: false,
          };
        }

        if (message.role === "assistant" && finalAssistantTranscript) {
          return {
            ...message,
            text: finalAssistantTranscript,
            isPartial: false,
          };
        }

        return message;
      }),
    );

    userTranscriptBuffer.current = "";
    assistantTranscriptBuffer.current = "";
  }

  async function startSession() {
    const sessionAttempt = ++sessionAttemptRef.current;
    userTranscriptBuffer.current = "";
    assistantTranscriptBuffer.current = "";
    orderFinalizationKeysRef.current.clear();
    setError("");
    setStatus("connecting");

    try {
      await cleanup();

      if (sessionAttempt !== sessionAttemptRef.current) return;

      const { token, model } = await createLiveSession();

      if (sessionAttempt !== sessionAttemptRef.current) return;

      const player = createAudioPlayer();
      playerRef.current = player;

      const session = await connectGeminiLive({
        token,
        model,

        onOpen() {
          if (
            mountedRef.current &&
            sessionAttempt === sessionAttemptRef.current
          ) {
            setStatus("listening");
          }
        },

        onClose() {
          if (
            mountedRef.current &&
            sessionAttempt === sessionAttemptRef.current
          ) {
            setStatus("idle");
          }
        },

        onError() {
          if (
            mountedRef.current &&
            sessionAttempt === sessionAttemptRef.current
          ) {
            setError("Voice connection failed. Please try again.");
            setStatus("error");
          }
        },

        async onMessage(message) {
          if (sessionAttempt !== sessionAttemptRef.current) return;

          const content = message.serverContent;

          if (content?.inputTranscription?.text) {
            appendTranscript(
              "user",
              content.inputTranscription.text,
            );
          }

          if (content?.outputTranscription?.text) {
            appendTranscript(
              "assistant",
              content.outputTranscription.text,
            );
          }

          if (content?.turnComplete) {
            finalizeTranscripts();
          }

          if (content?.interrupted) {
            playerRef.current?.clear();
            setStatus("listening");
          }

          if (content?.modelTurn?.parts) {
            for (const part of content.modelTurn.parts) {
              if (part.inlineData?.data) {
                setStatus("speaking");
                await playerRef.current?.play(part.inlineData.data);
              }
            }
          }

          if (message.toolCall?.functionCalls) {
            for (const call of message.toolCall.functionCalls) {
              if (call.name !== "complete_order") continue;

              const finalizationKey = JSON.stringify(call.args ?? {});

              if (orderFinalizationKeysRef.current.has(finalizationKey)) {
                continue;
              }

              orderFinalizationKeysRef.current.add(finalizationKey);

              const order = {
                ...call.args,
                status: "confirmed",
              };

              try {
                const response = await finalizeOrder(order);

                saveFinalOrder(response.order);

                sessionRef.current?.sendToolResponse({
                  functionResponses: [
                    {
                      id: call.id,
                      name: call.name,
                      response: {
                        success: true,
                      },
                    },
                  ],
                });

                setStatus("completed");

                await cleanup();

                navigate("/order-complete");
                return;
              } catch (finalizationError) {
                const message =
                  finalizationError.message || "Unable to finalize order";

                console.error(
                  "[VoiceOrder] Unable to finalize order",
                  finalizationError,
                );
                setError(message);
                setStatus("error");

                sessionRef.current?.sendToolResponse({
                  functionResponses: [
                    {
                      id: call.id,
                      name: call.name,
                      response: {
                        success: false,
                        error: message,
                      },
                    },
                  ],
                });
              }
            }
          }
        },
      });

      if (sessionAttempt !== sessionAttemptRef.current) {
        session.close();
        await player.close();
        return;
      }

      sessionRef.current = session;

      let sentAudioChunkCount = 0;
      const microphone = await startMicrophone(
        (base64Audio) => {
          session.sendRealtimeInput({
            audio: {
              data: base64Audio,
              mimeType: "audio/pcm;rate=16000",
            },
          });

          sentAudioChunkCount += 1;
          if (sentAudioChunkCount % 20 === 0) {
            console.info(
              `[VoiceOrder] Microphone audio chunks sent: ${sentAudioChunkCount}`,
            );
          }
        },
        {
          onStop() {
            session.sendRealtimeInput({ audioStreamEnd: true });
            console.info("[VoiceOrder] Microphone audio stream ended");
          },
        },
      );

      if (sessionAttempt !== sessionAttemptRef.current) {
        microphone.stop();
        session.close();
        await player.close();
        return;
      }

      microphoneRef.current = microphone;
      setStatus("listening");
    } catch (err) {
      console.error("[VoiceOrder] Unable to start voice session", err?.name);

      if (sessionAttempt !== sessionAttemptRef.current) return;

      await cleanup();

      if (mountedRef.current) {
        setError(err.message || "Unable to start voice conversation.");
        setStatus("error");
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    startSession();

    return () => {
      mountedRef.current = false;
      sessionAttemptRef.current += 1;
      cleanup();
    };
  }, []);

  async function endConversation() {
    await cleanup();
    navigate("/");
  }

  const title =
    status === "speaking"
      ? "AI is speaking..."
      : status === "processing"
        ? "Processing..."
        : status === "connecting"
          ? "Connecting..."
          : status === "error"
            ? "Connection error"
            : "Listening...";

  return (
    <AppLayout navMode="conversation" className="conversation-page">
      <FoodHeroImage variant="conversation" />

      <div className="conversation-layout">
        <section className="voice-area" aria-labelledby="voice-status">
          <VoiceOrb status={status} />

          <div className="voice-status-text">
            <h1 id="voice-status">{title}</h1>
            <p>
              {status === "error"
                ? error
                : "Speak naturally to place your order"}
            </p>
          </div>

          <ProgressSteps status={status} />

          {status === "error" ? (
            <button
              className="secondary-button end-conversation"
              type="button"
              onClick={startSession}
            >
              <RotateCcw aria-hidden="true" />
              Retry Connection
            </button>
          ) : (
            <button
              className="secondary-button end-conversation"
              type="button"
              onClick={endConversation}
            >
              <StopCircle aria-hidden="true" />
              End Conversation
            </button>
          )}

          <p className="voice-tip">
            <Lightbulb aria-hidden="true" />
            Tip: You can speak naturally, like talking to a real person.
          </p>
        </section>

        <ConversationPanel
          messages={messages}
          status={status}
        />
      </div>
    </AppLayout>
  );
}
