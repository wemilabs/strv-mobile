import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProductStock(productIds: string[], organizationId?: string) {
  return useQuery({
    queryKey: ["product-stock", productIds, organizationId],
    queryFn: () => api.products.byIds(productIds, organizationId ?? ""),
    enabled: productIds.length > 0 && !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}
