
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

const SimpleInvestmentForm: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  // Stock options with current price in INR
  const stockOptions = [
    { symbol: "AAPL", name: "Apple Inc.", price: 13000.35 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 33000.25 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 11750.40 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 14500.60 },
    { symbol: "META", name: "Meta Platforms Inc.", price: 38500.75 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 14250.80 },
    { symbol: "NFLX", name: "Netflix Inc.", price: 50234.20 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 74850.45 },
    { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 2910.25 },
    { symbol: "TCS.NS", name: "Tata Consultancy", price: 3724.45 }
  ];

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
              <SelectContent>
                {stockOptions.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name}
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
