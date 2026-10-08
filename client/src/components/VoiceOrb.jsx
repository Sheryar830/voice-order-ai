import { Mic } from "lucide-react";

function Waveform({ side }) {
  return (
    <div className={`orb-wave orb-wave--${side}`} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
        <i key={bar} style={{ "--bar": bar }} />
      ))}
    </div>
  );
}

export default function VoiceOrb({ status = "listening" }) {
  return (
    <div
      className={`voice-orb voice-orb--${status}`}
      role="img"
      aria-label={`Voice assistant is ${status}`}
    >
      <span className="voice-orb__halo" />
      <span className="voice-orb__ring voice-orb__ring--outer" />
      <span className="voice-orb__ring voice-orb__ring--middle" />
      <span className="voice-orb__ring voice-orb__ring--inner" />
      <Waveform side="left" />
      <Waveform side="right" />
      <span className="voice-orb__core">
        <Mic aria-hidden="true" />
      </span>
    </div>
  );
}
