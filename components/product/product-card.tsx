import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { AuthPrompt } from "../auth-prompt";

type ProductCardProps = {
  product: Product;
  onLikeUpdate?: (slug: string, liked: boolean, likesCount: number) => void;
};

export function ProductCard({ product, onLikeUpdate }: ProductCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const scale = useSharedValue(1);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const patchLikeState = (liked: boolean, likesCount: number) => {
    queryClient.setQueriesData(
      { queryKey: ["products"], exact: false },
      (d: any) => {
        if (!d?.products) return d;
        return {
          ...d,
          products: d.products.map((p: Product) =>
            p.slug === product.slug ? { ...p, isLiked: liked, likesCount } : p,
          ),
        };
      },
    );

    queryClient.setQueriesData(
      { queryKey: ["merchant"], exact: false },
      (d: any) => {
        if (!d?.products) return d;
        return {
          ...d,
          products: d.products.map((p: Product) =>
            p.slug === product.slug ? { ...p, isLiked: liked, likesCount } : p,
          ),
        };
      },
    );

    queryClient.setQueryData(["product", product.slug], (d: any) => {
      if (!d) return d;
      return { ...d, isLiked: liked, likesCount };
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleLike = async () => {
    if (!session) {
      setShowAuthPrompt(true);
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    try {
      const preferUnlike = product.isLiked;

      let result = preferUnlike
        ? await api.products.unlike(product.slug)
        : await api.products.like(product.slug);

      // If local `isLiked` is stale (e.g. coming from a cached store/merchant page),
      // the server may respond 400. In that case we retry the opposite action once.
      if (!result?.success) {
        throw new Error("API error: 400");
      }

      onLikeUpdate?.(product.slug, result.liked, result.likesCount);
      patchLikeState(result.liked, result.likesCount);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("400")) {
        try {
          const result = product.isLiked
            ? await api.products.like(product.slug)
            : await api.products.unlike(product.slug);

          onLikeUpdate?.(product.slug, result.liked, result.likesCount);
          patchLikeState(result.liked, result.likesCount);
          return;
        } catch (retryError) {
          console.error("Failed to toggle like:", retryError);
          return;
        }
      }

      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // const LinkElement = Platform.OS === "ios" ? Link.AppleZoom : Link;

  return (
    <>
      <Link href={`/product/${product.slug}` as any} asChild>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View
            style={[
              styles.container,
              { backgroundColor: Colors[colorScheme].background },
              animatedStyle,
            ]}
          >
            <View style={styles.imageContainer}>
              {product.imageUrls?.[0] && (
                <Image
                  source={{ uri: product.imageUrls[0] }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
              )}
              <Pressable
                style={[
                  styles.likeButton,
                  product.isLiked && styles.likeButtonActive,
                ]}
                onPress={handleLike}
              >
                <Ionicons
                  name={product.isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={product.isLiked ? "white" : "black"}
                />
              </Pressable>
            </View>

            <View style={styles.content}>
              {product.organization && (
                <View style={styles.merchantRow}>
                  {product.organization.logo && (
                    <Image
                      source={{ uri: product.organization.logo }}
                      style={styles.merchantLogo}
                      contentFit="cover"
                    />
                  )}
                  <ThemedText style={styles.merchantName} numberOfLines={1}>
                    {product.organization.name}
                  </ThemedText>
                </View>
              )}

              <ThemedText style={styles.productName} numberOfLines={2}>
                {product.name}
              </ThemedText>

              {product.description && (
                <ThemedText style={styles.description} numberOfLines={2}>
                  {product.description}
                </ThemedText>
              )}

              <View style={styles.footer}>
                <ThemedText style={styles.price}>
                  {formatPrice(product.price)}
                </ThemedText>
                <View style={styles.stats}>
                  <ThemedText style={styles.likes}>
                    ♥ {product.likesCount}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Link>

      {showAuthPrompt && (
        <AuthPrompt action="like" onCancel={() => setShowAuthPrompt(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  likeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  likeButtonActive: {
    backgroundColor: "#ff4757",
  },
  likeIcon: {
    fontSize: 20,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  merchantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  merchantLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  merchantName: {
    fontSize: 13,
    opacity: 0.7,
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f97316",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  likes: {
    fontSize: 14,
    opacity: 0.6,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
  },
});
