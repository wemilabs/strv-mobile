import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategorySelector } from "@/components/onboarding/category-selector";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { completeOnboarding } from "@/stores/preferences";
import type { ProductCategory } from "@/types";

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinue = selectedCategories.length >= 1;

  const handleContinue = async () => {
    if (!canContinue || isSubmitting) return;

    setIsSubmitting(true);
    await completeOnboarding(selectedCategories);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Animated.View entering={FadeInUp.duration(400)} style={styles.content}>
        <CategorySelector
          selectedCategories={selectedCategories}
          onSelectionChange={setSelectedCategories}
          minSelection={1}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(200).duration(400)}
        style={styles.footer}
      >
        <Pressable
          style={[
            styles.continueButton,
            { backgroundColor: Colors[colorScheme].tint },
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue || isSubmitting}
        >
          <ThemedText style={styles.continueButtonText}>
            {isSubmitting ? "Setting up..." : "Continue"}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={styles.skipButton}
        >
          <ThemedText style={styles.skipButtonText}>Skip for now</ThemedText>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  footer: {
    padding: 24,
    gap: 16,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
    padding: 12,
  },
  skipButtonText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
