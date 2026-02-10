import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { Platform, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import "@/app/globals.css";
import { QueryProvider } from "@/components/providers/query-client-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getPreferences } from "@/stores/preferences";
import { useCartStore } from "@/lib/cart-store";
import { ThemedText } from "@/components/themed-text";

export const unstable_settings = {
  anchor: "(tabs)",
};

const formatBadge = (count: number) => (count > 9 ? "9+" : String(count));

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const hasNavigated = useRef(false);

  const showCartModalScreen = () => router.push("/cart");

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
                headerTitle: "",
                headerTitleAlign: "center",
                headerTransparent: true,
                headerRight: () => (
                  <Pressable
                    onPress={showCartModalScreen}
                    style={{
                      width: "auto",
                      height: "auto",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="bag-handle"
                      size={30}
                      style={{ marginHorizontal: 0 }}
                    />
                    <ThemedText>
                      {Number(badge) < 1 ? null : `${badge}`}
                    </ThemedText>
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
                      width: "auto",
                      height: "auto",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="bag-handle"
                      size={30}
                      style={{ marginHorizontal: 0 }}
                    />
                    <ThemedText>
                      {Number(badge) < 1 ? null : `${badge}`}
                    </ThemedText>
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
                      width: "auto",
                      height: "auto",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="bag-handle"
                      size={30}
                      style={{ marginHorizontal: 0 }}
                    />
                    <ThemedText>
                      {Number(badge) < 1 ? null : `${badge}`}
                    </ThemedText>
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
                      width: "auto",
                      height: "auto",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="bag-handle"
                      size={30}
                      style={{ marginHorizontal: 0 }}
                    />
                    <ThemedText>
                      {Number(badge) < 1 ? null : `${badge}`}
                    </ThemedText>
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
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
