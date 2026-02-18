import type { StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

let mmkv: ReturnType<typeof import("react-native-mmkv").createMMKV> | null =
  null;

try {
  const { createMMKV } = require("react-native-mmkv");
  mmkv = createMMKV();
} catch {
  // NitroModules not available (Expo Go) — falls back to AsyncStorage
}

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    if (mmkv) {
      mmkv.set(name, value);
    } else {
      return AsyncStorage.setItem(name, value);
    }
  },
  getItem: (name) => {
    if (mmkv) {
      return mmkv.getString(name) ?? null;
    }
    return AsyncStorage.getItem(name);
  },
  removeItem: (name) => {
    if (mmkv) {
      mmkv.remove(name);
    } else {
      return AsyncStorage.removeItem(name);
    }
  },
};
