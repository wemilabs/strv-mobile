import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";

const MERCHANT_PLANS_URL = "https://starva.shop/usage/pricing";
const MERCHANT_INFO_URL = "https://starva.shop/merchant-studio/how-it-works";

export default function MerchantStudioScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { icon: iconColor, tint } = Colors[colorScheme];

  const openUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: typeof tint === "string" ? tint : undefined,
      showTitle: true,
      enableBarCollapsing: true,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Merchant Studio
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Choose a plan to unlock merchant tools.
        </ThemedText>
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: tint + "14",
              borderColor: tint + "22",
            },
          ]}
        >
          <Ionicons name="storefront-outline" size={30} color={tint} />
        </View>

        <ThemedText style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Set up your merchant account
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          We’ll take you to the web to select a plan and subscribe. Once you’re
          done, come back to the app to access payouts, invoices, and more.
        </ThemedText>

        <View style={styles.actions}>
          <Pressable
            onPress={() => openUrl(MERCHANT_PLANS_URL)}
            style={[
              styles.footerButton,
              { backgroundColor: tint, borderColor: tint },
            ]}
          >
            <Ionicons name="sparkles-outline" size={18} color="#fff" />
            <ThemedText style={[styles.footerButtonText, { color: "#fff" }]}>
              Choose a plan
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => openUrl(MERCHANT_INFO_URL)}
            style={[styles.footerButton, { borderColor: iconColor + "25" }]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={iconColor}
            />
            <ThemedText style={styles.footerButtonText}>
              How it works
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/merchant-studio/nested-testing")}
            style={[styles.footerButton, { borderColor: iconColor + "25" }]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={iconColor}
            />
            <ThemedText style={styles.footerButtonText}>
              Nested Testing
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 114,
    paddingBottom: 12,
    gap: 6,
  },
  headerSubtitle: {
    opacity: 0.6,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 24,
  },
  hero: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.65,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: {
    marginTop: 14,
    width: "100%",
    gap: 10,
  },
  footerButton: {
    height: 54,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
