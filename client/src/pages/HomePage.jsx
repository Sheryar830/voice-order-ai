import { FileText, MessagesSquare, Mic, Zap } from "lucide-react";
import FeatureCard from "../components/FeatureCard";
import FoodHeroImage from "../components/FoodHeroImage";
import GradientButton from "../components/GradientButton";
import AppLayout from "../layouts/AppLayout";

export default function HomePage() {
  return (
    <AppLayout className="home-page">
      <section className="home-hero" id="how-it-works">
        <div className="hero-copy">
          <span className="ai-badge">
            <i /> AI Powered Ordering
          </span>
          <h1>
            Place Your Order
            <br />
            Just by <span>Speaking</span>
          </h1>
          <p>
            Talk naturally with our AI assistant. No typing, no hassle.
            <br />
            Get your order confirmed in seconds.
          </p>
          <GradientButton to="/conversation" icon={Mic}>
            Start Conversation
          </GradientButton>
          <small>Just click and start speaking</small>
        </div>
        <div className="hero-visual">
          <FoodHeroImage variant="home" />
        </div>
      </section>
      <section className="features" id="features" aria-label="Features">
        <FeatureCard icon={Zap} title="Fast & Easy">
          Place your order in seconds
          <br />
          with natural conversation.
        </FeatureCard>
        <FeatureCard icon={MessagesSquare} title="Natural Conversation">
          Just speak like a human.
          <br />
          Our AI understands you.
        </FeatureCard>
        <FeatureCard icon={FileText} title="Get Order Summary">
          View your confirmed order
          <br />
          in clean JSON format.
        </FeatureCard>
      </section>
    </AppLayout>
  );
}
