import { Check } from "lucide-react";

export default function SuccessOrb() {
  return (
    <div className="success-orb" role="img" aria-label="Order confirmed">
      <span className="success-orb__ring success-orb__ring--outer" />
      <span className="success-orb__ring success-orb__ring--inner" />
      <span className="success-orb__core">
        <Check aria-hidden="true" />
      </span>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((piece) => (
        <i className={`confetti confetti--${piece}`} key={piece} />
      ))}
    </div>
  );
}
