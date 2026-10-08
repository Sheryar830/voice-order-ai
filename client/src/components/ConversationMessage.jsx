import { ChefHat, Mic } from "lucide-react";

export default function ConversationMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <article className={`conversation-message ${isUser ? "is-user" : "is-ai"}`}>
      <span className="message-avatar" aria-hidden="true">
        {isUser ? <Mic /> : <ChefHat />}
      </span>
      <div className="message-bubble">
        <div className="message-meta">
          <strong>{isUser ? "You" : "AI Assistant"}</strong>
          <time>{message.time}</time>
        </div>
        <p>{message.text}</p>
      </div>
    </article>
  );
}
