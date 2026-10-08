import { CupSoda, Hamburger, Utensils } from "lucide-react";

function getIcon(name = "") {
  const value = name.toLowerCase();

  if (
    value.includes("coke") ||
    value.includes("drink") ||
    value.includes("soda")
  ) {
    return CupSoda;
  }

  if (value.includes("burger")) {
    return Hamburger;
  }

  return Utensils;
}

export default function OrderItem({ item }) {
  const Icon = getIcon(item.name);

  const details = [
    item.size,
    item.includes?.length
      ? `With ${item.includes.join(", ")}`
      : "",
    item.specialInstructions,
  ]
    .filter(Boolean)
    .join("  |  ");

  return (
    <article className="order-item">
      <span className="order-thumb">
        <Icon aria-hidden="true" />
      </span>

      <div className="order-item__body">
        <div>
          <strong>{item.name}</strong>
        </div>

        <div>
          <span>{details || "Standard"}</span>
          <small>Qty: {item.quantity}</small>
        </div>
      </div>
    </article>
  );
}