import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { OrderStatus } from "@/types";
import { darkConfig, isOrderStatus, lightConfig } from "@/lib/constants";

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
    fontSize: 14,
    fontWeight: "700",
  },
});
