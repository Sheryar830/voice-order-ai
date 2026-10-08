import { BrainCircuit, FileText, Mic } from "lucide-react";

export default function ProgressSteps({ status = "listening" }) {
  const steps = [
    {
      icon: Mic,
      title: "Listening",
      subtitle: "to your order",
      active: status === "listening",
    },
    {
      icon: BrainCircuit,
      title: "AI is",
      subtitle: "processing",
      active:
        status === "processing" ||
        status === "speaking" ||
        status === "connecting",
    },
    {
      icon: FileText,
      title: "Preparing",
      subtitle: "your summary",
      active: status === "completed",
    },
  ];

  return (
    <div className="progress-panel" aria-label="Order progress">
      {steps.map(({ icon: Icon, title, subtitle, active }) => (
        <div
          className={`progress-step ${active ? "is-active" : ""}`}
          key={title}
        >
          <span>
            <Icon aria-hidden="true" />
          </span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
      ))}
    </div>
  );
}