
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SignupPrompt: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem("budgetify-signup-prompt");
    const currentPath = window.location.pathname;
    
    // Skip prompt for login/signup pages
    if (
      !isAuthenticated &&
      !hasSeenPrompt &&
      currentPath !== "/login" && 
      currentPath !== "/signup"
    ) {
      // Small delay to ensure the page loads first
      const timer = setTimeout(() => {
        setOpen(true);
        // Set a 24-hour expiration for the prompt
        localStorage.setItem(
          "budgetify-signup-prompt", 
          (Date.now() + 24 * 60 * 60 * 1000).toString()
        );
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (hasSeenPrompt) {
      // Check if the prompt has expired
      const expirationTime = parseInt(hasSeenPrompt, 10);
      if (Date.now() > expirationTime) {
        localStorage.removeItem("budgetify-signup-prompt");
      }
    }
  }, [isAuthenticated]);

  const handleSignup = () => {
    setOpen(false);
    navigate("/signup");
  };

  const handleLogin = () => {
    setOpen(false);
    navigate("/login");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Budgetify Today!</DialogTitle>
          <DialogDescription>
            Sign up to access all features and start tracking your finances. It's free and only takes a minute!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-budget-green mr-2">✓</span>
              <span>Track expenses and income in one place</span>
            </li>
            <li className="flex items-start">
              <span className="text-budget-green mr-2">✓</span>
              <span>Get personalized investment recommendations</span>
            </li>
            <li className="flex items-start">
              <span className="text-budget-green mr-2">✓</span>
              <span>Access AI-powered financial insights</span>
            </li>
            <li className="flex items-start">
              <span className="text-budget-green mr-2">✓</span>
              <span>Set goals and monitor your progress</span>
            </li>
          </ul>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="sm:flex-1">
            Maybe Later
          </Button>
          <Button variant="outline" onClick={handleLogin} className="sm:flex-1">
            Log In
          </Button>
          <Button onClick={handleSignup} className="sm:flex-1">
            Sign Up Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignupPrompt;
