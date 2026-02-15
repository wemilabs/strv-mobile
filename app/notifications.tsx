import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = Colors[colorScheme].icon;
  const tint = Colors[colorScheme].tint;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Notifications
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Stay up to date with orders and updates
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
          <Ionicons name="notifications-outline" size={30} color={tint} />
        </View>

        <ThemedText style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Nothing new yet
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          When you have updates, they’ll show up here. You can also control what
          you receive in your notification settings.
        </ThemedText>

        <View style={styles.actions}>
          <View
            style={[
              styles.primaryButton,
              { backgroundColor: tint, borderColor: tint },
            ]}
          >
            <Ionicons name="options-outline" size={18} color="#fff" />
            <ThemedText style={styles.primaryButtonText}>
              Notification settings
            </ThemedText>
          </View>

          <View
            style={[
              styles.secondaryButton,
              { borderColor: Colors[colorScheme].icon + "25" },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={iconColor}
            />
            <ThemedText style={styles.secondaryButtonText}>
              Test notification
            </ThemedText>
          </View>
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
  primaryButton: {
    height: 54,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 54,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
