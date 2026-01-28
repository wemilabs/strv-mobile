import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type FeedTab = "for-you" | "following";

type FeedTabsProps = {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
};

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const colorScheme = useColorScheme() ?? "light";
  const indicatorPosition = useSharedValue(activeTab === "for-you" ? 0 : 1);

  const handleTabPress = (tab: FeedTab) => {
    indicatorPosition.value = withSpring(tab === "for-you" ? 0 : 1, {
      damping: 20,
      stiffness: 300,
    });
    onTabChange(tab);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * 100 }],
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.tabsWrapper}>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: Colors[colorScheme].tint },
            indicatorStyle,
          ]}
        />
        <Pressable style={styles.tab} onPress={() => handleTabPress("for-you")}>
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "for-you" && styles.tabTextActive,
            ]}
          >
            For You
          </ThemedText>
        </Pressable>
        <Pressable
          style={styles.tab}
          onPress={() => handleTabPress("following")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "following" && styles.tabTextActive,
            ]}
          >
            Following
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  tabsWrapper: {
    flexDirection: "row",
    position: "relative",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 24,
    padding: 4,
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 100,
    height: 36,
    borderRadius: 20,
  },
  tab: {
    width: 100,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
    fontWeight: "600",
  },
});
