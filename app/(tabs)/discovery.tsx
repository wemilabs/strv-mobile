import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthPrompt } from "@/components/auth-prompt";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Merchant } from "@/types";

type MerchantCardProps = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  category: string | null;
  rating: number | null;
  productsCount: number;
  isFollowing: boolean;
  onFollowPress: (id: string, slug: string) => void;
  onCardPress: (slug: string) => void;
};

const MerchantCard = function MerchantCard({
  id,
  slug,
  name,
  logo,
  category,
  rating,
  productsCount,
  isFollowing,
  onFollowPress,
  onCardPress,
}: MerchantCardProps) {
  const cardBg = useThemeColor(
    { light: "#f8f9fa", dark: "#1e2022" },
    "background",
  );
  const subtextColor = useThemeColor(
    { light: "#6b7280", dark: "#9ca3af" },
    "text",
  );
  const tintColor = useThemeColor({}, "tint");

  const handleFollowPress = () => {
    onFollowPress(id, slug);
  };

  const handleCardPress = () => {
    onCardPress(slug);
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardBg },
        pressed && { opacity: 0.9 },
      ]}
    >
      <Image
        source={
          logo ? { uri: logo } : require("@/assets/images/react-logo.png")
        }
        style={styles.cardImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <ThemedText type="defaultSemiBold" style={styles.storeName}>
              {name}
            </ThemedText>
            {category && (
              <ThemedText style={[styles.category, { color: subtextColor }]}>
                {category}
              </ThemedText>
            )}
          </View>
          <Pressable
            onPress={handleFollowPress}
            style={({ pressed }) => [
              styles.followButton,
              isFollowing && styles.followButtonActive,
              {
                backgroundColor: isFollowing ? tintColor : "transparent",
                borderColor: tintColor,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <ThemedText style={[styles.followButtonText, { color: tintColor }]}>
              {isFollowing ? "Unfollow" : "Follow"}
            </ThemedText>
          </Pressable>
        </View>
        <View style={styles.cardMeta}>
          {rating != null && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={14} color={tintColor} />
              <ThemedText style={styles.rating}>{rating.toFixed(1)}</ThemedText>
            </View>
          )}
          <View style={styles.productsContainer}>
            <IconSymbol name="bag.fill" size={12} color={subtextColor} />
            <ThemedText style={[styles.productsCount, { color: subtextColor }]}>
              {productsCount} products
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const keyExtractor = (item: Merchant) => item.id;
const ItemSeparator = () => <View style={styles.separator} />;

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const { data: session } = useSession();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["merchants"],
    queryFn: () => api.merchants.list(),
    staleTime: 5 * 60 * 1000,
  });

  const merchants = data?.merchants ?? [];

  const handleFollowPress = async (
    merchantId: string,
    merchantSlug: string,
  ) => {
    if (!session) {
      setShowAuthPrompt(true);
      return;
    }

    const queryClient = useQueryClient();
    const merchant = merchants.find((m) => m.id === merchantId);
    if (!merchant) return;

    const wasFollowing = merchant.isFollowing;

    // Optimistic update
    queryClient.setQueryData(["merchants"], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        merchants: oldData.merchants.map((m: Merchant) =>
          m.id === merchantId ? { ...m, isFollowing: !wasFollowing } : m,
        ),
      };
    });

    try {
      if (wasFollowing) {
        await api.merchants.unfollow(merchantSlug);
      } else {
        await api.merchants.follow(merchantSlug);
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
      // Revert optimistic update
      queryClient.setQueryData(["merchants"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          merchants: oldData.merchants.map((m: Merchant) =>
            m.id === merchantId ? { ...m, isFollowing: wasFollowing } : m,
          ),
        };
      });
    }
  };

  const handleCardPress = (slug: string) => {
    router.push({ pathname: "/merchant/[slug]", params: { slug } });
  };

  const renderItem = ({ item }: { item: Merchant }) => (
    <MerchantCard
      id={item.id}
      slug={item.slug}
      name={item.name}
      logo={item.logo}
      category={item.category}
      rating={item.rating}
      productsCount={item.productsCount}
      isFollowing={item.isFollowing ?? false}
      onFollowPress={handleFollowPress}
      onCardPress={handleCardPress}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Discover
        </ThemedText>
        <ThemedText style={styles.subtitle}>Explore stores</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={merchants}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refetch()}
            />
          }
        />
      )}

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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  storeName: {
    fontSize: 18,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  followButtonActive: {},
  followButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  category: {
    fontSize: 14,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
  },
  productsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productsCount: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
