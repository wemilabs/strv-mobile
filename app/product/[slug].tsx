import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { AuthPrompt } from "@/components/auth-prompt";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const { data: session } = useSession();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const likeScale = useSharedValue(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.products.bySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const handleLike = async () => {
    if (!product || isLiking) return;

    if (!session) {
      setShowAuthPrompt(true);
      return;
    }

    likeScale.value = withSpring(1.3, {}, () => {
      likeScale.value = withSpring(1);
    });

    const queryClient = useQueryClient();
    const previousState = {
      isLiked: product.isLiked,
      likesCount: product.likesCount,
    };

    // Optimistic update
    queryClient.setQueryData(["product", slug], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        isLiked: !oldData.isLiked,
        likesCount: oldData.isLiked
          ? oldData.likesCount - 1
          : oldData.likesCount + 1,
      };
    });

    setIsLiking(true);
    try {
      const result = previousState.isLiked
        ? await api.products.unlike(product.slug)
        : await api.products.like(product.slug);

      // Update with server response
      queryClient.setQueryData(["product", slug], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          isLiked: result.liked,
          likesCount: result.likesCount,
        };
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert optimistic update
      queryClient.setQueryData(["product", slug], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, ...previousState };
      });
    } finally {
      setIsLiking(false);
    }
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!session) {
      setShowAuthPrompt(true);
      return;
    }

    if (!product) return;

    try {
      addItem({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImages: product.imageUrls ?? null,
        organizationId: product.organizationId,
        price: product.price,
        category: product.category,
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Stock limit", error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Product not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerRight: () => (
            <Pressable onPress={handleLike}>
              <Animated.View style={likeAnimatedStyle}>
                <ThemedText style={styles.headerLike}>
                  {product.isLiked ? "♥" : "♡"}
                </ThemedText>
              </Animated.View>
            </Pressable>
          ),
        }}
      /> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={styles.imageContainer}>
            {product.imageUrls?.[selectedImageIndex] && (
              <Image
                source={{ uri: product.imageUrls[selectedImageIndex] }}
                style={styles.mainImage}
                contentFit="cover"
                transition={200}
              />
            )}
            {/* <Pressable onPress={handleLike}>
              <Animated.View style={likeAnimatedStyle}>
                <ThemedText style={styles.headerLike}>
                  {product.isLiked ? "♥" : "♡"}
                </ThemedText>
              </Animated.View>
            </Pressable> */}
          </View>

          {(product.imageUrls?.length ?? 0) > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
            >
              {product.imageUrls?.map((url, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image
                    source={{ uri: url }}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && {
                        borderColor: Colors[colorScheme].tint,
                        borderWidth: 2,
                      },
                    ]}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(150).duration(300)}
          style={styles.content}
        >
          {product.organization && (
            <Pressable
              style={styles.merchantRow}
              onPress={() =>
                router.push(`/store/${product.organization?.slug}` as any)
              }
            >
              {product.organization.logo && (
                <Image
                  source={{ uri: product.organization.logo }}
                  style={styles.merchantLogo}
                  contentFit="cover"
                />
              )}
              <View style={styles.merchantInfo}>
                <ThemedText style={styles.merchantName}>
                  {product.organization.name}
                </ThemedText>
                <ThemedText style={styles.merchantAction}>
                  Visit store →
                </ThemedText>
              </View>
            </Pressable>
          )}

          <ThemedText style={styles.productName}>{product.name}</ThemedText>

          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>
              {formatPrice(product.price)}
            </ThemedText>
            <View style={styles.stats}>
              <ThemedText style={styles.likes}>
                ♥ {product.likesCount}
              </ThemedText>
            </View>
          </View>

          {product.description && (
            <ThemedText style={styles.description}>
              {product.description}
            </ThemedText>
          )}

          {(product.tags?.length ?? 0) > 0 && (
            <View style={styles.tags}>
              {product.tags?.map((tag) => (
                <View
                  key={tag.id}
                  style={[
                    styles.tag,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <ThemedText style={styles.tagText}>{tag.name}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {product.calories && (
            <View style={styles.nutritionInfo}>
              <ThemedText style={styles.nutritionLabel}>Calories</ThemedText>
              <ThemedText style={styles.nutritionValue}>
                {product.calories} kcal
              </ThemedText>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeIn.delay(300).duration(300)}
        style={[
          styles.footer,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <Pressable
          style={[
            styles.addToCartButton,
            { backgroundColor: Colors[colorScheme].tint },
          ]}
          onPress={handleAddToCart}
        >
          <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
        </Pressable>
      </Animated.View>

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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 8,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  merchantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  merchantLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "600",
  },
  merchantAction: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  productName: {
    fontSize: 26,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: "#f97316",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  likes: {
    fontSize: 15,
    opacity: 0.6,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
  },
  nutritionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  nutritionLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  addToCartButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerLike: {
    fontSize: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
