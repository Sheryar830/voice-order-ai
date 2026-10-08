const ORDER_KEY = "voiceOrder.finalOrder";

export function saveFinalOrder(order) {
  sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

export function getFinalOrder() {
  const value = sessionStorage.getItem(ORDER_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearFinalOrder() {
  sessionStorage.removeItem(ORDER_KEY);
}