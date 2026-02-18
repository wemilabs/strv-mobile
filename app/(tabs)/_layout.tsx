import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs
      disableTransparentOnScrollEdge
      tintColor="orange"
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" drawable="ic_menu_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <Icon sf="magnifyingglass" drawable="ic_menu_search" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discovery">
        <Icon sf="storefront.fill" drawable="ic_menu_mapmode" />
        <Label>Discovery</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="my-orders">
        <Icon sf="bag.fill" drawable="ic_menu_agenda" />
        <Label>My Orders</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
