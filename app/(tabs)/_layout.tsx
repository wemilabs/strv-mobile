// import { Tabs } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
} from "expo-router/unstable-native-tabs";

// import { HapticTab } from "@/components/haptic-tab";
// import { IconSymbol } from "@/components/ui/icon-symbol";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  // const colorScheme = useColorScheme();

  return (
    <NativeTabs
      // screenOptions={{
      //   tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      //   headerShown: false,
      //   tabBarButton: HapticTab,
      // }}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" drawable="ic_menu_mylocation" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore" role="search">
        <Icon sf="magnifyingglass" drawable="ic_menu_search" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <Icon sf="bag.fill" drawable="ic_menu_gallery" />
        <Badge>99+</Badge>
        <Label>Orders</Label>
      </NativeTabs.Trigger>
      {/* <NativeTabs.Trigger name="orders">
        <Icon sf="bag.fill" drawable="ic_menu_gallery" />
        <Badge>99+</Badge>
        <Label>Orders</Label>
      </NativeTabs.Trigger> */}
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="ic_menu_gallery" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
      {/* <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      /> */}
    </NativeTabs>
  );
}
