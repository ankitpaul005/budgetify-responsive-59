
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, subMonths } from "date-fns";
import { ArrowUpRight, CircleDollarSign, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { processSIPInvestment } from "@/utils/dashboardUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatting";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Fetch SIP data from the Supabase Edge Function
const fetchSIPData = async (categories?: string[]) => {
  try {
    // Use mock data if no actual data available
    const mockSIPData = [
      {
        id: 1,
        name: "HDFC Mid-Cap Opportunities Fund",
        category: "Mid Cap",
        nav: 154.25,
        oneYearReturn: 12.8,
        threeYearReturn: 38.2,
        fiveYearReturn: 68.5,
        risk: "Moderate",
        minInvestment: 500
      },
      {
        id: 2,
        name: "SBI Blue Chip Fund",
        category: "Large Cap",
        nav: 76.35,
        oneYearReturn: 9.6,
        threeYearReturn: 31.4,
        fiveYearReturn: 54.2,
        risk: "Low",
        minInvestment: 500
      },
      {
        id: 3,
        name: "Axis Small Cap Fund",
        category: "Small Cap",
        nav: 97.82,
        oneYearReturn: 16.7,
        threeYearReturn: 42.1,
        fiveYearReturn: 72.8,
        risk: "High",
        minInvestment: 500
      },
      {
        id: 4,
        name: "ICICI Prudential Technology Fund",
        category: "Sectoral",
        nav: 118.45,
        oneYearReturn: 14.5,
        threeYearReturn: 39.8,
        fiveYearReturn: 67.9,
        risk: "High",
        minInvestment: 1000
      },
      {
        id: 5,
        name: "Aditya Birla Sun Life Tax Relief 96",
        category: "ELSS",
        nav: 64.72,
        oneYearReturn: 10.9,
        threeYearReturn: 34.2,
        fiveYearReturn: 58.7,
        risk: "Moderate",
        minInvestment: 500
      },
      {
        id: 6,
        name: "Kotak Standard Multicap Fund",
        category: "Multi Cap",
        nav: 54.30,
        oneYearReturn: 11.4,
        threeYearReturn: 36.8,
        fiveYearReturn: 63.5,
        risk: "Moderate",
        minInvestment: 1000
      },
      {
        id: 7,
        name: "Mirae Asset Emerging Bluechip",
        category: "Large & Mid Cap",
        nav: 101.65,
        oneYearReturn: 13.2,
        threeYearReturn: 40.5,
        fiveYearReturn: 70.2,
        risk: "Moderate",
        minInvestment: 1000
      },
      {
        id: 8,
        name: "Parag Parikh Flexi Cap Fund",
        category: "Flexi Cap",
        nav: 85.90,
        oneYearReturn: 12.1,
        threeYearReturn: 37.9,
        fiveYearReturn: 65.4,
        risk: "Moderate",
        minInvestment: 1000
      },
      {
        id: 9,
        name: "UTI Nifty Index Fund",
        category: "Index",
        nav: 131.25,
        oneYearReturn: 8.5,
        threeYearReturn: 29.8,
        fiveYearReturn: 52.6,
        risk: "Low",
        minInvestment: 500
      },
      {
        id: 10,
        name: "HDFC Low Duration Fund",
        category: "Debt",
        nav: 48.75,
        oneYearReturn: 6.2,
        threeYearReturn: 18.5,
        fiveYearReturn: 32.4,
        risk: "Low",
        minInvestment: 5000
      }
    ];
    
    try {
      const { data } = await supabase.functions.invoke('fetch-sip-data', {
        body: { categories }
      });
      
      // Return real data if available, otherwise use mock data
      if (data && Array.isArray(data) && data.length > 0) {
        console.log("Returning real SIP data:", data);
        return data;
      }
    } catch (error) {
      console.log("Error fetching SIP data from supabase, using mock data:", error);
    }
    
    // Filter by category if specified
    if (categories && categories.length > 0 && categories[0] !== "All") {
      return mockSIPData.filter(fund => categories.includes(fund.category));
    }
    
    return mockSIPData;
  } catch (error) {
    console.error("Error in fetchSIPData:", error);
    return [];
  }
};

// Generate historical data for a SIP fund
const generateHistoricalData = (days = 90, startNav = 100, volatility = 0.01) => {
  const data = [];
  let currentNav = startNav;
  
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subMonths(now, 3);
    date.setDate(date.getDate() + i);
    
    // Random daily change with slight upward bias
    const change = (Math.random() - 0.45) * volatility;
    currentNav = currentNav * (1 + change);
    
    data.push({
      date: format(date, "MMM dd"),
      nav: parseFloat(currentNav.toFixed(2)),
    });
  }
  
  return data;
};

const SIPTracker = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [investmentAmount, setInvestmentAmount] = useState("1000");
  const [investmentDialog, setInvestmentDialog] = useState(false);
  
  // Fetch SIP data
  const { data: sipData = [], isLoading } = useQuery({
    queryKey: ["sip-funds", selectedCategory],
    queryFn: () => fetchSIPData(selectedCategory !== "All" ? [selectedCategory] : undefined),
    refetchOnWindowFocus: false,
  });
  
  // Generate historical data for selected fund
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  useEffect(() => {
    if (selectedFund) {
      // Generate realistic looking historical data based on the fund's attributes
      const volatility = selectedFund.risk === "High" ? 0.015 : 
                          selectedFund.risk === "Moderate" ? 0.01 : 0.007;
      const startNav = selectedFund.nav - (selectedFund.nav * (selectedFund.oneYearReturn / 100));
      setHistoricalData(generateHistoricalData(90, startNav, volatility));
    }
  }, [selectedFund]);
  
  // Categories for filtering
  const categories = [
    "All",
    "Large Cap", 
    "Mid Cap", 
    "Small Cap", 
    "Multi Cap", 
    "ELSS", 
    "Debt", 
    "Hybrid", 
    "Index"
  ];
  
  // Handle investment submission
  const handleInvestment = async () => {
    if (!user) {
      toast.error("Please log in to invest in SIPs");
      return;
    }
    
    if (!selectedFund) {
      toast.error("Please select a fund to invest in");
      return;
    }
    
    const amount = Number(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }
    
    try {
      // Process the SIP investment
      const result = await processSIPInvestment(
        user.id, 
        selectedFund.name, 
        amount
      );
      
      // Create transaction in Supabase
      if (result && result.transaction) {
        const { error } = await supabase
          .from("transactions")
          .insert(result.transaction);
          
        if (error) throw error;
      }
      
      toast.success(`Successfully invested ${formatCurrency(amount)} in ${selectedFund.name}`);
      setInvestmentDialog(false);
    } catch (error) {
      console.error("Investment error:", error);
      toast.error("Failed to process your investment. Please try again.");
    }
  };
  
  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <CircleDollarSign className="mr-2 h-5 w-5 text-green-500" />
          SIP Investment Tracker
        </CardTitle>
        <CardDescription>
          Track and invest in Systematic Investment Plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="explore">
          <TabsList className="mb-4">
            <TabsTrigger value="explore">Explore SIPs</TabsTrigger>
            <TabsTrigger value="details">Fund Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="explore">
            <div className="mb-4">
              <Select defaultValue={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fund Name</th>
                    <th className="text-right py-3 px-4">Category</th>
                    <th className="text-right py-3 px-4">NAV (₹)</th>
                    <th className="text-right py-3 px-4">1Y Return</th>
                    <th className="text-right py-3 px-4">Risk</th>
                    <th className="text-right py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      </td>
                    </tr>
                  ) : sipData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No SIP funds available
                      </td>
                    </tr>
                  ) : (
                    sipData.map((fund: any) => (
                      <tr key={fund.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">
                          <button 
                            onClick={() => setSelectedFund(fund)} 
                            className="text-left hover:text-primary focus:outline-none"
                          >
                            {fund.name}
                          </button>
                        </td>
                        <td className="text-right py-3 px-4">{fund.category}</td>
                        <td className="text-right py-3 px-4">₹{fund.nav.toFixed(2)}</td>
                        <td className={`text-right py-3 px-4 ${fund.oneYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {fund.oneYearReturn >= 0 ? '+' : ''}{fund.oneYearReturn.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                            fund.risk === 'High' ? 'bg-red-100 text-red-700' : 
                            fund.risk === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {fund.risk}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Dialog open={investmentDialog && selectedFund?.id === fund.id} onOpenChange={(open) => {
                            setInvestmentDialog(open);
                            if (open) setSelectedFund(fund);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-xs">
                                Invest
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Invest in {fund.name}</DialogTitle>
                                <DialogDescription>
                                  Enter the amount you would like to invest in this SIP.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="amount">Investment Amount (₹)</Label>
                                  <Input
                                    id="amount"
                                    type="number"
                                    value={investmentAmount}
                                    onChange={(e) => setInvestmentAmount(e.target.value)}
                                    placeholder="1000"
                                    min="100"
                                  />
                                </div>
                                
                                <div className="bg-muted/50 p-3 rounded-md text-sm">
                                  <div className="flex justify-between mb-2">
                                    <span>Fund Category:</span>
                                    <span className="font-medium">{fund.category}</span>
                                  </div>
                                  <div className="flex justify-between mb-2">
                                    <span>Current NAV:</span>
                                    <span className="font-medium">₹{fund.nav.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>1 Year Return:</span>
                                    <span className={`font-medium ${fund.oneYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {fund.oneYearReturn >= 0 ? '+' : ''}{fund.oneYearReturn.toFixed(2)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setInvestmentDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleInvestment}>
                                  Confirm Investment
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            {selectedFund ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{selectedFund.name}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{selectedFund.category}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">NAV</p>
                        <p className="font-medium">₹{selectedFund.nav.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">1 Year Return</p>
                        <p className={`font-medium ${selectedFund.oneYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {selectedFund.oneYearReturn >= 0 ? '+' : ''}{selectedFund.oneYearReturn.toFixed(2)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">3 Year Return</p>
                        <p className={`font-medium ${selectedFund.threeYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {selectedFund.threeYearReturn >= 0 ? '+' : ''}{selectedFund.threeYearReturn.toFixed(2)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">5 Year Return</p>
                        <p className={`font-medium ${selectedFund.fiveYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {selectedFund.fiveYearReturn >= 0 ? '+' : ''}{selectedFund.fiveYearReturn.toFixed(2)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Risk</p>
                        <p className="font-medium">{selectedFund.risk}</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setInvestmentDialog(true)}
                      className="w-full sm:w-auto"
                    >
                      Invest Now
                    </Button>
                  </div>
                  
                  <div className="flex-1 h-[240px]">
                    <h4 className="text-sm font-medium mb-2">NAV Trend (3 Months)</h4>
                    {historicalData.length > 0 ? (
                      <ChartContainer
                        config={{
                          nav: {
                            theme: {
                              light: "hsl(220, 80%, 50%)",
                              dark: "hsl(220, 80%, 60%)"
                            }
                          }
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={historicalData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => value.split(' ')[0]}
                              interval="preserveEnd"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => `₹${value}`}
                              domain={['auto', 'auto']}
                            />
                            <RechartsTooltip
                              content={<ChartTooltipContent 
                                formatter={(value) => [`₹${value}`, "NAV"]}
                              />}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="nav" 
                              stroke="var(--color-nav)"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground text-sm">No historical data available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Past performance does not guarantee future results</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div>
                      <h4 className="text-sm font-medium mb-1">About this fund</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedFund.category === "Large Cap" 
                          ? "This fund primarily invests in large-cap companies which are more stable and less volatile."
                          : selectedFund.category === "Mid Cap"
                          ? "This fund primarily invests in mid-cap companies which have good growth potential but moderate risk."
                          : selectedFund.category === "Small Cap"
                          ? "This fund primarily invests in small-cap companies which have high growth potential but higher risk."
                          : selectedFund.category === "ELSS"
                          ? "This is a tax-saving equity scheme with a lock-in period of 3 years."
                          : "This fund invests in a mix of securities to provide balanced returns over time."}
                        {" "}Past performance does not guarantee future results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a fund to view details</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a fund from the "Explore SIPs" tab to view detailed information and performance history.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SIPTracker;
