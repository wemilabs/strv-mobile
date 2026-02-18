import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthPrompt } from "@/components/auth-prompt";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { signOut, useSession } from "@/lib/auth-client";

type ProfilePanelProps = {
  onNavigate?: () => void;
  scrollEnabled?: boolean;
};

export function ProfilePanel({
  onNavigate,
  scrollEnabled = true,
}: ProfilePanelProps) {
  const { data: session, isPending } = useSession();
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handlePush = (href: Href) => {
    onNavigate?.();
    router.push(href);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      onNavigate?.();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  if (!session?.user) {
    return (
      <View style={styles.container}>
        <View style={styles.notSignedInContainer}>
          <IconSymbol
            name="person.crop.circle"
            size={80}
            color={Colors[colorScheme].icon}
          />
          <ThemedText style={styles.notSignedInTitle}>
            Sign in to your account
          </ThemedText>
          <ThemedText style={styles.notSignedInSubtitle}>
            View your orders, save favorites, and more
          </ThemedText>
          <Pressable
            style={[
              styles.signInButton,
              { backgroundColor: Colors[colorScheme].tint },
            ]}
            onPress={() => setShowAuthPrompt(true)}
          >
            <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
          </Pressable>
        </View>

        {showAuthPrompt && (
          <AuthPrompt
            action="follow"
            onCancel={() => setShowAuthPrompt(false)}
          />
        )}
      </View>
    );
  }

  const user = session.user;
  const followersCount =
    (user as { followersCount?: number }).followersCount ?? 0;
  const followingCount =
    (user as { followingCount?: number }).followingCount ?? 0;
  const formattedFollowersCount = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(followersCount);
  const formattedFollowingCount = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(followingCount);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: 24,
        }}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: Colors[colorScheme].tint },
                ]}
              >
                <ThemedText style={styles.avatarInitial}>
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
            <View style={styles.userInfo}>
              <ThemedText
                style={[styles.userName, { fontFamily: Fonts.rounded }]}
              >
                {user.name || "User"}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formattedFollowingCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Following</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formattedFollowersCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                Follower{followersCount <= 1 ? "" : "s"}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: Colors[colorScheme].icon + "20" },
            ]}
            onPress={() => handlePush("/payment-methods")}
          >
            <IconSymbol
              name="creditcard"
              size={22}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.menuItemText}>Payment Methods</ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors[colorScheme].icon}
            />
          </Pressable>
          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: Colors[colorScheme].icon + "20" },
            ]}
            onPress={() => handlePush("/saved-items")}
          >
            <IconSymbol
              name="heart"
              size={22}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.menuItemText}>Saved Items</ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors[colorScheme].icon}
            />
          </Pressable>
          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: Colors[colorScheme].icon + "20" },
            ]}
            onPress={() => handlePush("/shipping-addresses")}
          >
            <IconSymbol
              name="location"
              size={22}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.menuItemText}>
              Shipping Addresses
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors[colorScheme].icon}
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: Colors[colorScheme].icon + "20" },
            ]}
            onPress={() => handlePush("/notifications")}
          >
            <IconSymbol
              name="bell"
              size={22}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.menuItemText}>Notifications</ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors[colorScheme].icon}
            />
          </Pressable>
          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: Colors[colorScheme].icon + "20" },
            ]}
            onPress={() => handlePush("/preferences")}
          >
            <IconSymbol
              name="bookmark.fill"
              size={22}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.menuItemText}>Preferences</ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors[colorScheme].icon}
            />
          </Pressable>
          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: Colors[colorScheme].icon + "20" },
            ]}
            onPress={() => handlePush("/help-support")}
          >
            <IconSymbol
              name="questionmark.circle"
              size={22}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.menuItemText}>Help & Support</ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors[colorScheme].icon}
            />
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <Pressable
          style={[styles.signOutButton, { borderColor: "#ff4444" }]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color="#ff4444" />
          ) : (
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notSignedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notSignedInTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 20,
    textAlign: "center",
  },
  notSignedInSubtitle: {
    fontSize: 15,
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
  },
  signInButton: {
    marginTop: 24,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
  },
  header: {
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 700,
    color: "#fff",
  },
  userInfo: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  userName: {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 16,
  },
  userEmail: {
    fontSize: 15,
    opacity: 0.7,
  },
  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginTop: 36,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    opacity: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 700,
    marginLeft: 14,
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  footer: {
    paddingTop: 12,
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: 700,
  },
});
