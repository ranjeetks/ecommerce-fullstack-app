// services/formatService.ts

export const formatCurrency = (
  value: number | string | null | undefined,
  currency: string = "USD", // or "INR"
  locale: string = "en-US"  // or "en-IN"
): string => {
  if (value === null || value === undefined || value === "") return "-";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
};
