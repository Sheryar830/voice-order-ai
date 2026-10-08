import { Clock3 } from "lucide-react";
import { useEffect, useRef } from "react";
import ConversationMessage from "./ConversationMessage";
import StatusBadge from "./StatusBadge";

export default function ConversationPanel({
  messages = [],
  status = "listening",
}) {
  const messageListRef = useRef(null);
  const previousMessagesRef = useRef(messages);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    const previousMessages = previousMessagesRef.current;
    const previousLatestMessage =
      previousMessages[previousMessages.length - 1];
    const isStreamingUpdate =
      latestMessage?.isPartial &&
      latestMessage.id === previousLatestMessage?.id;

    previousMessagesRef.current = messages;

    const frame = requestAnimationFrame(() => {
      const messageList = messageListRef.current;
      if (!messageList) return;

      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: isStreamingUpdate ? "auto" : "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages]);

  return (
    <section
      className="conversation-panel"
      aria-labelledby="conversation-title"
    >
      <header className="conversation-header">
        <div>
          <h2 id="conversation-title">Conversation</h2>
          <StatusBadge
            label={status === "error" ? "Offline" : "Live"}
          />
        </div>

        <span className="conversation-timer">
          <Clock3 aria-hidden="true" /> Live
        </span>
      </header>

      <div
        ref={messageListRef}
        className="message-list"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="conversation-empty">
            Start speaking to begin your order.
          </p>
        ) : (
          messages.map((message) => (
            <ConversationMessage
              key={message.id}
              message={message}
            />
          ))
        )}
      </div>

      <div className="listening-status">
        <span>
          {status === "speaking"
            ? "AI is speaking..."
            : status === "processing"
              ? "AI is processing..."
              : status === "connecting"
                ? "Connecting..."
                : status === "error"
                  ? "Disconnected"
                  : "AI is listening..."}
        </span>

        <span className="mini-wave" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((bar) => (
            <i key={bar} style={{ "--bar": bar }} />
          ))}
        </span>
      </div>
    </section>
  );
}
