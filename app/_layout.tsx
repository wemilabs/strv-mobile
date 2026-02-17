import { AntDesign } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Image } from "expo-image";
import { Link, router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "@/app/globals.css";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { QueryProvider } from "@/components/providers/query-client-provider";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart-store";
import { scrollToTop } from "@/lib/scroll-to-top";
import { getPreferences } from "@/stores/preferences";

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

  const headerIconColor = colorScheme === "dark" ? "white" : "black";

  const tab = (segments[1] ?? "index") as string;
  const title = getHeaderTitleFromSegments(segments);

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
                        <Pressable onPress={() => scrollToTop(tab)}>
                          <Image
                            source={{
                              uri: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6du5UdXxlTLMJtliDeN9nXqzs57GUH6RgZbryB",
                            }}
                            style={{ width: 60, height: 60 }}
                            contentFit="contain"
                          />
                        </Pressable>
                      )
                    : () => (
                        <Pressable onPress={() => scrollToTop(tab)}>
                          <ThemedText
                            style={{
                              fontWeight: "800",
                            }}
                          >
                            {title}
                          </ThemedText>
                        </Pressable>
                      ),
                headerTitleAlign: "center",
                headerTitleStyle: {
                  fontWeight: "800",
                  // fontSize: 18,
                },
                headerTransparent: true,
                headerBlurEffect: "none",
                headerShadowVisible: false,

                // These header functions might be replaced with Stack.Toolbar and Stack.Toolbar.Button
                // As recommended in the latest Expo SDK 55
                headerLeft: () => (
                  <Pressable
                    onPress={toggleProfileSidebar}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {session?.user?.image ? (
                      <Image
                        source={{ uri: session.user.image }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                        }}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons
                        name="person"
                        size={26}
                        color={headerIconColor}
                        style={{
                          transform: [{ translateX: 5 }, { translateY: -1 }],
                        }}
                      />
                    )}
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />

                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
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
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />

            <Stack.Screen
              name="product/[slug]"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />

            <Stack.Screen
              name="store/[slug]"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />

            <Stack.Screen
              name="payment-methods"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />

            <Stack.Screen
              name="saved-items"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />

            <Stack.Screen
              name="shipping-addresses"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />

            <Stack.Screen
              name="notifications"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />

            <Stack.Screen
              name="help-support"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerLeft: () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={headerIconColor}
                      style={{ transform: [{ translateX: 2 }] }}
                    />
                  </Pressable>
                ),
                headerRight: () => (
                  <Link href="/cart" asChild>
                    <Pressable
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="shopping-cart"
                        size={26}
                        color={headerIconColor}
                        style={{ transform: [{ translateX: 4 }] }}
                      />
                      {Number(badge) < 1 ? null : (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
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
                          <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>
                            {badge}
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
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
