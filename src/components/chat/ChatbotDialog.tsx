
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
  content: "Hello! I'm your Budgetify assistant. How can I help you with your finances today?",
  sender: "bot",
  timestamp: new Date(),
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
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(input.trim());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const getBotResponse = (message: string): string => {
    message = message.toLowerCase();
    
    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return "Hello! How can I help you with your finances today?";
    } else if (message.includes("invest") || message.includes("stocks") || message.includes("investment")) {
      return "Based on your profile, I recommend diversifying your investments across different asset classes. Check out our investment suggestions on the investments page!";
    } else if (message.includes("budget") || message.includes("spending")) {
      return "To create a budget, start by tracking your income and expenses. Our dashboard provides tools to help you visualize your spending patterns and set budget limits.";
    } else if (message.includes("save") || message.includes("saving")) {
      return "A good rule of thumb is to save at least 20% of your income. Consider setting up automatic transfers to your savings account on payday.";
    } else if (message.includes("debt") || message.includes("loan")) {
      return "To manage debt effectively, prioritize paying off high-interest debt first while making minimum payments on other debts. Consider the debt avalanche or debt snowball methods.";
    } else if (message.includes("tax") || message.includes("taxes")) {
      return "Consider tax-advantaged investment accounts like 401(k)s or IRAs. Keep track of tax-deductible expenses throughout the year for easier filing.";
    } else if (message.includes("retire") || message.includes("retirement")) {
      return "Start planning for retirement early. Aim to save at least 15% of your income for retirement, and take advantage of any employer matching programs.";
    } else if (message.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    } else if (message.includes("bye") || message.includes("goodbye")) {
      return "Goodbye! Feel free to come back if you have more questions.";
    } else {
      return "I'm here to help with your financial questions. You can ask me about budgeting, investments, saving strategies, debt management, or any other financial topics!";
    }
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
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-50"
        aria-label="Chat with assistant"
      >
        <MessageCircleQuestion className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="border-b p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Budgetify Assistant</DialogTitle>
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
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
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
              <div className="flex justify-start">
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
                placeholder="Type your message..."
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
