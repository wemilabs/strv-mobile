import {
  Badge,
  Icon,
  Label,
  NativeTabs,
} from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
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
      <NativeTabs.Trigger name="cart">
        <Icon sf="bag.fill" drawable="ic_menu_cart" />
        <Badge>99+</Badge>
        <Label>Cart</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="ic_menu_user" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
