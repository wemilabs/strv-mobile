import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { ProductCard } from "@/components/product/product-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Product, ProductsResponse } from "@/types";
import { router } from "expo-router";

export default function SavedItemsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const userId = session?.user?.id;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["saved-products"],
    queryFn: (_context) => api.user.likedProducts(),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  const products = data?.products ?? [];

  const handleLikeUpdate = (
    slug: string,
    liked: boolean,
    likesCount: number,
  ) => {
    if (!userId) return;

    queryClient.setQueryData(
      ["saved-products"],
      (oldData: ProductsResponse | undefined) => {
        if (!oldData) return oldData;

        const nextProducts = liked
          ? oldData.products.map((p) =>
              p.slug === slug ? { ...p, isLiked: liked, likesCount } : p,
            )
          : oldData.products.filter((p) => p.slug !== slug);

        return {
          ...oldData,
          products: nextProducts,
          total: nextProducts.length,
        };
      },
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <ProductCard product={item} onLikeUpdate={handleLikeUpdate} />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
              Saved items
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Keep track of products you love
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.body} />
          ) : (
            <View style={styles.body}>
              <View
                style={[
                  styles.hero,
                  {
                    backgroundColor: tint + "14",
                    borderColor: tint + "22",
                  },
                ]}
              >
                <Ionicons name="heart-outline" size={30} color={tint} />
              </View>

              <ThemedText style={[styles.title, { fontFamily: Fonts.rounded }]}>
                No saved items yet
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Tap the heart on any product to save it here for later.
              </ThemedText>

              <View style={styles.actions}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: tint, borderColor: tint },
                  ]}
                  onPress={() => router.push("/(tabs)")}
                >
                  <Ionicons name="search-outline" size={18} color="#fff" />
                  <ThemedText style={styles.primaryButtonText}>
                    Browse products
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )
        }
        ListFooterComponent={null}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={tint}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 114,
    paddingBottom: 12,
    gap: 6,
  },
  headerSubtitle: {
    opacity: 0.6,
  },
  productWrapper: {
    width: "50%",
  },
  productRow: {
    justifyContent: "space-between",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 24,
  },
  hero: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.65,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: {
    marginTop: 14,
    width: "100%",
    gap: 10,
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 54,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
