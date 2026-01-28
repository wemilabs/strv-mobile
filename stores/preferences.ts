import type { ProductCategory, UserPreferences } from "@/types";
import * as SecureStore from "expo-secure-store";

const PREFERENCES_KEY = "user_preferences";

const defaultPreferences: UserPreferences = {
  selectedCategories: [],
  followingIds: [],
  onboardingCompleted: false,
};

export async function getPreferences(): Promise<UserPreferences> {
  const stored = await SecureStore.getItemAsync(PREFERENCES_KEY);
  if (!stored) return defaultPreferences;

  try {
    return JSON.parse(stored) as UserPreferences;
  } catch {
    return defaultPreferences;
  }
}

export async function savePreferences(
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const current = await getPreferences();
  const updated = { ...current, ...preferences };
  await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(updated));
  return updated;
}

export async function completeOnboarding(
  categories: ProductCategory[],
): Promise<UserPreferences> {
  return savePreferences({
    selectedCategories: categories,
    onboardingCompleted: true,
  });
}

export async function addFollowing(organizationId: string): Promise<void> {
  const prefs = await getPreferences();
  if (!prefs.followingIds.includes(organizationId)) {
    await savePreferences({
      followingIds: [...prefs.followingIds, organizationId],
    });
  }
}

export async function removeFollowing(organizationId: string): Promise<void> {
  const prefs = await getPreferences();
  await savePreferences({
    followingIds: prefs.followingIds.filter((id) => id !== organizationId),
  });
}

export async function clearPreferences(): Promise<void> {
  await SecureStore.deleteItemAsync(PREFERENCES_KEY);
}
