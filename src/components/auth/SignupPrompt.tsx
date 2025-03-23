
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import useLocalStorage from "@/hooks/useLocalStorage";

const SignupPrompt: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [hasSeenPrompt, setHasSeenPrompt] = useLocalStorage("budgetify-signup-seen", false);
  
  useEffect(() => {
    // Only show the prompt if user is not authenticated and hasn't seen it before
    const timer = setTimeout(() => {
      if (!isAuthenticated && !hasSeenPrompt) {
        setOpen(true);
      }
    }, 2000); // Show after 2 seconds
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, hasSeenPrompt]);
  
  const handleClose = () => {
    setOpen(false);
    setHasSeenPrompt(true);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Start your financial journey today!</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Create an account to track your expenses, set budgets, and achieve your financial goals.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Track your expenses with beautiful charts</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Create savings goals and stick to them</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Get personalized investment recommendations</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button asChild className="w-full">
            <Link to="/signup">Sign up now</Link>
          </Button>
          <Button variant="outline" onClick={handleClose} className="w-full">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupPrompt;
