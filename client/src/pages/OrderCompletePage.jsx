import { FileText, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import FoodHeroImage from "../components/FoodHeroImage";
import GradientButton from "../components/GradientButton";
import OrderJsonCard from "../components/OrderJsonCard";
import OrderJsonModal from "../components/OrderJsonModal";
import OrderSummary from "../components/OrderSummary";
import SecondaryButton from "../components/SecondaryButton";
import SuccessOrb from "../components/SuccessOrb";
import AppLayout from "../layouts/AppLayout";

import {
  clearFinalOrder,
  getFinalOrder,
} from "../utils/orderStorage";

export default function OrderCompletePage() {
  const [modalOpen, setModalOpen] = useState(false);

  const order = useMemo(() => getFinalOrder(), []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  if (!order) {
    return <Navigate replace to="/" />;
  }

  return (
    <AppLayout navMode="complete" className="complete-page">
      <FoodHeroImage variant="complete" />

      <div className="complete-layout">
        <section className="success-area">
          <SuccessOrb />

          <h1>
            Order <span>Completed!</span>
          </h1>

          {/* <p>
            Your order has been confirmed successfully.
            <br />
            You can view the full order summary below.
          </p> */}

          {/* <GradientButton
            icon={FileText}
            onClick={() => setModalOpen(true)}
          >
            View Order Summary
          </GradientButton> */}

          <SecondaryButton
            to="/"
            icon={RefreshCw}
            onClick={clearFinalOrder}
          >
            Start New Order
          </SecondaryButton>
        </section>

        <div className="complete-order-details">
          <OrderSummary items={order.items} />
          <OrderJsonCard order={order} />
        </div>
      </div>

      <OrderJsonModal
        open={modalOpen}
        onClose={closeModal}
        data={order}
      />
    </AppLayout>
  );
}
