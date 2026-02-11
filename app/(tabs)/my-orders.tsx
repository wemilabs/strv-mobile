import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { type OrderListItem } from "@/types";

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function OrderRow({
  order,
  onPress,
}: {
  order: OrderListItem;
  onPress?: () => void;
}) {
  const colorScheme = useColorScheme() ?? "light";

  const itemsCount = order.orderItems.reduce(
    (count, item) => count + (item.quantity ?? 0),
    0,
  );

  const total = Number(order.totalPrice);

  return (
    <Pressable
      style={[
        styles.orderRow,
        {
          borderColor: Colors[colorScheme].icon + "15",
          backgroundColor: Colors[colorScheme].background,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowTop}>
        <ThemedText style={[styles.orgName, { fontFamily: Fonts.rounded }]}>
          {order.organization?.name ?? "Store"}
        </ThemedText>
        <ThemedText style={styles.dateText}>
          {formatOrderDate(order.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.rowBottom}>
        <View style={styles.rowMeta}>
          <ThemedText style={styles.metaText}>
            {itemsCount} item{itemsCount <= 1 ? "" : "s"}
          </ThemedText>
          <OrderStatusBadge status={order.status} />
          {order.isPaid ? (
            <View style={styles.paidBadge}>
              <ThemedText style={styles.paidBadgeText}>Paid</ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText
          style={[styles.totalText, { color: Colors[colorScheme].tint }]}
        >
          {Number.isFinite(total) ? formatPrice(total) : order.totalPrice}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function MyOrdersScreen() {
  const colorScheme = useColorScheme() ?? "light";

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.orders.list(),
    staleTime: 30 * 1000,
  });

  const orders = (data?.orders ?? []) as OrderListItem[];

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.emptyText}>
            Failed to load orders. Pull to refresh.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderRow
              order={item}
              onPress={() => router.push(`/my-orders/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => refetch()}
              tintColor={Colors[colorScheme].tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <ThemedText style={styles.emptyText}>No orders yet</ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  orderRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  rowBottom: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paidBadge: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#16a34a",
  },
  paidBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  orgName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    opacity: 0.65,
  },
  metaText: {
    fontSize: 13,
    opacity: 0.75,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
