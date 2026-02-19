import { ProductCategory } from "@/types";
import { CATEGORIES, SORT_OPTIONS } from "./constants";
import { SortBy } from "./search-params";

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
  }).format(price);
};

export function formatMoney(value: string) {
  const num = Number(value);
  return Number.isFinite(num) ? formatPrice(num) : value;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export const TRANSACTION_FEES = {
  PAYPACK_CASHIN_RATE: 0.03,
  PAYPACK_CASHOUT_RATE: 0.03,
  PLATFORM_RATE: 0.014,
  get TOTAL_RATE() {
    return (
      this.PAYPACK_CASHIN_RATE + this.PAYPACK_CASHOUT_RATE + this.PLATFORM_RATE
    );
  },
} as const;

export function calculateOrderFees(baseAmount: number) {
  const paypackFee = Math.ceil(
    baseAmount *
      (TRANSACTION_FEES.PAYPACK_CASHIN_RATE +
        TRANSACTION_FEES.PAYPACK_CASHOUT_RATE),
  );
  const platformFee = Math.ceil(baseAmount * TRANSACTION_FEES.PLATFORM_RATE);
  const totalFee = paypackFee + platformFee;
  const totalAmount = baseAmount + totalFee;

  return {
    baseAmount,
    paypackFee,
    platformFee,
    totalFee,
    totalAmount,
  };
}

export function labelForCategory(category: ProductCategory) {
  return CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function labelForSort(sortBy: SortBy) {
  return SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? sortBy;
}

function hashStringToSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seedInput: string): T[] {
  const rng = mulberry32(hashStringToSeed(seedInput));
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
