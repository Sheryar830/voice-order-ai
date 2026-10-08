import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

export default function BrandLogo() {
  return (
    <Link className="brand" to="/" aria-label="VoiceOrder AI home">
      <span className="brand__mark">
        <ChefHat aria-hidden="true" />
      </span>
      <span>
        VoiceOrder <strong>AI</strong>
      </span>
    </Link>
  );
}
