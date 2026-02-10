import type { StateStorage } from "zustand/middleware";

let mmkv: ReturnType<typeof import("react-native-mmkv").createMMKV> | null =
  null;

try {
  const { createMMKV } = require("react-native-mmkv");
  mmkv = createMMKV();
} catch {
  // NitroModules not available (Expo Go) — falls back to in-memory storage
}

const memoryStore = new Map<string, string>();

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    if (mmkv) {
      mmkv.set(name, value);
    } else {
      memoryStore.set(name, value);
    }
  },
  getItem: (name) => {
    if (mmkv) {
      return mmkv.getString(name) ?? null;
    }
    return memoryStore.get(name) ?? null;
  },
  removeItem: (name) => {
    if (mmkv) {
      mmkv.remove(name);
    } else {
      memoryStore.delete(name);
    }
  },
};
