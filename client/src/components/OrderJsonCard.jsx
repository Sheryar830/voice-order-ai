import { Check, Code2, Copy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function highlightJson(json) {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:)|("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")|(\btrue\b|\bfalse\b)|(\bnull\b)|(\b-?\d+(?:\.\d+)?\b)/g,
      (match, key, string, bool, nil, number) => {
        const type = key
          ? "key"
          : string
            ? "string"
            : bool
              ? "boolean"
              : nil
                ? "null"
                : number
                  ? "number"
                  : "";
        return `<span class="json-${type}">${match}</span>`;
      },
    );
}

export default function OrderJsonCard({ order }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(null);
  const json = useMemo(
    () => (order ? JSON.stringify(order, null, 2) : ""),
    [order],
  );

  useEffect(
    () => () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  if (!order) return null;

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="order-json-card" aria-labelledby="order-json-card-title">
      <header className="order-json-card__header">
        <h2 id="order-json-card-title">
          <Code2 aria-hidden="true" />
          Order JSON
        </h2>

        <button
          type="button"
          className="order-json-card__copy"
          aria-label="Copy order JSON"
          onClick={copyJson}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </header>

      <div className="order-json-card__code">
        <pre>
          <code dangerouslySetInnerHTML={{ __html: highlightJson(json) }} />
        </pre>
      </div>
    </section>
  );
}
