import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./mmkv-storage";

export type CartItem = {
  productId: string;
  productName: string;
  productSlug: string;
  productImages: string[] | null;
  organizationId: string;
  price: number;
  category: string;
  quantity: number;
  currentStock?: number;
  inventoryEnabled?: boolean;
  notes?: string;
};

type CartState = {
  items: CartItem[];
  deliveryLocation: string;
  orderNotes: string;
};

type CartActions = {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  setDeliveryLocation: (deliveryLocation: string) => void;
  setOrderNotes: (orderNotes: string) => void;
  clearCart: () => void;
  resetCheckoutFields: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  refreshStock: (
    stocks: Array<{
      id: string;
      currentStock: number;
      inventoryEnabled: boolean;
    }>,
  ) => void;
};

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryLocation: "",
      orderNotes: "",

      addItem: (item) => {
        const existingItem = get().items.find(
          (i) => i.productId === item.productId,
        );

        const existingOrganizationId = get().items[0]?.organizationId;
        if (
          existingOrganizationId &&
          item.organizationId !== existingOrganizationId
        ) {
          throw new Error(
            "You can only add items from one store at a time. Please clear your cart to shop from another store.",
          );
        }

        if (item.inventoryEnabled && item.currentStock !== undefined) {
          const currentCartQty = existingItem?.quantity ?? 0;
          const requestedQty = (item.quantity ?? 1) + currentCartQty;

          if (requestedQty > item.currentStock) {
            throw new Error(
              `Only ${item.currentStock} units available in stock`,
            );
          }
        }

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? {
                    ...i,
                    quantity: i.quantity + (item.quantity ?? 1),
                    currentStock: item.currentStock ?? i.currentStock,
                    inventoryEnabled:
                      item.inventoryEnabled ?? i.inventoryEnabled,
                  }
                : i,
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: item.quantity ?? 1 }],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const item = get().items.find((i) => i.productId === productId);
        if (item?.inventoryEnabled && item.currentStock !== undefined) {
          if (quantity > item.currentStock) {
            throw new Error(
              `Only ${item.currentStock} units available in stock`,
            );
          }
        }

        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        });
      },

      updateNotes: (productId, notes) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, notes } : i,
          ),
        });
      },

      setDeliveryLocation: (deliveryLocation) => {
        set({ deliveryLocation });
      },

      setOrderNotes: (orderNotes) => {
        set({ orderNotes });
      },

      clearCart: () => {
        set({ items: [] });
      },

      resetCheckoutFields: () => {
        set({ deliveryLocation: "", orderNotes: "" });
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      refreshStock: (stocks) => {
        set({
          items: get().items.map((item) => {
            const stockInfo = stocks.find((s) => s.id === item.productId);
            if (stockInfo) {
              const newQuantity = stockInfo.inventoryEnabled
                ? Math.min(item.quantity, stockInfo.currentStock)
                : item.quantity;

              return {
                ...item,
                currentStock: stockInfo.currentStock,
                inventoryEnabled: stockInfo.inventoryEnabled,
                quantity: newQuantity,
              };
            }
            return item;
          }),
        });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        items: state.items,
        deliveryLocation: state.deliveryLocation,
        orderNotes: state.orderNotes,
      }),
    },
  ),
);
