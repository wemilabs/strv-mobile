import type {
  FeaturedResponse,
  MerchantDetail,
  Merchant,
  MerchantsResponse,
  OrderDetail,
  OrderListItem,
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

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      try {
        const payload = (await response.json()) as { error?: string };
        const message = payload?.error || `API error: ${response.status}`;
        throw new Error(message);
      } catch {
        throw new Error(`API error: ${response.status}`);
      }
    }

    throw new Error(`API error: ${response.status}`);
  }

  if (!isJson) {
    throw new Error("Unexpected API response");
  }

  return response.json() as Promise<T>;
}

export const api = {
  pushTokens: {
    register: (data: { expoPushToken: string; platform: "ios" | "android" }) =>
      fetchAPI<{ ok: true }>("/push-tokens", { method: "POST", body: data }),

    unregister: (data: { expoPushToken: string }) =>
      fetchAPI<{ ok: true }>("/push-tokens", { method: "DELETE", body: data }),
  },

  search: (params?: {
    q?: string;
    tab?: "all" | "stores" | "products";
    category?: string;
    organizationId?: string;
    sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "popular";
  }) =>
    fetchAPI<{
      merchants: Merchant[];
      products: Product[];
      totalMerchants?: number;
      totalProducts?: number;
    }>("/search", { params }),

  orders: {
    list: () =>
      fetchAPI<{
        orders: OrderListItem[];
        total: number;
      }>("/orders"),

    byId: (id: string) => fetchAPI<OrderDetail>(`/orders/${id}`),

    create: (data: {
      items: { productId: string; quantity: number; notes?: string }[];
      notes?: string;
      deliveryLocation?: string;
    }) =>
      fetchAPI<{
        orderId: string;
        orderNumber: number;
        totalPrice: string;
        deliveryLocation: string | null;
        stockWarnings?: string[];
      }>("/orders", {
        method: "POST",
        body: data,
      }),

    cancel: (id: string) =>
      fetchAPI<{ message: string }>(`/orders/${id}/cancel`, {
        method: "POST",
      }),

    pay: (id: string, data: { phoneNumber: string }) =>
      fetchAPI<{
        paymentId: string;
        paypackRef: string;
        amount: number;
        status: string;
        message: string;
      }>(`/orders/${id}/pay`, {
        method: "POST",
        body: data,
      }),

    paymentStatus: (id: string, paypackRef: string) =>
      fetchAPI<{ status: string }>(`/orders/${id}/payment-status`, {
        params: { ref: paypackRef },
      }),
  },

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

    byIds: (ids: string[], organizationId: string) =>
      fetchAPI<{
        ok: boolean;
        stocks: [
          {
            id: string;
            currentStock: number;
            inventoryEnabled: boolean;
          },
        ];
      }>("/products/stock", {
        params: { ids: ids.join(","), organizationId },
      }),

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
    likedProducts: () => fetchAPI<ProductsResponse>("/user/liked-products"),
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
