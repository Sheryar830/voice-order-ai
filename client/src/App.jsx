import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ConversationPage from "./pages/ConversationPage";
import OrderCompletePage from "./pages/OrderCompletePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/conversation" element={<ConversationPage />} />
      <Route path="/order-complete" element={<OrderCompletePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
