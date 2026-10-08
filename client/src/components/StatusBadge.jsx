export default function StatusBadge({ label = "Live", confirmed = false }) {
  return (
    <span
      className={`status-badge ${confirmed ? "status-badge--confirmed" : ""}`}
    >
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
