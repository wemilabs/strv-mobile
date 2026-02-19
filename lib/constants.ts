import { OrderStatus, ProductCategory } from "@/types";
import { SortBy } from "./search-params";

export const SORT_OPTIONS: Array<{ id: SortBy; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Popular" },
  { id: "price_low", label: "Price: Low" },
  { id: "price_high", label: "Price: High" },
  { id: "oldest", label: "Oldest" },
];

export const CATEGORIES: Array<{ id: ProductCategory; label: string }> = [
  { id: "food", label: "Food" },
  { id: "beverages", label: "Beverages" },
  { id: "snacks", label: "Snacks" },
  { id: "dairy", label: "Dairy" },
  { id: "bakery", label: "Bakery" },
  { id: "frozen", label: "Frozen" },
  { id: "household", label: "Household" },
  { id: "personal_care", label: "Personal Care" },
  { id: "other", label: "Other" },
];

export const lightConfig: Record<
  OrderStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  confirmed: { bg: "#DBEAFE", text: "#1E40AF", label: "Confirmed" },
  preparing: { bg: "#F3E8FF", text: "#6B21A8", label: "Preparing" },
  ready: { bg: "#FFEDD5", text: "#9A3412", label: "Ready" },
  delivered: { bg: "#D1FAE5", text: "#065F46", label: "Delivered" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
};

export const darkConfig: Record<
  OrderStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "#713F12", text: "#FDE68A", label: "Pending" },
  confirmed: { bg: "#1E3A8A", text: "#BFDBFE", label: "Confirmed" },
  preparing: { bg: "#581C87", text: "#E9D5FF", label: "Preparing" },
  ready: { bg: "#7C2D12", text: "#FED7AA", label: "Ready" },
  delivered: { bg: "#064E3B", text: "#A7F3D0", label: "Delivered" },
  cancelled: { bg: "#7F1D1D", text: "#FECACA", label: "Cancelled" },
};

export const isOrderStatus = (value: string): value is OrderStatus => {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "preparing" ||
    value === "ready" ||
    value === "delivered" ||
    value === "cancelled"
  );
};
