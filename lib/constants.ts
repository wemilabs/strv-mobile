import { ProductCategory } from "@/types";
import { SortBy } from "./search-params";

export const SORT_OPTIONS: Array<{ id: SortBy; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Popular" },
  { id: "price_low", label: "Price: Low" },
  { id: "price_high", label: "Price: High" },
  { id: "oldest", label: "Oldest" },
];

export const CATEGORIES: Array<{ id: ProductCategory; label: string }> = [
  { id: "food", label: "Food" },
  { id: "beverages", label: "Beverages" },
  { id: "snacks", label: "Snacks" },
  { id: "dairy", label: "Dairy" },
  { id: "bakery", label: "Bakery" },
  { id: "frozen", label: "Frozen" },
  { id: "household", label: "Household" },
  { id: "personal_care", label: "Personal Care" },
  { id: "other", label: "Other" },
];
