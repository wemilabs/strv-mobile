import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { Merchant, Product, ProductCategory } from "@/types";

import {
  coerceCategory,
  coerceSearchTab,
  coerceSortBy,
  DEFAULT_SEARCH_STATE,
  type SearchTab,
  serializeSearchParams,
  type SortBy,
} from "@/lib/search-params";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export type SearchResponse = {
  merchants: Merchant[];
  products: Product[];
  totalMerchants?: number;
  totalProducts?: number;
};

export function useSearch() {
  const params = useLocalSearchParams();

  const initialQ =
    typeof params.q === "string" ? params.q : DEFAULT_SEARCH_STATE.q;
  const initialTab = coerceSearchTab(
    typeof params.tab === "string" ? params.tab : undefined,
  );
  const initialCategory = coerceCategory(
    typeof params.category === "string" ? params.category : undefined,
  );
  const initialSortBy = coerceSortBy(
    typeof params.sortBy === "string" ? params.sortBy : undefined,
  );
  const initialOrganizationId =
    typeof params.organizationId === "string"
      ? params.organizationId
      : undefined;

  const [qInput, setQInput] = useState(initialQ);
  const [tab, setTab] = useState<SearchTab>(initialTab);
  const [category, setCategory] = useState<ProductCategory | undefined>(
    initialCategory,
  );
  const [sortBy, setSortBy] = useState<SortBy | undefined>(initialSortBy);
  const [organizationId, setOrganizationId] = useState<string | undefined>(
    initialOrganizationId,
  );

  useEffect(() => {
    setQInput(initialQ);
    setTab(initialTab);
    setCategory(initialCategory);
    setSortBy(initialSortBy);
    setOrganizationId(initialOrganizationId);
  }, [
    initialQ,
    initialTab,
    initialCategory,
    initialSortBy,
    initialOrganizationId,
  ]);

  const q = useDebouncedValue(qInput, 250);

  useEffect(() => {
    const nextParams = serializeSearchParams({
      q,
      tab,
      category,
      organizationId,
      sortBy,
    });

    router.setParams(nextParams as any);
  }, [q, tab, category, organizationId, sortBy]);

  const queryKey = ["search", { q, category, organizationId, sortBy }] as const;

  const query = useQuery({
    queryKey,
    queryFn: () =>
      api.search({
        q: q || undefined,
        tab: "all",
        category,
        organizationId,
        sortBy,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const data = query.data as SearchResponse | undefined;
  const merchants = data?.merchants ?? [];
  const products = data?.products ?? [];

  return {
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
    totalMerchants: data?.totalMerchants,
    totalProducts: data?.totalProducts,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
