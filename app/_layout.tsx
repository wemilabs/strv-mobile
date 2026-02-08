import "@/app/globals.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getPreferences } from "@/stores/preferences";
import { QueryProvider } from "@/components/providers/query-client-provider";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const hasNavigated = useRef(false);

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

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen
              name="product/[slug]"
              options={{
                headerShown: true,
                headerBackTitle: "Back",
                headerTransparent: true,
                headerTitle: "",
              }}
            />
            <Stack.Screen
              name="merchant/[slug]"
              options={{
                headerShown: true,
                headerBackTitle: "Back",
                headerTransparent: true,
                headerTitle: "",
              }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
