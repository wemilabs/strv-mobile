import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ProductCard } from "@/components/product/product-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSearch } from "@/hooks/use-search";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import type { SearchTab, SortBy } from "@/lib/search-params";
import { labelForCategory, labelForSort, seededShuffle } from "@/lib/utils";
import type { Merchant, PickerMode, Product, ProductCategory } from "@/types";

export function SearchView() {
  const colorScheme = useColorScheme() ?? "light";

  const {
    qInput,
    setQInput,
    tab,
    setTab,
    category,
    setCategory,
    sortBy,
    setSortBy,
    organizationId,
    setOrganizationId,
    merchants,
    products,
    isLoading,
    error,
    refetch,
  } = useSearch();

  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);

  const bg = useThemeColor({}, "background");
  const tint = Colors[colorScheme].tint;

  const visibleMerchants = tab === "products" ? [] : merchants;
  const visibleProducts = tab === "stores" ? [] : products;

  const allTabMerchantsSeed =
    qInput.trim().toLowerCase() +
    "|" +
    merchants
      .map((m) => m.id)
      .slice()
      .sort()
      .join(",");
  const allTabMerchants = seededShuffle(merchants, allTabMerchantsSeed).slice(
    0,
    3,
  );

  const clearMerchant = () => setOrganizationId(undefined);
  const clearCategory = () => setCategory(undefined);
  const clearSort = () => setSortBy(undefined);

  const listHeader = (
    <View style={styles.header}>
      <View style={[styles.searchBox, { backgroundColor: bg }]}>
        <TextInput
          value={qInput}
          onChangeText={setQInput}
          placeholder="Search stores and products"
          placeholderTextColor={Colors[colorScheme].icon}
          style={[styles.searchInput, { color: Colors[colorScheme].text }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.tabs}>
        <TabButton id="all" active={tab} onPress={setTab} />
        <TabButton id="stores" active={tab} onPress={setTab} />
        <TabButton id="products" active={tab} onPress={setTab} />
      </View>

      <View style={styles.filters}>
        <FilterButton
          label={
            category ? `Category: ${labelForCategory(category)}` : "Category"
          }
          isActive={Boolean(category)}
          onPress={() => setPickerMode("category")}
          onClear={category ? clearCategory : undefined}
        />
        <FilterButton
          label={sortBy ? `Sort: ${labelForSort(sortBy)}` : "Sort"}
          isActive={Boolean(sortBy)}
          onPress={() => setPickerMode("sort")}
          onClear={sortBy ? clearSort : undefined}
        />
        <FilterButton
          label={organizationId ? "Merchant: Selected" : "Merchant"}
          isActive={Boolean(organizationId)}
          onPress={() => setPickerMode("merchant")}
          onClear={organizationId ? clearMerchant : undefined}
        />
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>
            Failed to load search.
          </ThemedText>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retry, { borderColor: tint }]}
          >
            <ThemedText style={{ color: tint }}>Retry</ThemedText>
          </Pressable>
        </View>
      ) : tab === "all" ? (
        <FlatList
          data={["stores", "products"] as const}
          keyExtractor={(item) => item}
          renderItem={({ item }) =>
            item === "stores" ? (
              <Section
                title="Stores"
                isEmpty={allTabMerchants.length === 0}
                emptyLabel="No stores found"
              >
                {allTabMerchants.map((m) => (
                  <MerchantRow key={m.id} merchant={m} />
                ))}
                {merchants.length > 0 ? (
                  <Pressable
                    onPress={() => router.push("/discovery")}
                    style={{ marginTop: 8, alignSelf: "flex-start" }}
                  >
                    <ThemedText style={{ color: tint }}>Show more</ThemedText>
                  </Pressable>
                ) : null}
              </Section>
            ) : (
              <Section
                title="Products"
                isEmpty={visibleProducts.length === 0}
                emptyLabel="No products found"
              >
                {visibleProducts.map((p) => (
                  <View key={p.id} style={{ marginBottom: 8 }}>
                    <ProductCard product={p} />
                  </View>
                ))}
              </Section>
            )
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <ThemedText style={styles.emptyText}>No results</ThemedText>
            </View>
          }
          ListHeaderComponent={listHeader}
          ListFooterComponent={undefined}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={tab === "stores" ? visibleMerchants : visibleProducts}
          keyExtractor={(item: Merchant | Product) => item.id}
          renderItem={({ item }) =>
            tab === "stores" ? (
              <MerchantRow merchant={item as Merchant} />
            ) : (
              <ProductCard product={item as Product} />
            )
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <ThemedText style={styles.emptyText}>No results</ThemedText>
            </View>
          }
          ListHeaderComponent={listHeader}
          ListFooterComponent={undefined}
          showsVerticalScrollIndicator={false}
        />
      )}

      {pickerMode && (
        <PickerOverlay
          mode={pickerMode}
          merchants={merchants}
          selectedCategory={category}
          selectedSort={sortBy}
          selectedOrganizationId={organizationId}
          onClose={() => setPickerMode(null)}
          onSelectCategory={(c) => {
            setCategory(c);
            setPickerMode(null);
          }}
          onSelectSort={(s) => {
            setSortBy(s);
            setPickerMode(null);
          }}
          onSelectMerchant={(id) => {
            setOrganizationId(id);
            setPickerMode(null);
          }}
        />
      )}
    </ThemedView>
  );
}

function Section({
  title,
  children,
  isEmpty,
  emptyLabel,
}: {
  title: string;
  children: React.ReactNode;
  isEmpty: boolean;
  emptyLabel: string;
}) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
        {title}
      </ThemedText>
      {isEmpty ? (
        <ThemedText style={{ opacity: 0.6 }}>{emptyLabel}</ThemedText>
      ) : (
        <View>{children}</View>
      )}
    </View>
  );
}

function TabButton({
  id,
  active,
  onPress,
}: {
  id: SearchTab;
  active: SearchTab;
  onPress: (tab: SearchTab) => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;
  const isActive = active === id;

  return (
    <Pressable
      onPress={() => onPress(id)}
      style={[
        styles.tab,
        {
          borderColor: tint,
          backgroundColor: isActive ? tint : "transparent",
        },
      ]}
    >
      <ThemedText style={{ color: isActive ? "white" : tint }}>
        {id === "all" ? "All" : id === "stores" ? "Stores" : "Products"}
      </ThemedText>
    </Pressable>
  );
}

function FilterButton({
  label,
  isActive,
  onPress,
  onClear,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  onClear?: () => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;

  return (
    <View style={styles.filterButtonWrap}>
      <Pressable
        onPress={onPress}
        style={[
          styles.filterButton,
          {
            borderColor: tint,
            backgroundColor: isActive ? tint : "transparent",
          },
        ]}
      >
        <ThemedText
          style={{ color: isActive ? "white" : tint }}
          numberOfLines={1}
        >
          {label}
        </ThemedText>
      </Pressable>

      {onClear ? (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <ThemedText style={{ color: tint }}>×</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

function MerchantRow({ merchant }: { merchant: Merchant }) {
  const bg = useThemeColor({ light: "#f8f9fa", dark: "#1e2022" }, "background");

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/store/[slug]",
          params: { slug: merchant.slug },
        })
      }
      style={[styles.merchantRow, { backgroundColor: bg }]}
    >
      <Image
        source={
          merchant.logo
            ? { uri: merchant.logo }
            : require("@/assets/images/react-logo.png")
        }
        style={styles.merchantLogo}
        contentFit="cover"
      />
      <View style={styles.merchantInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {merchant.name}
        </ThemedText>
        {merchant.category ? (
          <ThemedText style={styles.merchantSub} numberOfLines={1}>
            {merchant.category}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

function PickerOverlay({
  mode,
  merchants,
  selectedCategory,
  selectedSort,
  selectedOrganizationId,
  onClose,
  onSelectCategory,
  onSelectSort,
  onSelectMerchant,
}: {
  mode: PickerMode;
  merchants: Merchant[];
  selectedCategory?: ProductCategory;
  selectedSort?: SortBy;
  selectedOrganizationId?: string;
  onClose: () => void;
  onSelectCategory: (c: ProductCategory | undefined) => void;
  onSelectSort: (s: SortBy | undefined) => void;
  onSelectMerchant: (id: string | undefined) => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;
  const bg = useThemeColor({}, "background");

  const title =
    mode === "category" ? "Category" : mode === "sort" ? "Sort" : "Merchant";

  const data =
    mode === "category"
      ? ([{ id: "__none__", label: "Any" }, ...CATEGORIES] as any[])
      : mode === "sort"
        ? ([{ id: "__none__", label: "Default" }, ...SORT_OPTIONS] as any[])
        : ([
            { id: "__none__", label: "Any" },
            ...merchants.map((m) => ({ id: m.id, label: m.name })),
          ] as any[]);

  const selectedId =
    mode === "category"
      ? selectedCategory
      : mode === "sort"
        ? selectedSort
        : selectedOrganizationId;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlayRoot}>
        <Pressable style={styles.overlayBackdrop} onPress={onClose} />
        <View style={[styles.overlayPanel, { backgroundColor: bg }]}>
          <View style={styles.overlayHeader}>
            <ThemedText type="defaultSemiBold">{title}</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText style={{ color: tint }}>Close</ThemedText>
            </Pressable>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const isSelected =
                item.id === "__none__"
                  ? selectedId == null
                  : String(item.id) === String(selectedId);

              return (
                <Pressable
                  onPress={() => {
                    if (mode === "category") {
                      onSelectCategory(
                        item.id === "__none__" ? undefined : item.id,
                      );
                    } else if (mode === "sort") {
                      onSelectSort(
                        item.id === "__none__" ? undefined : item.id,
                      );
                    } else {
                      onSelectMerchant(
                        item.id === "__none__" ? undefined : item.id,
                      );
                    }
                  }}
                  style={[
                    styles.overlayItem,
                    {
                      borderColor: tint,
                      backgroundColor: isSelected ? tint : "transparent",
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: isSelected ? "white" : Colors[colorScheme].text,
                    }}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={styles.overlayListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 108,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchBox: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchInput: { fontSize: 16 },
  tabs: { flexDirection: "row", gap: 10, marginTop: 8 },
  tab: {
    flex: 1,
    borderWidth: 1.5,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  filters: { flexDirection: "row", gap: 10 },
  filterButtonWrap: { flex: 1, position: "relative" },
  filterButton: {
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 6,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: { paddingBottom: 120, paddingTop: 12 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: { opacity: 0.6 },
  errorText: { opacity: 0.7, marginBottom: 12 },
  retry: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  merchantRow: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  merchantLogo: { width: 48, height: 48, borderRadius: 24 },
  merchantInfo: { flex: 1 },
  merchantSub: { opacity: 0.6, marginTop: 2 },
  overlayRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  overlayPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "60%",
  },
  overlayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  overlayListContent: { paddingBottom: 12 },
  overlayItem: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
