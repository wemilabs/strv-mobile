import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ProductCategory } from "@/types";

type CategoryOption = {
  id: ProductCategory;
  label: string;
  emoji: string;
};

const CATEGORIES: CategoryOption[] = [
  { id: "food", label: "Food", emoji: "🍽️" },
  { id: "beverages", label: "Beverages", emoji: "🥤" },
  { id: "snacks", label: "Snacks", emoji: "🍿" },
  { id: "dairy", label: "Dairy", emoji: "🥛" },
  { id: "bakery", label: "Bakery", emoji: "🥐" },
  { id: "frozen", label: "Frozen", emoji: "🧊" },
  { id: "household", label: "Household", emoji: "🏠" },
  { id: "personal_care", label: "Personal Care", emoji: "🧴" },
  { id: "other", label: "Other", emoji: "📦" },
];

type CategorySelectorProps = {
  selectedCategories: ProductCategory[];
  onSelectionChange: (categories: ProductCategory[]) => void;
  minSelection?: number;
};

function CategoryChip({
  category,
  isSelected,
  onPress,
}: {
  category: CategoryOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? "light";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
    backgroundColor: isSelected
      ? Colors[colorScheme].tint
      : Colors[colorScheme].background,
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.chip,
          animatedStyle,
          !isSelected && styles.chipUnselected,
        ]}
      >
        <ThemedText style={styles.chipEmoji}>{category.emoji}</ThemedText>
        <ThemedText
          style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
        >
          {category.label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

export function CategorySelector({
  selectedCategories,
  onSelectionChange,
  minSelection = 1,
}: CategorySelectorProps) {
  const colorScheme = useColorScheme() ?? "light";

  const toggleCategory = (categoryId: ProductCategory) => {
    if (selectedCategories.includes(categoryId)) {
      if (selectedCategories.length > minSelection) {
        onSelectionChange(selectedCategories.filter((c) => c !== categoryId));
      }
    } else {
      onSelectionChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>What interests you?</ThemedText>
      <ThemedText style={styles.subtitle}>
        Select at least {minSelection} categor{minSelection === 1 ? "y" : "ies"}{" "}
        to personalize your feed
      </ThemedText>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            isSelected={selectedCategories.includes(category.id)}
            onPress={() => toggleCategory(category.id)}
          />
        ))}
      </View>

      <ThemedText style={styles.selectedCount}>
        {selectedCategories.length} selected
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  chipUnselected: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  chipEmoji: {
    fontSize: 20,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  chipLabelSelected: {
    color: "#fff",
  },
  selectedCount: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    opacity: 0.6,
  },
});
