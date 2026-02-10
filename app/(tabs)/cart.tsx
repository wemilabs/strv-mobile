import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

import { AuthPrompt } from "@/components/auth-prompt";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { type CartItem, useCartStore } from "@/lib/cart-store";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { calculateOrderFees, formatPrice } from "@/lib/utils";
import { useProductStock } from "@/hooks/use-product-stock";

function CartItemRow({
  productId,
  productName,
  productSlug,
  productImages,
  price,
  quantity,
  inventoryEnabled,
  currentStock,
}: CartItem) {
  const { updateQuantity } = useCartStore();
  const colorScheme = useColorScheme() ?? "light";
  const imageUri = productImages?.[0];

  const handleIncrement = () => {
    try {
      updateQuantity(productId, quantity + 1);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Stock limit", error.message);
      }
    }
  };

  const handleDecrement = () => {
    updateQuantity(productId, quantity - 1);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.springify()}
    >
      <Pressable
        style={styles.itemRow}
        onPress={() => router.push(`/product/${productSlug}` as any)}
      >
        <View style={styles.itemImageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: `${imageUri}?w=160&h=160&fit=cover` }}
              style={styles.itemImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View
              style={[
                styles.itemImage,
                styles.itemImagePlaceholder,
                { backgroundColor: Colors[colorScheme].tint + "15" },
              ]}
            >
              <ThemedText style={styles.placeholderEmoji}>📦</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <ThemedText style={styles.itemName} numberOfLines={2}>
            {productName}
          </ThemedText>
          <ThemedText
            style={[styles.itemPrice, { color: Colors[colorScheme].tint }]}
          >
            {formatPrice(price)}
          </ThemedText>
          {inventoryEnabled && currentStock !== undefined ? (
            <ThemedText style={styles.stockHint}>
              {currentStock} in stock
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.quantityControls}>
          <Pressable
            style={[
              styles.quantityButton,
              { borderColor: Colors[colorScheme].icon + "30" },
            ]}
            onPress={handleDecrement}
            hitSlop={8}
          >
            <ThemedText style={styles.quantityButtonText}>
              {quantity === 1 ? "🗑" : "−"}
            </ThemedText>
          </Pressable>
          <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
          <Pressable
            style={[
              styles.quantityButton,
              { borderColor: Colors[colorScheme].icon + "30" },
            ]}
            onPress={handleIncrement}
            hitSlop={8}
          >
            <ThemedText style={styles.quantityButtonText}>+</ThemedText>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function EmptyCart() {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.emptyContainer}
    >
      <ThemedText style={styles.emptyEmoji}>🛒</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Your cart is empty
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Browse products and add them to your cart
      </ThemedText>
      <Pressable
        style={({ pressed }) => [
          styles.browseButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => router.navigate("/(tabs)")}
      >
        <ThemedText style={styles.browseButtonText}>Browse products</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export default function CartScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const deliveryLocation = useCartStore((s) => s.deliveryLocation);
  const orderNotes = useCartStore((s) => s.orderNotes);
  const { getTotalPrice, getItemCount, clearCart, refreshStock } =
    useCartStore();
  const { setDeliveryLocation, setOrderNotes, resetCheckoutFields } =
    useCartStore();

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();
  const fees = calculateOrderFees(totalPrice);

  // Fetch stock data for cart items
  const productIds = items.map((item) => item.productId);
  const organizationId = items[0]?.organizationId ?? "";

  const { data: stockData } = useProductStock(productIds, organizationId);

  // Update cart with fresh stock data when it arrives
  useEffect(() => {
    if (stockData?.ok && stockData.stocks) {
      refreshStock(stockData.stocks);
    }
  }, [stockData, refreshStock]);

  const handleClearCart = () => {
    Alert.alert("Clear cart", "Remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearCart },
    ]);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!session) {
      setShowAuthPrompt(true);
      return;
    }

    if (!deliveryLocation.trim()) {
      Alert.alert("Delivery location required", "Please enter your location.");
      return;
    }

    if (isPlacingOrder) return;

    setIsPlacingOrder(true);
    try {
      const result = await api.orders.create({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        notes: orderNotes.trim() || undefined,
        deliveryLocation: deliveryLocation.trim(),
      });

      if (result.stockWarnings?.length) {
        Alert.alert(
          "Stock availability notice",
          result.stockWarnings.join(" "),
        );
      }

      clearCart();
      resetCheckoutFields();
      Alert.alert("Order placed", `Order #${result.orderNumber} created.`);
    } catch (error) {
      console.error("Failed to place order:", error);
      Alert.alert("Checkout failed", "Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Cart
        </ThemedText>
        {items.length > 0 ? (
          <Pressable onPress={handleClearCart} hitSlop={12}>
            <ThemedText
              style={[styles.clearText, { color: Colors[colorScheme].tint }]}
            >
              Clear all
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => <CartItemRow {...item} />}
        contentContainerStyle={
          items.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={EmptyCart}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />

      {items.length > 0 ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.footer,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.fieldLabel}>Delivery location</ThemedText>
            <TextInput
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
              placeholder="e.g., Kigali, Kicukiro"
              placeholderTextColor={Colors[colorScheme].icon + "80"}
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].background,
                  borderColor: Colors[colorScheme].icon + "20",
                  color: Colors[colorScheme].text,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.fieldLabel}>Special notes</ThemedText>
            <TextInput
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Any special instructions for the entire order..."
              placeholderTextColor={Colors[colorScheme].icon + "80"}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[
                styles.textarea,
                {
                  backgroundColor: Colors[colorScheme].background,
                  borderColor: Colors[colorScheme].icon + "20",
                  color: Colors[colorScheme].text,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.feesCard,
              {
                backgroundColor: Colors[colorScheme].icon + "08",
                borderColor: Colors[colorScheme].icon + "10",
              },
            ]}
          >
            <View style={styles.feeRow}>
              <ThemedText style={styles.feeLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.feeValue}>
                {formatPrice(fees.baseAmount)}
              </ThemedText>
            </View>
            <View style={styles.feeRow}>
              <ThemedText style={styles.feeLabel}>
                Processing fee (7.4%)
              </ThemedText>
              <ThemedText style={styles.feeValue}>
                {formatPrice(fees.totalFee)}
              </ThemedText>
            </View>
            <View style={styles.feeTotalRow}>
              <ThemedText style={styles.feeTotalLabel}>
                Total ({itemCount} {itemCount <= 1 ? "item" : "items"})
              </ThemedText>
              <ThemedText
                style={[
                  styles.feeTotalValue,
                  { color: Colors[colorScheme].tint },
                ]}
              >
                {formatPrice(fees.totalAmount)}
              </ThemedText>
            </View>
          </View>

          <Pressable
            style={[
              styles.checkoutButton,
              { backgroundColor: Colors[colorScheme].tint },
            ]}
            onPress={handleCheckout}
            disabled={isPlacingOrder}
          >
            <ThemedText style={styles.checkoutText}>
              {isPlacingOrder ? "Placing order..." : "Checkout"}
            </ThemedText>
          </Pressable>
        </Animated.View>
      ) : null}

      {showAuthPrompt && (
        <AuthPrompt action="cart" onCancel={() => setShowAuthPrompt(false)} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  clearText: {
    fontSize: 16,
    fontWeight: "500",
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 360,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  itemImageContainer: {
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 28,
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  stockHint: {
    fontSize: 12,
    opacity: 0.5,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 22,
  },
  quantityText: {
    fontSize: 17,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    opacity: 0.5,
  },
  browseButton: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: "#f97316",
    borderRadius: 24,
    borderCurve: "continuous",
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textarea: {
    minHeight: 84,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  feesCard: {
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabel: {
    fontSize: 13,
    opacity: 0.65,
  },
  feeValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  feeTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.12)",
  },
  feeTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  feeTotalValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: "700",
  },
  checkoutButton: {
    height: 56,
    borderRadius: 28,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
