
// Currency conversion rates against USD (as of August 2024)
export const currencyRates: Record<string, number> = {
  USD: 1,
  INR: 83.71,     // 1 USD = 83.71 INR
  EUR: 0.91,      // 1 USD = 0.91 EUR
  GBP: 0.77,      // 1 USD = 0.77 GBP
  JPY: 147.26,    // 1 USD = 147.26 JPY
  CAD: 1.35,      // 1 USD = 1.35 CAD
  AUD: 1.49,      // 1 USD = 1.49 AUD
  SGD: 1.33,      // 1 USD = 1.33 SGD
  AED: 3.67,      // 1 USD = 3.67 AED
  CNY: 7.08,      // 1 USD = 7.08 CNY
  BTC: 0.000016,  // 1 USD = 0.000016 BTC (approximate)
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
  // No need to convert if using the default currency or no currency specified
  if (!currency) {
    currency = "INR";
  }

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
      return `₿${amount.toFixed(8)}`;
    default:
      formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
  }
  
  return formatter.format(amount);
};

// Format percentage
export const formatPercent = (percent: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percent / 100);
};

// Convert amount between currencies - now with proper conversion rates
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert from the source currency to USD first (if not already USD)
  const valueInUSD = fromCurrency === "USD" ? amount : amount / currencyRates[fromCurrency];
  
  // Then convert from USD to the target currency
  return valueInUSD * currencyRates[toCurrency];
};

// Live exchange rate fetcher (for Investment page)
export const fetchLiveExchangeRates = async (): Promise<Record<string, number> | null> => {
  try {
    // In a real application, this would call an API
    // For now, we'll return our static rates with a slight random variation
    // to simulate "live" rates
    const liveRates: Record<string, number> = { ...currencyRates };
    
    Object.keys(liveRates).forEach(currency => {
      if (currency !== 'USD') {
        // Add small random variation (-0.5% to +0.5%)
        const variation = (Math.random() - 0.5) * 0.01; 
        liveRates[currency] = currencyRates[currency] * (1 + variation);
      }
    });
    
    return liveRates;
  } catch (error) {
    console.error("Error fetching live exchange rates:", error);
    return null;
  }
};
