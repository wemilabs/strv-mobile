import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthPrompt } from "@/components/auth-prompt";
import { ProductCard } from "@/components/product/product-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Product } from "@/types";

export default function MerchantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const { data: session } = useSession();
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, "tint");

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const { data: merchant, isLoading } = useQuery({
    queryKey: ["merchant", slug],
    queryFn: () => api.merchants.bySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const handleFollow = async () => {
    if (!merchant) return;

    if (!session) {
      setShowAuthPrompt(true);
      return;
    }

    const queryClient = useQueryClient();
    const wasFollowing = merchant.isFollowing;

    // Optimistic update
    queryClient.setQueryData(["merchant", slug], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        isFollowing: !wasFollowing,
        followerCount: wasFollowing
          ? oldData.followerCount - 1
          : oldData.followerCount + 1,
      };
    });

    setIsFollowLoading(true);
    try {
      if (wasFollowing) {
        await api.merchants.unfollow(merchant.slug);
      } else {
        await api.merchants.follow(merchant.slug);
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
      // Revert optimistic update
      queryClient.setQueryData(["merchant", slug], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          isFollowing: wasFollowing,
          followerCount: wasFollowing
            ? oldData.followerCount + 1
            : oldData.followerCount - 1,
        };
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleProductLikeUpdate = (
    productSlug: string,
    isLiked: boolean,
    likesCount: number,
  ) => {
    const queryClient = useQueryClient();
    queryClient.setQueryData(["merchant", slug], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        products: oldData.products.map((p: Product) =>
          p.slug === productSlug ? { ...p, isLiked, likesCount } : p,
        ),
      };
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard product={item} onLikeUpdate={handleProductLikeUpdate} />
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ headerTransparent: true, title: "" }} />
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  if (!merchant) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ headerTransparent: true, title: "" }} />
        <ThemedText>Merchant not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerTransparent: true, title: "" }} />

      <FlatList
        data={merchant.products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={styles.merchantInfo}>
              <Image
                source={
                  merchant.logo
                    ? { uri: merchant.logo }
                    : require("@/assets/images/react-logo.png")
                }
                style={styles.logo}
                contentFit="cover"
                transition={200}
              />
              <ThemedText type="title" style={styles.merchantName}>
                {merchant.name}
              </ThemedText>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <ThemedText type="defaultSemiBold">
                    {merchant.followerCount}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>
                    Follower{merchant.followerCount <= 1 ? "" : "s"}
                  </ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <ThemedText type="defaultSemiBold">
                    {merchant.productCount}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Products</ThemedText>
                </View>
              </View>

              <Pressable
                onPress={handleFollow}
                disabled={isFollowLoading}
                style={({ pressed }) => [
                  styles.followButton,
                  merchant.isFollowing && styles.followButtonActive,
                  {
                    backgroundColor: merchant.isFollowing
                      ? tintColor
                      : "transparent",
                    borderColor: tintColor,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <ThemedText
                  style={[
                    styles.followButtonText,
                    { color: merchant.isFollowing ? "#fff" : tintColor },
                  ]}
                >
                  {merchant.isFollowing ? "Unfollow" : "Follow"}
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText type="subtitle" style={styles.productsTitle}>
              Products
            </ThemedText>
          </Animated.View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No products available
            </ThemedText>
          </View>
        }
      />

      {showAuthPrompt && (
        <AuthPrompt action="follow" onCancel={() => setShowAuthPrompt(false)} />
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
  merchantInfo: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  merchantName: {
    textAlign: "center",
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  },
  followButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
  },
  followButtonActive: {},
  followButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  productsTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.6,
  },
});
