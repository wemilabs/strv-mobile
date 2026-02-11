import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ProfilePanel } from "@/components/profile/profile-panel";

type ProfileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = Math.min(320, Math.round(SCREEN_WIDTH * 0.85));

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [isRendered, setIsRendered] = useState(isOpen);
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) setIsRendered(true);

    translateX.value = withTiming(isOpen ? 0 : -SIDEBAR_WIDTH, {
      duration: 220,
    });
    overlayOpacity.value = withTiming(isOpen ? 1 : 0, { duration: 180 });

    if (!isOpen) {
      const timeoutId = setTimeout(() => setIsRendered(false), 240);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, overlayOpacity, translateX]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  if (!isRendered) return null;

  return (
    <View style={styles.root} pointerEvents={isOpen ? "auto" : "none"}>
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: "rgba(0,0,0,0.35)" },
          overlayStyle,
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          { backgroundColor: Colors[colorScheme].background },
          sidebarStyle,
        ]}
      >
        <ProfilePanel
          variant="sidebar"
          onNavigate={onClose}
          scrollEnabled={true}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayPressable: {
    flex: 1,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
});
