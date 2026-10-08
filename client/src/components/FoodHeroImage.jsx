import heroBurger from "../assets/images/hero-burger-fries.png";

export default function FoodHeroImage({ variant = "home" }) {
  const decorative = variant !== "home";

  return (
    <div
      className={`food-hero food-hero--${variant}`}
      aria-hidden={decorative || undefined}
    >
      <img
        src={heroBurger}
        alt={
          decorative
            ? ""
            : "Fresh burger and fries in a warmly lit restaurant"
        }
        loading={variant === "home" ? "eager" : "lazy"}
        decoding="async"
      />
      <span className="food-hero__blend" aria-hidden="true" />
    </div>
  );
}
