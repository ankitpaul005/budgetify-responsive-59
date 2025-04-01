
// Currency conversion rates against USD
export const currencyRates: Record<string, number> = {
  USD: 1,
  INR: 1,
  EUR: 1,
  GBP: 1,
  JPY: 1,
  CAD: 1,
  AUD: 1,
  SGD: 1,
  AED: 1,
  CNY: 1,
  BTC: 1, // Approximate - this would need regular updates
};

// Currency symbols
export const currencySymbols: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
  AED: "د.إ",
  CNY: "¥",
  BTC: "₿",
};

// Format currency with conversion support
export const formatCurrency = (amount: number, currency = "INR") => {
  let convertedAmount = amount;
  
  // No conversion - use the original amount directly
  
  // Format based on currency
  let formatter: Intl.NumberFormat;
  
  switch (currency) {
    case "INR":
      formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      break;
    case "JPY":
      formatter = new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      break;
    case "BTC":
      // For BTC, just use the symbol and a fixed format
      return `₿${convertedAmount.toFixed(8)}`;
    default:
      formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
  }
  
  return formatter.format(convertedAmount);
};

// Format percentage
export const formatPercent = (percent: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percent / 100);
};

// Convert amount between currencies - no longer does any conversion
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // Simply return the original amount without any conversion
  return amount;
};
