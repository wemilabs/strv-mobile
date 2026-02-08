import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
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

const HEADER_HEIGHT = 200;
// const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
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

  const renderHeader = () => (
    <View>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: Colors[colorScheme].tint },
          headerAnimatedStyle,
        ]}
      >
        <View style={styles.headerContent}>
          <Text className="text-4xl font-extrabold text-white/90">
            ✨ Starva
          </Text>
          <ThemedText style={styles.tagline}>
            Discover amazing products
          </ThemedText>
        </View>
      </Animated.View>
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );

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
      <Animated.FlatList
        ref={scrollRef}
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
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
    padding: 24,
    paddingBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
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
