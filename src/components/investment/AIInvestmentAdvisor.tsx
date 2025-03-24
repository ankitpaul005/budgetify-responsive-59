
import React, { useState } from "react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Mic, MicOff, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AIInvestmentAdvisor: React.FC = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("query");
  
  const toggleVoiceInput = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Error with voice recognition");
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Speech recognition error:", error);
      toast.error("Failed to start voice recognition");
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please enter a question or request");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the Edge Function
      // that connects to an AI service like OpenAI
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let aiResponse = "";
      
      if (input.toLowerCase().includes("recommend") || input.toLowerCase().includes("suggestion")) {
        aiResponse = "Based on your risk profile and financial goals, I recommend considering a diversified portfolio with:\n\n- 40% in Large-Cap Index Funds (lower risk)\n- 30% in Mid-Cap Growth Funds (moderate risk)\n- 20% in Select Technology Stocks (higher risk)\n- 10% in Bonds (stability)\n\nThis allocation provides a balanced approach to growth while managing volatility. Would you like more specific recommendations for any of these categories?";
      } else if (input.toLowerCase().includes("market") || input.toLowerCase().includes("trend")) {
        aiResponse = "Current market trends show technology and healthcare sectors outperforming others. Inflation concerns are affecting bond markets, while cryptocurrency remains volatile. Consider adjusting your portfolio to increase exposure to stable tech companies with strong fundamentals and reducing positions in highly leveraged businesses sensitive to interest rate changes.";
      } else if (input.toLowerCase().includes("stock") || input.toLowerCase().includes("share")) {
        aiResponse = "Before recommending specific stocks, I'd need to understand your investment timeframe, risk tolerance, and financial goals. Generally speaking, companies with strong fundamentals, reasonable valuations, and competitive advantages in growing sectors tend to perform well long-term. Would you like to provide more details about your investment preferences?";
      } else if (input.toLowerCase().includes("risk") || input.toLowerCase().includes("profile")) {
        aiResponse = "Your risk profile appears to be moderate based on your previous investments. With this profile, a balanced approach would be appropriate - mixing growth investments with more stable assets. Consider a 60/40 split between equity and fixed income, with diversification across different sectors and geographies to spread risk.";
      } else {
        aiResponse = "I understand you're asking about investments. To provide the most helpful guidance, could you specify whether you're interested in stock recommendations, portfolio allocation, market trends, or something else? This will help me tailor my advice to your specific needs.";
      }
      
      setResponse(aiResponse);
      setActiveTab("response");
    } catch (error) {
      console.error("AI request error:", error);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassmorphicCard className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-budget-yellow" />
          AI Investment Advisor
        </CardTitle>
        <CardDescription>
          Get personalized investment advice and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="query">Your Query</TabsTrigger>
            <TabsTrigger value="response">AI Response</TabsTrigger>
          </TabsList>
          
          <TabsContent value="query" className="space-y-4">
            <Textarea
              placeholder="Ask about investment strategies, stock recommendations, or market insights..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                className={isListening ? "text-budget-red" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isLoading ? "Processing..." : "Get Advice"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="response" className="mt-0">
            {response ? (
              <div className="p-4 border border-border rounded-lg bg-muted/30 min-h-[160px] whitespace-pre-wrap">
                {response}
              </div>
            ) : (
              <div className="p-4 border border-border rounded-lg bg-muted/30 min-h-[160px] flex items-center justify-center text-muted-foreground">
                AI responses will appear here
              </div>
            )}
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setActiveTab("query")}
            >
              Ask Another Question
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </GlassmorphicCard>
  );
};

export default AIInvestmentAdvisor;
