
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleQuestion, Mic, MicOff, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const INITIAL_BOT_MESSAGE: Message = {
  id: "welcome",
  content: "Hello! I'm your Budgetify Personal Assistant. How can I help you with your finances today?",
  sender: "bot",
  timestamp: new Date(),
};

// Sample financial advice responses based on different topics
const FINANCIAL_RESPONSES = {
  budget: [
    "Based on your spending patterns, I recommend allocating 50% of your income to necessities, 30% to wants, and 20% to savings or debt repayment.",
    "Have you considered using the envelope budgeting method? It's highly effective for visual budgeters who want to physically separate their funds.",
    "Your current budget allocation seems weighted toward discretionary spending. Would you like me to suggest ways to rebalance your budget?",
  ],
  investing: [
    "For your age profile and risk tolerance, a diversified portfolio with 70% stocks and 30% bonds could be appropriate. Would you like more specific investment recommendations?",
    "Dollar-cost averaging is a strategy worth considering - investing fixed amounts regularly regardless of market conditions can reduce the impact of volatility.",
    "Have you explored index funds? They offer low fees and broad market exposure, which is ideal for long-term investors.",
  ],
  saving: [
    "An emergency fund covering 3-6 months of expenses should be your priority before focusing on other financial goals.",
    "Consider automating your savings with direct deposits to prevent the temptation of spending that money.",
    "For your short-term savings goals, a high-yield savings account currently offers better returns than traditional savings accounts.",
  ],
  debt: [
    "The avalanche method (paying highest interest debt first) will save you the most money in the long run, while the snowball method (paying smallest debts first) can provide psychological wins.",
    "Have you checked if you qualify for any loan forgiveness programs or refinancing options? These could significantly reduce your debt burden.",
    "Based on your current income and debt level, I estimate you could be debt-free in approximately 3 years with a focused repayment strategy.",
  ],
  retirement: [
    "Aiming to save at least 15% of your pre-tax income for retirement is a good rule of thumb for most people.",
    "Don't forget to take full advantage of any employer matching in your retirement accounts - it's essentially free money.",
    "Consider a Roth IRA in addition to your employer-sponsored plan for tax diversification in retirement.",
  ],
  taxes: [
    "Keeping track of all potential tax deductions throughout the year can significantly reduce your tax liability.",
    "Have you considered tax-loss harvesting in your investment portfolio? It can help offset capital gains taxes.",
    "For self-employed individuals, setting up a SEP IRA or Solo 401(k) can provide significant tax advantages.",
  ],
};

// AI helper function to analyze user query and generate contextual response
const generateAIResponse = (query: string): string => {
  query = query.toLowerCase();
  
  // Check if query contains specific financial topics
  const topics = {
    budget: ["budget", "spending", "expense", "money", "allocate", "plan"],
    investing: ["invest", "stock", "bond", "portfolio", "market", "fund"],
    saving: ["save", "savings", "emergency fund", "goal", "future"],
    debt: ["debt", "loan", "credit", "mortgage", "interest", "payment"],
    retirement: ["retire", "retirement", "pension", "401k", "ira"],
    taxes: ["tax", "taxes", "deduction", "refund", "filing", "irs"],
  };

  // Determine the topic with the most matches
  let matchedTopic = null;
  let maxMatches = 0;
  
  for (const [topic, keywords] of Object.entries(topics)) {
    const matches = keywords.filter(keyword => query.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedTopic = topic;
    }
  }
  
  // Generate response based on matched topic or provide general response
  if (matchedTopic && maxMatches > 0) {
    const responses = FINANCIAL_RESPONSES[matchedTopic as keyof typeof FINANCIAL_RESPONSES];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // General greetings
  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Hello! I'm your Budgetify Personal Assistant. How can I help you with your finances today?";
  }
  
  // Gratitude responses
  if (query.includes("thank")) {
    return "You're welcome! I'm always here to help with your financial questions. Is there anything else you'd like to know?";
  }
  
  // Farewell responses
  if (query.includes("bye") || query.includes("goodbye")) {
    return "Goodbye! Feel free to come back whenever you have more financial questions. I'm here to help 24/7.";
  }
  
  // Default response with personalized touch
  return "I'm here to assist with your financial journey. You can ask me about budgeting, investments, saving strategies, debt management, or any other financial topics. How can I help you today?";
};

const ChatbotDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;
      
      speechRecognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
          
        setInput(transcript);
      };
      
      speechRecognition.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
    
    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechRecognition.current) {
      console.error('Speech recognition not supported');
      return;
    }
    
    if (isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecognition.current.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    // Generate AI response with a realistic delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(input.trim());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, Math.random() * 1000 + 500); // Random delay between 500-1500ms for realism
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-50 animate-bounce hover:animate-none"
        aria-label="Chat with assistant"
      >
        <MessageCircleQuestion className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden animate-fadeIn">
          <DialogHeader className="border-b p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Budgetify Personal Assistant</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start",
                  "animate-slideUp"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 transition-all duration-200 hover:shadow-md",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-muted max-w-[80%] rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce delay-100"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResizeTextarea(e);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your financial question..."
                className="resize-none min-h-[40px] max-h-[150px]"
                rows={1}
              />
              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={toggleSpeechRecognition}
                  className={isListening ? "text-red-500" : ""}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button type="button" size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatbotDialog;
