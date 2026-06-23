import { Order } from "@/types/order";

export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getOrderStatus = (
  order: Order
): { text: string; color: string } => {
  if (order.isDelivered) {
    return { text: "Delivered", color: "text-green-600 bg-green-100" };
  }
  if (order.isPaid) {
    return { text: "Processing", color: "text-blue-600 bg-blue-100" };
  }
  return { text: "Pending Payment", color: "text-yellow-600 bg-yellow-100" };
};
