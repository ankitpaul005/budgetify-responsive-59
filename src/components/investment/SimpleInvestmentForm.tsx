
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { processStockInvestment } from "@/utils/dashboardUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SimpleInvestmentForm: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState("all");

  // Stock options with current price in INR - expanded with more options in different price ranges
  const stockOptions = [
    // Under 10,000 INR
    { symbol: "AAPL", name: "Apple Inc.", price: 9500.75, category: "under10k" },
    { symbol: "PNB.NS", name: "Punjab National Bank", price: 120.45, category: "under10k" },
    { symbol: "YESBANK.NS", name: "Yes Bank", price: 240.80, category: "under10k" },
    { symbol: "ZOMATO.NS", name: "Zomato Ltd.", price: 184.35, category: "under10k" },
    { symbol: "SUZLON.NS", name: "Suzlon Energy", price: 45.25, category: "under10k" },
    { symbol: "IRCTC.NS", name: "Indian Railway Catering", price: 890.60, category: "under10k" },
    { symbol: "RECLTD.NS", name: "REC Limited", price: 450.20, category: "under10k" },
    { symbol: "ITC.NS", name: "ITC Limited", price: 485.75, category: "under10k" },
    
    // 10,000 - 20,000 INR
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 11750.40, category: "under20k" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 14500.60, category: "under20k" },
    { symbol: "TSLA", name: "Tesla Inc.", price: 14250.80, category: "under20k" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank", price: 16780.25, category: "under20k" },
    { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", price: 17400.30, category: "under20k" },
    { symbol: "TATASTEEL.NS", name: "Tata Steel", price: 15300.80, category: "under20k" },
    { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 19500.25, category: "under20k" },
    { symbol: "INFY.NS", name: "Infosys", price: 18200.45, category: "under20k" },
    
    // 20,000 - 50,000 INR
    { symbol: "MSFT", name: "Microsoft Corp.", price: 33000.25, category: "under50k" },
    { symbol: "META", name: "Meta Platforms Inc.", price: 38500.75, category: "under50k" },
    { symbol: "NFLX", name: "Netflix Inc.", price: 42100.20, category: "under50k" },
    { symbol: "BRK-B", name: "Berkshire Hathaway", price: 39600.45, category: "under50k" },
    { symbol: "V", name: "Visa Inc.", price: 29900.35, category: "under50k" },
    { symbol: "ASIANPAINT.NS", name: "Asian Paints", price: 28750.80, category: "under50k" },
    { symbol: "TCS.NS", name: "Tata Consultancy", price: 37240.45, category: "under50k" },
    { symbol: "UBL.NS", name: "United Breweries", price: 25800.60, category: "under50k" },
    
    // Above 50,000 INR
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 74850.45, category: "above50k" },
    { symbol: "ADANIPORTS.NS", name: "Adani Ports", price: 51200.35, category: "above50k" },
    { symbol: "MRF.NS", name: "MRF Ltd.", price: 124000.60, category: "above50k" },
    { symbol: "PAGEIND.NS", name: "Page Industries", price: 85600.75, category: "above50k" }
  ];

  // Filter stocks based on selected price range
  const filteredStocks = priceRange === "all" 
    ? stockOptions 
    : stockOptions.filter(stock => stock.category === priceRange);

  const selectedStock = stockOptions.find(stock => stock.symbol === symbol);
  const totalAmount = selectedStock ? Number(quantity) * selectedStock.price : 0;

  // Invest in stock function
  const handleInvest = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to invest");
      return;
    }

    if (!selectedStock) {
      toast.error("Please select a valid stock");
      return;
    }

    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsLoading(true);

    try {
      // Process the stock investment
      const result = await processStockInvestment(
        user.id,
        selectedStock.symbol,
        quantityNum,
        selectedStock.price
      );

      // Add the transaction to the database
      const { error } = await supabase
        .from('transactions')
        .insert([result.transaction]);

      if (error) throw error;

      toast.success(`Successfully invested in ${quantityNum} shares of ${selectedStock.symbol}`);
      
      // Clear the form
      setQuantity("1");
    } catch (error) {
      console.error("Investment error:", error);
      toast.error("Failed to process investment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Invest in Stock</CardTitle>
        <CardDescription>
          Invest in top-performing stocks directly from your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setPriceRange} className="mb-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All Stocks</TabsTrigger>
            <TabsTrigger value="under10k">Under ₹10K</TabsTrigger>
            <TabsTrigger value="under20k">Under ₹20K</TabsTrigger>
            <TabsTrigger value="under50k">Under ₹50K</TabsTrigger>
            <TabsTrigger value="above50k">Above ₹50K</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Select Stock</Label>
            <Select
              value={symbol}
              onValueChange={setSymbol}
            >
              <SelectTrigger id="stock">
                <SelectValue placeholder="Select Stock" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredStocks.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name} - {formatCurrency(stock.price, "INR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStock && (
            <div className="p-3 bg-muted/40 rounded-md">
              <p className="text-sm">Current Price: <strong>{formatCurrency(selectedStock.price, "INR")}</strong></p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {totalAmount > 0 && (
            <div className="p-3 bg-muted/40 rounded-md">
              <p className="text-sm">Total Investment: <strong>{formatCurrency(totalAmount, "INR")}</strong></p>
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleInvest}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Invest Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleInvestmentForm;
