import { CheckCircle2 } from "lucide-react";
import OrderItem from "./OrderItem";

export default function OrderSummary({ items = [] }) {
  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  return (
    <section className="order-summary" aria-labelledby="order-summary-title">
      <header className="order-summary__header">
        <div>
          <h2 id="order-summary-title">Order Summary</h2>

          <span className="confirmed-pill">
            <CheckCircle2 /> Confirmed
          </span>
        </div>

        <time dateTime={new Date().toISOString()}>
          {new Date().toLocaleString()}
        </time>
      </header>

      <div className="order-list">
        {items.map((item, index) => (
          <OrderItem
            item={item}
            key={`${item.name}-${index}`}
          />
        ))}
      </div>

      <dl className="summary-totals">
        <div>
          <dt>Items</dt>
          <dd>{totalItems}</dd>
        </div>

        <div>
          <dt>Status</dt>
          <dd>
            <span className="confirmed-pill">Confirmed</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}