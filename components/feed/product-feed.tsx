import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { ProductCard } from "@/components/product/product-card";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Product } from "@/types";

type ProductFeedProps = {
  products: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onLikeUpdate: (slug: string, liked: boolean, likesCount: number) => void;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement;
};

export function ProductFeed({
  products,
  isLoading,
  isRefreshing,
  hasMore,
  onRefresh,
  onLoadMore,
  onLikeUpdate,
  emptyMessage = "No products found",
  ListHeaderComponent,
}: ProductFeedProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      onLoadMore();
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  }, [isLoadingMore, hasMore, isLoading, onLoadMore]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onLikeUpdate={onLikeUpdate} />
    ),
    [onLikeUpdate],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore || !hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={Colors[colorScheme].tint} />
      </View>
    );
  }, [isLoadingMore, hasMore, colorScheme]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
      </View>
    );
  }, [isLoading, emptyMessage, colorScheme]);

  return (
    <FlatList
      ref={flatListRef}
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={Colors[colorScheme].tint}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
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
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
