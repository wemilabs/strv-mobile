import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ProfilePanel } from "@/components/profile/profile-panel";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ProfileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = Math.min(320, Math.round(SCREEN_WIDTH * 0.85));

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const translateX = useSharedValue(isOpen ? 0 : -SIDEBAR_WIDTH);
  const overlayOpacity = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : -SIDEBAR_WIDTH, {
      damping: 22,
      stiffness: 180,
      mass: 1,
      overshootClamping: true,
    });

    overlayOpacity.value = withTiming(isOpen ? 1 : 0, {
      duration: isOpen ? 220 : 280,
      easing: Easing.out(Easing.cubic),
    });
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

  return (
    <View style={styles.root} pointerEvents={isOpen ? "auto" : "none"}>
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: "rgba(0,0,0,0.35)" },
          overlayStyle,
        ]}
      >
        <Pressable
          style={styles.overlayPressable}
          onPress={onClose}
          disabled={!isOpen}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          { backgroundColor: Colors[colorScheme].background },
          sidebarStyle,
        ]}
      >
        <ProfilePanel onNavigate={onClose} scrollEnabled={true} />
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
