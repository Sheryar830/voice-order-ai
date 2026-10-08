import { Link } from "react-router-dom";

export default function SecondaryButton({ to, icon: Icon, children }) {
  return (
    <Link className="secondary-button" to={to}>
      {Icon && <Icon aria-hidden="true" />}
      <span>{children}</span>
    </Link>
  );
}
