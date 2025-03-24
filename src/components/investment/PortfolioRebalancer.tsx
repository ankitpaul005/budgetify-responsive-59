
import React, { useState } from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, PieChart, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatPercent } from "@/utils/formatting";

interface AssetAllocation {
  type: string;
  currentPercent: number;
  targetPercent: number;
  color: string;
}

const PortfolioRebalancer: React.FC = () => {
  const [assetAllocations, setAssetAllocations] = useState<AssetAllocation[]>([
    { type: "Stocks", currentPercent: 60, targetPercent: 55, color: "#0EA5E9" },
    { type: "Bonds", currentPercent: 20, targetPercent: 25, color: "#10B981" },
    { type: "Cash", currentPercent: 15, targetPercent: 10, color: "#F59E0B" },
    { type: "Alternative", currentPercent: 5, targetPercent: 10, color: "#8B5CF6" },
  ]);
  
  const [activeTab, setActiveTab] = useState("current");
  const [needsRebalancing, setNeedsRebalancing] = useState(true);
  
  const handleSliderChange = (index: number, value: number[]) => {
    const newAllocations = [...assetAllocations];
    newAllocations[index].targetPercent = value[0];
    
    // Ensure total is 100%
    const total = newAllocations.reduce((sum, asset) => sum + asset.targetPercent, 0);
    if (total !== 100) {
      // Adjust the last asset to make total 100%
      const lastIndex = newAllocations.length - 1;
      if (index !== lastIndex) {
        newAllocations[lastIndex].targetPercent = 100 - (total - newAllocations[lastIndex].targetPercent);
      } else {
        // If the last asset was adjusted, adjust the first one
        newAllocations[0].targetPercent = 100 - (total - newAllocations[0].targetPercent);
      }
    }
    
    setAssetAllocations(newAllocations);
  };
  
  const calculateDeviation = (current: number, target: number): number => {
    return current - target;
  };
  
  const rebalancePortfolio = () => {
    setNeedsRebalancing(false);
    
    // Simulate rebalancing by setting current to target
    const newAllocations = assetAllocations.map(asset => ({
      ...asset,
      currentPercent: asset.targetPercent
    }));
    
    setAssetAllocations(newAllocations);
    toast.success("Portfolio successfully rebalanced");
  };
  
  const resetToRecommended = () => {
    const recommendedAllocations: AssetAllocation[] = [
      { type: "Stocks", currentPercent: 60, targetPercent: 60, color: "#0EA5E9" },
      { type: "Bonds", currentPercent: 20, targetPercent: 25, color: "#10B981" },
      { type: "Cash", currentPercent: 15, targetPercent: 5, color: "#F59E0B" },
      { type: "Alternative", currentPercent: 5, targetPercent: 10, color: "#8B5CF6" },
    ];
    
    setAssetAllocations(recommendedAllocations);
    setNeedsRebalancing(true);
    toast.info("Reset to recommended allocations");
  };
  
  // Calculate if rebalancing is needed (deviation > 5%)
  const totalDeviation = assetAllocations.reduce(
    (sum, asset) => sum + Math.abs(calculateDeviation(asset.currentPercent, asset.targetPercent)), 
    0
  ) / 2; // Divide by 2 because each deviation is counted twice

  return (
    <GlassmorphicCard className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-budget-blue" />
          Portfolio Rebalancer
        </CardTitle>
        <CardDescription>
          Align your investments with your target allocation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="current">Current Allocation</TabsTrigger>
            <TabsTrigger value="target">Target Allocation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative h-48 w-48">
                <PieChart className="h-full w-full text-muted-foreground" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-semibold">{totalDeviation.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">Deviation</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {assetAllocations.map((asset) => (
                <div key={asset.type} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span>{asset.type}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-1">{formatPercent(asset.currentPercent)}</span>
                      {Math.abs(calculateDeviation(asset.currentPercent, asset.targetPercent)) > 5 && (
                        <AlertTriangle className="h-4 w-4 text-budget-yellow" />
                      )}
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${asset.currentPercent}%`,
                        backgroundColor: asset.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {needsRebalancing && totalDeviation > 5 && (
              <div className="p-3 bg-budget-yellow-light text-budget-yellow rounded-lg flex items-start gap-2 mt-4">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Portfolio is out of balance</p>
                  <p className="text-sm">Your current allocation deviates from your target by {totalDeviation.toFixed(1)}%. Consider rebalancing.</p>
                </div>
              </div>
            )}
            
            {!needsRebalancing && (
              <div className="p-3 bg-budget-green-light text-budget-green rounded-lg flex items-start gap-2 mt-4">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Portfolio is balanced</p>
                  <p className="text-sm">Your current allocation matches your target allocation.</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="target" className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative h-48 w-48">
                <PieChart className="h-full w-full text-muted-foreground" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-semibold">100%</span>
                  <span className="text-xs text-muted-foreground">Allocation</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {assetAllocations.map((asset, index) => (
                <div key={asset.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span>{asset.type}</span>
                    </div>
                    <span className="text-sm font-medium">{formatPercent(asset.targetPercent)}</span>
                  </div>
                  <Slider
                    defaultValue={[asset.targetPercent]}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleSliderChange(index, value)}
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetToRecommended}
              >
                Reset to Recommended
              </Button>
              <Button 
                className="flex-1"
                onClick={rebalancePortfolio}
                disabled={!needsRebalancing}
              >
                {needsRebalancing ? "Rebalance Portfolio" : "Already Balanced"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </GlassmorphicCard>
  );
};

export default PortfolioRebalancer;
