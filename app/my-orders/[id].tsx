import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/utils";
import type { OrderDetail } from "@/types";
import { Ionicons } from "@expo/vector-icons";

function ItemRow({ item }: { item: OrderDetail["orderItems"][number] }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.product?.name ?? "Item"}
        </ThemedText>
        <ThemedText style={styles.itemMeta}>
          Qty: {item.quantity}
          {item.notes ? ` • ${item.notes}` : ""}
        </ThemedText>
      </View>
      <ThemedText style={styles.itemSubtotal}>
        {formatMoney(item.subtotal)}
      </ThemedText>
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "polling" | "success" | "failed"
  >("idle");
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { background, icon: iconColor, text, tint } = Colors[colorScheme];

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.orders.byId(id as string),
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  const order = data as OrderDetail | undefined;

  const canPay = Boolean(
    order && order.status === "confirmed" && !order.isPaid,
  );
  const canCancel = Boolean(
    order && order.status !== "cancelled" && order.status !== "delivered",
  );

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!payModalOpen) return;
    if (paymentStatus !== "polling" || !paymentRef || !order?.id) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const result = await api.orders.paymentStatus(order.id, paymentRef);
        if (result.status === "successful") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setPaymentStatus("success");
          await refetch();
          setTimeout(() => {
            setPayModalOpen(false);
          }, 800);
        } else if (result.status === "failed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setPaymentStatus("failed");
        }
      } catch {}
    }, 3000);

    timeoutRef.current = setTimeout(() => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (paymentStatus === "polling") {
        setPaymentStatus("idle");
        Alert.alert(
          "Payment pending",
          "If you approved the payment, it will be processed shortly.",
        );
      }
    }, 120000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [payModalOpen, paymentStatus, paymentRef, order?.id, refetch]);

  const resetPaymentState = () => {
    setPhone("");
    setPaymentRef(null);
    setPaymentStatus("idle");
  };

  const handleCancelOrder = () => {
    if (!order?.id) return;

    Alert.alert(
      "Cancel order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No, keep order", style: "cancel" },
        {
          text: "Yes, cancel order",
          style: "destructive",
          onPress: async () => {
            try {
              await api.orders.cancel(order.id);
              await refetch();
              Alert.alert("Done", "Order cancelled successfully");
            } catch (e) {
              const message =
                e instanceof Error ? e.message : "Failed to cancel order";
              Alert.alert("Failure", message);
            }
          },
        },
      ],
    );
  };

  const handleInitiatePayment = async () => {
    if (!order?.id) return;
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned || cleaned.length !== 9) {
      Alert.alert("Invalid phone", "Please enter a valid phone number");
      return;
    }

    const normalizedPhone = `0${cleaned}`;

    setPaymentStatus("pending");
    try {
      const result = await api.orders.pay(order.id, {
        phoneNumber: normalizedPhone,
      });
      if (result.paypackRef) {
        setPaymentRef(result.paypackRef);
        setPaymentStatus("polling");
      } else {
        setPaymentStatus("failed");
        Alert.alert("Failure", "Failed to initiate payment");
      }
    } catch (e) {
      setPaymentStatus("failed");
      const message =
        e instanceof Error ? e.message : "Failed to initiate payment";
      Alert.alert("Failure", message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Order" }} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <ThemedText style={[styles.orgName, { fontFamily: Fonts.rounded }]}>
          {order?.organization?.name ?? "Order"}
        </ThemedText>
        {order ? (
          <View style={styles.headerMeta}>
            <View style={styles.badgesRow}>
              <OrderStatusBadge status={order.status} />
              {order.isPaid ? (
                <View style={styles.paidBadge}>
                  <ThemedText style={styles.paidBadgeText}>Paid</ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText style={styles.metaText} numberOfLines={1}>
              {formatDate(order.createdAt)}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : error || !order ? (
        <View style={styles.centered}>
          <ThemedText style={styles.emptyText}>
            Failed to load order. Pull to refresh.
          </ThemedText>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={order.orderItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ItemRow item={item} />}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: canPay || canCancel ? 200 : 24 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={() => refetch()}
                tintColor={tint}
              />
            }
            ListHeaderComponent={
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Total</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: tint }]}>
                    {formatMoney(order.totalPrice)}
                  </ThemedText>
                </View>

                {order.deliveryLocation ? (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>
                      Delivery
                    </ThemedText>
                    <ThemedText style={styles.summaryValue} numberOfLines={2}>
                      {order.deliveryLocation}
                    </ThemedText>
                  </View>
                ) : null}

                {order.notes ? (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Notes</ThemedText>
                    <ThemedText style={styles.summaryValue} numberOfLines={3}>
                      {order.notes}
                    </ThemedText>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: iconColor + "15" },
                  ]}
                />

                <ThemedText style={styles.itemsTitle}>Items</ThemedText>
              </View>
            }
          />

          {(canPay || canCancel) && (
            <View
              style={[
                styles.footer,
                {
                  backgroundColor: background,
                  borderTopColor: iconColor + "15",
                },
              ]}
            >
              {canPay && (
                <Pressable
                  style={[
                    styles.footerButton,
                    {
                      backgroundColor: tint,
                      borderColor: tint,
                    },
                  ]}
                  onPress={() => {
                    resetPaymentState();
                    setPayModalOpen(true);
                  }}
                >
                  <Ionicons name="wallet-outline" size={18} color="#fff" />
                  <ThemedText
                    style={[styles.footerButtonText, { color: "#fff" }]}
                  >
                    Pay {formatMoney(order.totalPrice)}
                  </ThemedText>
                </Pressable>
              )}

              {canCancel && (
                <Pressable
                  style={[
                    styles.footerButton,
                    { borderColor: iconColor + "25" },
                  ]}
                  onPress={handleCancelOrder}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color={iconColor}
                  />
                  <ThemedText style={styles.footerButtonText}>
                    Cancel Order
                  </ThemedText>
                </Pressable>
              )}
            </View>
          )}

          <Modal
            visible={payModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => {
              if (paymentStatus === "polling") {
                Alert.alert(
                  "Payment processing",
                  "Payment is being processed. You can come back later to check its status.",
                );
                return;
              }
              setPayModalOpen(false);
            }}
          >
            <KeyboardAvoidingView
              style={styles.modalOverlay}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={[styles.modalCard, { backgroundColor: background }]}>
                <ScrollView
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.modalContent}
                >
                  <ThemedText style={styles.modalTitle}>
                    Pay for this order
                  </ThemedText>
                  <ThemedText style={styles.modalSubtitle}>
                    Enter your Mobile Money number
                  </ThemedText>

                  <View style={styles.totalRow}>
                    <ThemedText style={styles.totalLabel}>Total</ThemedText>
                    <ThemedText style={[styles.totalValue, { color: tint }]}>
                      {order ? formatMoney(order.totalPrice) : ""}
                    </ThemedText>
                  </View>

                  <View style={styles.phoneRow}>
                    <View
                      style={[
                        styles.phonePrefix,
                        {
                          borderColor: iconColor + "25",
                          backgroundColor: iconColor + "10",
                        },
                      ]}
                    >
                      <ThemedText style={styles.phonePrefixText}>
                        +250
                      </ThemedText>
                    </View>
                    <TextInput
                      value={phone}
                      onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
                      placeholder="78XXXXXXX"
                      keyboardType="number-pad"
                      maxLength={9}
                      editable={
                        paymentStatus !== "pending" &&
                        paymentStatus !== "polling"
                      }
                      style={[
                        styles.phoneInput,
                        {
                          borderColor: iconColor + "25",
                          color: text,
                        },
                      ]}
                      placeholderTextColor={iconColor}
                    />
                  </View>

                  {paymentStatus === "polling" ? (
                    <ThemedText style={styles.statusText}>
                      Waiting for approval on your phone...
                    </ThemedText>
                  ) : paymentStatus === "success" ? (
                    <ThemedText style={[styles.statusText, { color: tint }]}>
                      Payment successful.
                    </ThemedText>
                  ) : paymentStatus === "failed" ? (
                    <ThemedText
                      style={[styles.statusText, { color: "#e11d48" }]}
                    >
                      Payment failed. Please try again.
                    </ThemedText>
                  ) : null}

                  <View style={styles.modalActions}>
                    <Pressable
                      onPress={() => {
                        if (paymentStatus === "polling") {
                          Alert.alert(
                            "Payment processing",
                            "Payment is being processed. You can come back later to check its status.",
                          );
                          return;
                        }
                        setPayModalOpen(false);
                      }}
                      style={[
                        styles.secondaryButton,
                        {
                          borderColor: iconColor + "25",
                        },
                      ]}
                    >
                      <ThemedText style={styles.footerButtonText}>
                        {paymentStatus === "polling" ? "Close" : "Cancel"}
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={handleInitiatePayment}
                      disabled={
                        paymentStatus === "pending" ||
                        paymentStatus === "polling" ||
                        paymentStatus === "success" ||
                        phone.replace(/\D/g, "").length < 9
                      }
                      style={[
                        styles.secondaryButton,
                        {
                          backgroundColor: tint,
                          borderColor: tint,
                          opacity:
                            paymentStatus === "pending" ||
                            paymentStatus === "polling" ||
                            paymentStatus === "success" ||
                            phone.replace(/\D/g, "").length < 9
                              ? 0.5
                              : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[styles.footerButtonText, { color: "#fff" }]}
                      >
                        {(() => {
                          switch (paymentStatus) {
                            case "pending":
                              return "Initiating...";
                            case "polling":
                              return "Waiting...";
                            case "success":
                              return "Success";
                            default:
                              return "Pay";
                          }
                        })()}
                      </ThemedText>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 52,
  },
  orgName: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerMeta: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
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
  metaText: {
    fontSize: 13,
    opacity: 0.7,
    flexShrink: 0,
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
    gap: 10,
  },
  summaryCard: {
    borderRadius: 14,
    padding: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.75,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.6,
    textTransform: "uppercase",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderRadius: 12,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemMeta: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "700",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
    elevation: 10,
  },
  footerButton: {
    height: 56,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  footerButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  modalContent: {
    paddingBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalSubtitle: {
    marginTop: 6,
    opacity: 0.75,
  },
  totalRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    opacity: 0.75,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  phoneRow: {
    marginTop: 14,
    flexDirection: "row",
  },
  phonePrefix: {
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  phonePrefixText: {
    fontWeight: "700",
    opacity: 0.85,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  statusText: {
    marginTop: 12,
    fontSize: 13,
    opacity: 0.85,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
});
