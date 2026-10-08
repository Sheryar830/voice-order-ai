import { Mic } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import StatusBadge from "./StatusBadge";

export default function Navbar({ mode = "home" }) {
  const isConversation = mode === "conversation";
  const isComplete = mode === "complete";

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary navigation">
        <BrandLogo />

        <div className="nav-actions">
          {isConversation ? (
            <>
              <StatusBadge label="Live" />
              <span className="avatar" aria-label="User profile">
                A
              </span>
            </>
          ) : (
            <Link
              className="gradient-button nav-cta"
              to={isComplete ? "/" : "/conversation"}
              aria-label={isComplete ? "Start New Order" : "Start Conversation"}
            >
              <Mic size={18} aria-hidden="true" />
              <span>
                {isComplete ? "Start New Order" : "Start Conversation"}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
