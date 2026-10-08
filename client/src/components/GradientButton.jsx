import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function GradientButton({
  to,
  icon: Icon,
  children,
  onClick,
  type = "button",
}) {
  const content = (
    <>
      {Icon && <Icon aria-hidden="true" />}
      <span>{children}</span>
      <ArrowRight className="button-arrow" aria-hidden="true" />
    </>
  );
  if (to)
    return (
      <Link className="gradient-button primary-action" to={to}>
        {content}
      </Link>
    );
  return (
    <button
      className="gradient-button primary-action"
      type={type}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
