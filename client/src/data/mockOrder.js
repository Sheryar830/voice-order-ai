export const orderItems = [
  { id: 1, name: "Chicken Burger Meal", detail: "Large  |  With Fries", quantity: 2, price: "12.99", icon: "burger" },
  { id: 2, name: "French Fries", detail: "Large", quantity: 1, price: "3.99", icon: "fries" },
  { id: 3, name: "Coke", detail: "Large", quantity: 1, price: "2.99", icon: "drink" },
];

export const orderJson = {
  customerIntent: "place_order",
  items: [
    { name: "Chicken Burger Meal", quantity: 2, size: "Large", includes: ["Fries"], specialInstructions: "" },
    { name: "Coke", quantity: 1, size: "Large", specialInstructions: "" },
  ],
  status: "confirmed",
  totalItems: 3,
};
