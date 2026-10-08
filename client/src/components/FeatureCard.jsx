export default function FeatureCard({ icon: Icon, title, children }) {
  return (
    <article className="feature-card">
      <span className="feature-icon">
        <Icon aria-hidden="true" />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </article>
  );
}
