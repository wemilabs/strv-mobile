import Ionicons from "@expo/vector-icons/Ionicons";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { icon: iconColor, tint } = Colors[colorScheme];

  const handleOpenFeedback = () => {
    Linking.openURL("https://starva.shop/feedback");
  };

  const handleOpenWhatsApp = () => {
    Linking.openURL("https://wa.me/250793905099");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Help & Support
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          We’re here if you need anything
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
          <Ionicons name="help-circle-outline" size={30} color={tint} />
        </View>

        <ThemedText style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Get in touch
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Share feedback or chat with our support team on WhatsApp.
        </ThemedText>

        <View style={styles.actions}>
          <Pressable
            style={[
              styles.footerButton,
              { backgroundColor: tint, borderColor: tint },
            ]}
            onPress={handleOpenFeedback}
          >
            <Ionicons name="chatbox-ellipses-outline" size={18} color="#fff" />
            <ThemedText style={[styles.footerButtonText, { color: "#fff" }]}>
              Send feedback
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.footerButton, { borderColor: iconColor + "25" }]}
            onPress={handleOpenWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={18} color={iconColor} />
            <ThemedText style={styles.footerButtonText}>
              Chat on WhatsApp
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
