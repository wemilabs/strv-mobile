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

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 12),
        paddingBottom: 40,
      }}
      scrollEnabled={scrollEnabled}
    >
      <View style={styles.header}>
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
        <ThemedText style={[styles.userName, { fontFamily: Fonts.rounded }]}>
          {user.name || "User"}
        </ThemedText>
        <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>

        <Pressable
          style={[
            styles.menuItem,
            { borderBottomColor: Colors[colorScheme].icon + "20" },
          ]}
          // onPress={() => handlePush("/payment-methods")}
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
          // onPress={() => handlePush("/saved-items")}
        >
          <IconSymbol name="heart" size={22} color={Colors[colorScheme].icon} />
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
          // onPress={() => handlePush("/shipping-addresses")}
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
          // onPress={() => handlePush("/notifications")}
        >
          <IconSymbol name="bell" size={22} color={Colors[colorScheme].icon} />
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
          // onPress={() => handlePush("/help-support")}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 40,
  },
  notSignedInTitle: {
    fontSize: 22,
    fontWeight: "600",
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
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "600",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
  },
  userEmail: {
    fontSize: 15,
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
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
    marginLeft: 14,
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 40,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
