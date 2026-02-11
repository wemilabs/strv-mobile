import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { Platform, Pressable, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";

import "@/app/globals.css";
import { QueryProvider } from "@/components/providers/query-client-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getPreferences } from "@/stores/preferences";
import { useCartStore } from "@/lib/cart-store";
import { ThemedText } from "@/components/themed-text";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { useSession } from "@/lib/auth-client";

export const unstable_settings = {
  anchor: "(tabs)",
};

const formatBadge = (count: number) => (count > 9 ? "9+" : String(count));

const getHeaderTitleFromSegments = (segments: string[]) => {
  const tab = segments[1] ?? "index";
  switch (tab) {
    case "explore":
      return "Search";
    case "discovery":
      return "Discovery";
    case "my-orders":
      return "My Orders";
    default:
      return "";
  }
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const { data: session } = useSession();
  const [isReady, setIsReady] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] =
    useState<boolean>(false);
  const hasNavigated = useRef(false);

  const tab = (segments[1] ?? "index") as string;
  const title = getHeaderTitleFromSegments(segments);

  const showCartModalScreen = () => router.push("/cart");
  const toggleProfileSidebar = () => setIsProfileSidebarOpen((prev) => !prev);

  const itemCount = useCartStore((s) =>
    s.items.reduce((count, item) => count + item.quantity, 0),
  );

  const badge = formatBadge(itemCount);

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const preferences = await getPreferences();
        setIsReady(true);

        if (!preferences.onboardingCompleted && !hasNavigated.current) {
          hasNavigated.current = true;
          setTimeout(() => router.replace("/onboarding"), 0);
        }
      } catch (error) {
        console.error("Failed to check preferences:", error);
        setIsReady(true);
      }
    }

    checkOnboardingStatus();
  }, []);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            {/* <Stack.Toolbar placement="rigth">
              <Stack.Toolbar.Button
                icon={Platform.OS === "ios" ? "bag.fill" : "ic_menu_cart"}
                tintColor="orange"
                variant="prominent"
                style={{ fontWeight: "bold" }}
                onPress={showCartModalScreen}
              />
            </Stack.Toolbar> */}
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: true,
                headerTitle:
                  tab === "index"
                    ? () => (
                        <Image
                          source={{
                            uri: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6du5UdXxlTLMJtliDeN9nXqzs57GUH6RgZbryB",
                          }}
                          style={{ width: 60, height: 60 }}
                          contentFit="contain"
                        />
                      )
                    : title,
                headerTitleAlign: "center",
                headerTitleStyle: {
                  fontWeight: "800",
                  // fontSize: 18,
                },
                headerTransparent: false,
                headerBlurEffect: "none",
                headerShadowVisible: false,

                // These header functions might be unecessary once we'll update to Expo SDK 55
                // As they'll recommend to use the commented below Stack.Toolbar and Stack.Toolbar.Button
                headerLeft: () => (
                  <Pressable
                    onPress={toggleProfileSidebar}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {session?.user?.image ? (
                      <Image
                        source={{ uri: session.user.image }}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={26} />
                    )}
                  </Pressable>
                ),
                headerRight: () => (
                  <Pressable
                    onPress={showCartModalScreen}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Ionicons name="bag-handle" size={24} />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -8,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            paddingHorizontal: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#ff3b30",
                          }}
                        >
                          <ThemedText style={{ fontSize: 10, lineHeight: 12 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ),
              }}
            />
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen
              name="my-orders/[id]"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerRight: () => (
                  <Pressable
                    onPress={showCartModalScreen}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Ionicons name="bag-handle" size={24} />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -8,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            paddingHorizontal: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#ff3b30",
                          }}
                        >
                          <ThemedText style={{ fontSize: 10, lineHeight: 12 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ),
              }}
            />
            <Stack.Screen
              name="product/[slug]"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerRight: () => (
                  <Pressable
                    onPress={showCartModalScreen}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Ionicons name="bag-handle" size={24} />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -8,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            paddingHorizontal: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#ff3b30",
                          }}
                        >
                          <ThemedText style={{ fontSize: 10, lineHeight: 12 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ),
              }}
            />
            <Stack.Screen
              name="store/[slug]"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerRight: () => (
                  <Pressable
                    onPress={showCartModalScreen}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Ionicons name="bag-handle" size={24} />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -8,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            paddingHorizontal: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#ff3b30",
                          }}
                        >
                          <ThemedText style={{ fontSize: 10, lineHeight: 12 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ),
              }}
            />
            <Stack.Screen
              name="cart"
              options={{
                presentation: "modal",
                title: "Cart",
                headerShown: false,
              }}
            />
          </Stack>
          <ProfileSidebar
            isOpen={isProfileSidebarOpen}
            onClose={toggleProfileSidebar}
          />
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
