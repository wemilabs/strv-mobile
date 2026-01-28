import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.FlatList<Product>>();
  const scrollOffset = useScrollOffset(scrollRef);

  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(
    async (refresh = false) => {
      const currentOffset = refresh ? 0 : offset;

      try {
        const response =
          activeTab === "for-you"
            ? await api.products.list({
                sortBy: "popular",
                limit: 10,
                offset: currentOffset,
              })
            : await api.products.following({
                limit: 10,
                offset: currentOffset,
              });

        const newProducts = response.products;

        if (refresh) {
          setProducts(newProducts);
          setOffset(10);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
          setOffset((prev) => prev + 10);
        }

        setHasMore(newProducts.length === 10);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, offset],
  );

  useEffect(() => {
    setIsLoading(true);
    setProducts([]);
    setOffset(0);
    setHasMore(true);
    fetchProducts(true);
  }, [activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProducts(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchProducts(false);
    }
  };

  const handleLikeUpdate = useCallback(
    (slug: string, liked: boolean, likesCount: number) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, isLiked: liked, likesCount } : p,
        ),
      );
    },
    [],
  );

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

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onLikeUpdate={handleLikeUpdate} />
    ),
    [handleLikeUpdate],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

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

  const renderFooter = () => {
    if (!hasMore || isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={Colors[colorScheme].tint} />
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
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
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
