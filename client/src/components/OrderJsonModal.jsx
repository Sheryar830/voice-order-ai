import { Check, Code2, Copy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

export default function OrderJsonModal({ open, onClose, data }) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef(null);
  const json = JSON.stringify(data, null, 2);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      const focusable = dialog?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="json-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="json-title"
      >
        <header>
          <h2 id="json-title">
            <Code2 aria-hidden="true" /> Order JSON
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close order JSON"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <div className="code-block">
          <button
            type="button"
            className="copy-button"
            aria-label="Copy order JSON"
            onClick={copyJson}
          >
            {copied ? (
              <>
                <Check />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy />
                <span>Copy</span>
              </>
            )}
          </button>
          <pre>
            <code dangerouslySetInnerHTML={{ __html: highlightJson(json) }} />
          </pre>
        </div>
        <button className="modal-close-button" type="button" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  );
}
