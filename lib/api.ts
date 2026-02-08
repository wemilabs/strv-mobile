import type {
  FeaturedResponse,
  MerchantDetail,
  MerchantsResponse,
  Product,
  ProductLikeResponse,
  ProductsResponse,
} from "@/types";

import { authClient } from "./auth-client";

const API_BASE = "https://starva.shop/api/mobile";

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";

  body?: Record<string, unknown>;

  params?: Record<string, string | number | undefined>;
};

async function fetchAPI<T>(
  endpoint: string,

  options: FetchOptions = {},
): Promise<T> {
  const { method = "GET", body, params } = options;

  const url = new URL(`${API_BASE}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const cookies = authClient.getCookie();

  if (cookies) {
    headers["Cookie"] = cookies;
  }

  const response = await fetch(url.toString(), {
    method,

    headers,

    credentials: "omit",

    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  return response.json();
}

export const api = {
  products: {
    // list: (params?: {
    //   search?: string;

    //   tags?: string;

    //   status?: string;

    //   sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "popular";
    // }) => fetchAPI<ProductsResponse>("/products", { params }),

    featured: () => fetchAPI<FeaturedResponse>("/products/featured"),

    bySlug: (slug: string) => fetchAPI<Product>(`/products/${slug}`),

    byCategory: (categorySlug: string) =>
      fetchAPI<ProductsResponse>(`/products/category/${categorySlug}`),

    byStore: (organizationId: string) =>
      fetchAPI<ProductsResponse>(`/products/store/${organizationId}`),

    forYou: () => fetchAPI<ProductsResponse>("/products/for-you"),

    following: () => fetchAPI<ProductsResponse>("/products/following"),

    like: (slug: string) =>
      fetchAPI<ProductLikeResponse>(`/products/${slug}/like`, {
        method: "POST",
      }),

    unlike: (slug: string) =>
      fetchAPI<ProductLikeResponse>(`/products/${slug}/like`, {
        method: "DELETE",
      }),
  },

  user: {
    preferences: () =>
      fetchAPI<{
        preferences: { categories: string[]; followingIds: string[] };
      }>("/user/preferences"),

    updatePreferences: (data: {
      categories?: string[];

      followingIds?: string[];
    }) => fetchAPI("/user/preferences", { method: "PUT", body: data }),
  },

  merchants: {
    list: (params?: { search?: string }) =>
      fetchAPI<MerchantsResponse>("/merchants", { params }),

    bySlug: (slug: string) => fetchAPI<MerchantDetail>(`/merchants/${slug}`),

    follow: (slug: string) =>
      fetchAPI(`/merchants/${slug}/follow`, {
        method: "POST",
        body: { revalidateTargetPath: "/" },
      }),

    unfollow: (slug: string) =>
      fetchAPI(`/merchants/${slug}/follow`, {
        method: "DELETE",
        body: { revalidateTargetPath: "/" },
      }),
  },
};
