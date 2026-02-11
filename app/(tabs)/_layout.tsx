import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs
      disableTransparentOnScrollEdge
      tintColor="orange"
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
      <NativeTabs.Trigger name="discovery">
        <Icon sf="storefront.fill" drawable="ic_menu_store" />
        <Label>Discovery</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="my-orders">
        <Icon sf="bag.fill" drawable="ic" />
        <Label>My Orders</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
