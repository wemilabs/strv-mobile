import { router, Stack } from "expo-router";
import { Platform } from "react-native";

export default function SearchLayout() {
  const screenOptions =
    Platform.OS === "ios"
      ? {
          headerSearchBarOptions: {
            placeholder: "Search",
            placement: "integratedButton" as const,
            onChangeText: (event: any) => {
              router.setParams({ q: event?.nativeEvent?.text ?? "" } as any);
            },
            onCancelButtonPress: () => {
              router.setParams({ q: "" } as any);
            },
          },
        }
      : {};

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTransparent: true,
        headerBlurEffect: "none",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "",
          ...screenOptions,
        }}
      />
    </Stack>
  );
}
