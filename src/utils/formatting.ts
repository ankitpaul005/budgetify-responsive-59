
// Currency conversion rates against USD
export const currencyRates: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 156.9,
  CAD: 1.35,
  AUD: 1.48,
  SGD: 1.34,
  AED: 3.67,
  CNY: 7.22,
  BTC: 0.000015, // Approximate - this would need regular updates
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
  
  // Convert from USD to target currency if different
  if (currency !== "USD" && currencyRates[currency]) {
    convertedAmount = amount * currencyRates[currency];
  }
  
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

// Convert amount between currencies
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first if not already
  const amountInUSD = fromCurrency === "USD" 
    ? amount 
    : amount / currencyRates[fromCurrency];
    
  // Convert from USD to target currency
  return amountInUSD * currencyRates[toCurrency];
};
