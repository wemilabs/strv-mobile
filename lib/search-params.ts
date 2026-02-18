import type { ProductCategory } from "@/types";

export type SearchTab = "all" | "stores" | "products";
export type SortBy = "newest" | "oldest" | "price_low" | "price_high" | "popular";

export type SearchState = {
  q: string;
  tab: SearchTab;
  category?: ProductCategory;
  organizationId?: string;
  sortBy?: SortBy;
};

export const DEFAULT_SEARCH_STATE: SearchState = {
  q: "",
  tab: "all",
};

export function coerceSearchTab(value: string | undefined): SearchTab {
  if (value === "stores" || value === "products" || value === "all") {
    return value;
  }
  return "all";
}

export function coerceSortBy(value: string | undefined): SortBy | undefined {
  switch (value) {
    case "newest":
    case "oldest":
    case "price_low":
    case "price_high":
    case "popular":
      return value;
    default:
      return undefined;
  }
}

export function coerceCategory(value: string | undefined): ProductCategory | undefined {
  switch (value) {
    case "food":
    case "beverages":
    case "snacks":
    case "dairy":
    case "bakery":
    case "frozen":
    case "household":
    case "personal_care":
    case "other":
      return value;
    default:
      return undefined;
  }
}

export function serializeSearchParams(state: SearchState) {
  const params: Record<string, string | undefined> = {
    q: state.q || undefined,
    tab: state.tab !== "all" ? state.tab : undefined,
    category: state.category,
    organizationId: state.organizationId,
    sortBy: state.sortBy,
  };

  return params;
}
