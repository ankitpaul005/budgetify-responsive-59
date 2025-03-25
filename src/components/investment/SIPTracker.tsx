
import React, { useState, useEffect } from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Filter, Plus } from "lucide-react";
import { fetchSIPData } from "@/services/stockService";
import { formatCurrency } from "@/utils/formatting";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface SIPFormData {
  name: string;
  category: string;
  amount: string;
  frequency: string;
}

interface UserSIP {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount: number;
  frequency: string;
  status: string;
  total_invested: number;
  current_value: number;
  created_at?: string;
}

const SIPTracker = () => {
  const { user } = useAuth();
  const [sipData, setSipData] = useState<any[]>([]);
  const [userSIPs, setUserSIPs] = useState<UserSIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SIPFormData>({
    name: "",
    category: "",
    amount: "",
    frequency: "Monthly"
  });

  // Fetch SIP data from service
  useEffect(() => {
    const fetchSIPs = async () => {
      try {
        const data = await fetchSIPData();
        setSipData(data);
      } catch (error) {
        console.error("Error fetching SIP data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSIPs();

    // Refresh every 10 seconds
    const interval = setInterval(fetchSIPs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mock user SIPs instead of fetching from Supabase
  useEffect(() => {
    if (!user) return;

    // Mock data for user SIPs
    const mockUserSIPs: UserSIP[] = [
      {
        id: "1",
        user_id: user.id,
        name: "HDFC Index Fund",
        category: "Large Cap",
        amount: 5000,
        frequency: "Monthly",
        status: "active",
        total_invested: 60000,
        current_value: 65200
      },
      {
        id: "2",
        user_id: user.id,
        name: "SBI Small Cap Fund",
        category: "Small Cap",
        amount: 3000,
        frequency: "Monthly",
        status: "active",
        total_invested: 36000,
        current_value: 38900
      }
    ];
    
    setUserSIPs(mockUserSIPs);
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to invest in SIPs");
      return;
    }

    if (!formData.name || !formData.category || !formData.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      // Create new SIP (using mock data since we don't have a sips table)
      const newSIP: UserSIP = {
        id: Math.random().toString(36).substring(2, 11),
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        amount: amount,
        frequency: formData.frequency,
        status: "active",
        total_invested: amount,
        current_value: amount
      };

      // Update local state
      setUserSIPs(prev => [newSIP, ...prev]);

      toast.success("SIP investment created successfully!");
      setDialogOpen(false);

      // Reset form
      setFormData({
        name: "",
        category: "",
        amount: "",
        frequency: "Monthly"
      });
    } catch (error) {
      console.error("Error creating SIP:", error);
      toast.error("Failed to create SIP investment");
    }
  };

  // Filter SIPs by category
  const filteredSIPs = activeCategory === "All"
    ? sipData
    : sipData.filter(sip => sip.category === activeCategory);

  // Extract categories for filter
  const categories = ["All", ...new Set(sipData.map(sip => sip.category))];

  // Generate performance data for chart
  const generatePerformanceData = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, i) => {
      const monthIndex = (currentMonth - 11 + i) % 12;
      const isBeforeCurrentMonth = monthIndex <= currentMonth;
      
      return {
        month,
        "Large Cap": isBeforeCurrentMonth ? 10 + Math.random() * 8 : null,
        "Mid Cap": isBeforeCurrentMonth ? 12 + Math.random() * 10 : null,
        "Small Cap": isBeforeCurrentMonth ? 15 + Math.random() * 12 : null,
        "ELSS": isBeforeCurrentMonth ? 8 + Math.random() * 7 : null,
      };
    });
  };

  const performanceData = generatePerformanceData();

  return (
    <div className="mb-8">
      <GlassmorphicCard>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-budget-green" /> 
                SIP Investments
              </CardTitle>
              <CardDescription>
                Systematic Investment Plans for long-term growth
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Invest in SIP</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create SIP Investment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">SIP Fund Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="E.g., HDFC Top 100 Fund"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Large Cap">Large Cap</SelectItem>
                          <SelectItem value="Mid Cap">Mid Cap</SelectItem>
                          <SelectItem value="Small Cap">Small Cap</SelectItem>
                          <SelectItem value="ELSS">ELSS (Tax Saving)</SelectItem>
                          <SelectItem value="Debt">Debt</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="Index">Index</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monthly Investment Amount</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter amount in ₹"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Investment Frequency</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value) => handleSelectChange("frequency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleSubmit}>
                      Start Investment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="market">
            <TabsList className="mb-4">
              <TabsTrigger value="market">Market SIPs</TabsTrigger>
              <TabsTrigger value="my-sips">My SIP Investments</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="market">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={activeCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category)}
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(6).fill(0).map((_, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                      <div className="h-5 w-28 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-20 bg-muted rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 w-16 bg-muted rounded"></div>
                          <div className="h-4 w-12 bg-muted rounded"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="h-4 w-20 bg-muted rounded"></div>
                          <div className="h-4 w-14 bg-muted rounded"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-4 w-10 bg-muted rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  filteredSIPs.map((sip, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{sip.name}</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">Invest</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Invest in {sip.name}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="space-y-2 mb-4">
                                <p className="text-sm text-muted-foreground">Category: {sip.category}</p>
                                <p className="text-sm text-muted-foreground">Risk: {sip.risk}</p>
                                <p className="text-sm text-muted-foreground">3-Year Return: {sip.threeYearReturn.toFixed(2)}%</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="sipAmount">Monthly Investment Amount</Label>
                                <Input id="sipAmount" type="number" placeholder="Enter amount" />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => {
                                toast.success(`Investment in ${sip.name} started!`);
                              }}>Start Investment</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">{sip.category}</p>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span>NAV:</span>
                          <span className="font-medium">{formatCurrency(sip.nav)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>1 Year Return:</span>
                          <span className={`font-medium ${sip.oneYearReturn >= 0 ? "text-budget-green" : "text-budget-red"}`}>
                            {sip.oneYearReturn >= 0 ? "+" : ""}{sip.oneYearReturn.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>3 Year Return:</span>
                          <span className={`font-medium ${sip.threeYearReturn >= 0 ? "text-budget-green" : "text-budget-red"}`}>
                            {sip.threeYearReturn >= 0 ? "+" : ""}{sip.threeYearReturn.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Risk Level:</span>
                          <span className="font-medium">{sip.risk}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="my-sips">
              {userSIPs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userSIPs.map((sip, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{sip.name}</h3>
                        <div className={`text-xs px-1.5 py-0.5 rounded ${
                          sip.status === 'active' ? 'bg-budget-green-light text-budget-green' : 'bg-muted text-muted-foreground'
                        }`}>
                          {sip.status}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">{sip.category}</p>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span>Monthly Investment:</span>
                          <span className="font-medium">{formatCurrency(sip.amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Total Invested:</span>
                          <span className="font-medium">{formatCurrency(sip.total_invested)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Current Value:</span>
                          <span className="font-medium">{formatCurrency(sip.current_value)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Investment Frequency:</span>
                          <span className="font-medium">{sip.frequency}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => {
                          toast.success(`Additional investment in ${sip.name} recorded!`);
                        }}>
                          Add Investment
                        </Button>
                        <Button variant={sip.status === 'active' ? "destructive" : "default"} size="sm" className="text-xs h-7" onClick={() => {
                          toast.success(`SIP status updated!`);
                        }}>
                          {sip.status === 'active' ? 'Stop SIP' : 'Resume SIP'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-border rounded-lg">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">No SIP Investments Yet</h3>
                  <p className="text-muted-foreground mb-4">Start your wealth creation journey with systematic investments</p>
                  <Button onClick={() => setDialogOpen(true)}>Start Your First SIP</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 'dataMax + 5']}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Return']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Large Cap" stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Mid Cap" stroke="#8B5CF6" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Small Cap" stroke="#F59E0B" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="ELSS" stroke="#0EA5E9" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Annual Average Returns by Category</h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: 'Large Cap', '1 Year': 12, '3 Years': 15, '5 Years': 14 },
                        { category: 'Mid Cap', '1 Year': 15, '3 Years': 18, '5 Years': 16 },
                        { category: 'Small Cap', '1 Year': 18, '3 Years': 20, '5 Years': 17 },
                        { category: 'ELSS', '1 Year': 10, '3 Years': 14, '5 Years': 12 },
                        { category: 'Debt', '1 Year': 7, '3 Years': 8, '5 Years': 8.5 },
                        { category: 'Hybrid', '1 Year': 11, '3 Years': 13, '5 Years': 12.5 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Return']}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="1 Year" fill="#10B981" name="1 Year" />
                      <Bar dataKey="3 Years" fill="#8B5CF6" name="3 Years" />
                      <Bar dataKey="5 Years" fill="#F59E0B" name="5 Years" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </GlassmorphicCard>
    </div>
  );
};

export default SIPTracker;
