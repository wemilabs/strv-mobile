import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { signIn } from "@/lib/auth-client";

type AuthPromptProps = {
  action: "like" | "follow" | "cart";
  onCancel: () => void;
};

const messages = {
  like: {
    title: "Sign in to save products",
    description: "Keep track of products you love and never lose them",
  },
  follow: {
    title: "Sign in to follow stores",
    description: "Stay updated with new products from your favorite stores",
  },
  cart: {
    title: "Sign in to purchase",
    description: "Add products to cart and complete your purchase",
  },
};

export function AuthPrompt({ action, onCancel }: AuthPromptProps) {
  const colorScheme = useColorScheme() ?? "light";
  const scale = useSharedValue(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    scale.value = withSpring(0.95);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      onCancel();
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    scale.value = withSpring(0.95);
    setTimeout(onCancel, 100);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <ThemedText style={styles.title}>{messages[action].title}</ThemedText>
        <ThemedText style={styles.description}>
          {messages[action].description}
        </ThemedText>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <ThemedText style={styles.cancelText}>Maybe later</ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              styles.signInButton,
              { backgroundColor: Colors[colorScheme].tint },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <ThemedText style={styles.signInText}>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 320,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttons: {
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signInButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
