export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
  }).format(price);
};

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
