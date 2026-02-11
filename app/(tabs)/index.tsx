import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

import { FeedTabs, type FeedTab } from "@/components/feed/feed-tabs";
import { ProductCard } from "@/components/product/product-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { api } from "@/lib/api";
import type { Product } from "@/types";

// in dark mode, the icon remain black and doesnt turn white so to be visible
// work on the like feature properly

const HEADER_HEIGHT = 148;

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Home" }} />
      <HomeScreenContent />
    </>
  );
}

function HomeScreenContent() {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.FlatList<Product>>();
  const scrollOffset = useScrollOffset(scrollRef);

  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", activeTab],
    queryFn: () =>
      activeTab === "for-you"
        ? api.products.forYou()
        : api.products.following(),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.products ?? [];

  const handleLikeUpdate = (
    slug: string,
    liked: boolean,
    likesCount: number,
  ) => {
    // Update local data optimistically
    const queryClient = useQueryClient();
    queryClient.setQueryData(["products", activeTab], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        products: oldData.products.map((product: Product) =>
          product.slug === slug
            ? { ...product, isLiked: liked, likesCount }
            : product,
        ),
      };
    });
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [2, 1, 1],
        ),
      },
    ],
  }));

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard product={item} onLikeUpdate={handleLikeUpdate} />
  );

  const keyExtractor = (item: Product) => item.id;

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <ThemedText style={styles.emptyText}>
          {activeTab === "following"
            ? "Follow merchants to see their products here"
            : "No products found"}
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <Animated.FlatList
        ref={scrollRef}
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        // ListHeaderComponent={
        // <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
        // }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={null}
        onEndReached={undefined}
        onEndReachedThreshold={undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => refetch()}
            tintColor={Colors[colorScheme].tint}
            progressViewOffset={HEADER_HEIGHT}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  headerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
