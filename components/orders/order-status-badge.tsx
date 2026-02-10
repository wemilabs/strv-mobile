import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

const lightConfig: Record<
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

const darkConfig: Record<
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

function isOrderStatus(value: string): value is OrderStatus {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "preparing" ||
    value === "ready" ||
    value === "delivered" ||
    value === "cancelled"
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const colorScheme = useColorScheme() ?? "light";

  const normalized: OrderStatus = isOrderStatus(status) ? status : "pending";
  const config =
    colorScheme === "dark" ? darkConfig[normalized] : lightConfig[normalized];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <ThemedText style={[styles.text, { color: config.text }]}>
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
