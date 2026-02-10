import {
  Badge,
  Icon,
  Label,
  NativeTabs,
} from "expo-router/unstable-native-tabs";

import { useCartStore } from "@/lib/cart-store";

const formatBadge = (count: number) => (count > 9 ? "9+" : String(count));

export default function TabLayout() {
  const itemCount = useCartStore((s) =>
    s.items.reduce((count, item) => count + item.quantity, 0),
  );

  const badge = formatBadge(itemCount);

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
        {Number(badge) < 1 ? null : <Badge>{badge}</Badge>}
        <Label>Cart</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="ic_menu_user" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
