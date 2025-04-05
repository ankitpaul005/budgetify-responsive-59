
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AlertTriangle, Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";
import LoginForm from "@/components/auth/LoginForm";
import AnimatedBackground from "@/components/auth/AnimatedBackground";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      console.log("Login attempt with:", values.email);
      
      // Store email for verification if needed
      setEmailForVerification(values.email);
      
      // Try direct login first without email verification
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.log("Login error response:", error);
        
        // If email not confirmed, show verification form
        if (error.message.includes("Email not confirmed")) {
          setShowVerification(true);
          toast.info("Please verify your email", {
            description: "We've sent you a verification email",
            icon: <Mail className="h-5 w-5 text-blue-500" />
          });
          
          // Send magic link for verification
          await supabase.auth.signInWithOtp({
            email: values.email,
            options: {
              emailRedirectTo: window.location.origin + '/dashboard',
            }
          });
          
          return;
        } else {
          throw error;
        }
      }
      
      console.log("Login successful:", !!data?.user);
      
      toast.success("Login successful", {
        description: "Welcome back to Budgetify!",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle other error cases
      let errorMessage = "Please check your credentials and try again";
      if (error.message?.includes("rate limited")) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.message?.includes("credentials")) {
        errorMessage = "Invalid email or password";
      }
      
      toast.error("Login failed", {
        description: errorMessage,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    // We need to get the email from the form
    const email = document.querySelector<HTMLInputElement>('input[name="email"]')?.value;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }

    try {
      setIsSendingMagicLink(true);
      setEmailForVerification(email);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        }
      });
      
      if (error) throw error;
      
      setShowVerification(true);
      toast.success("Magic link sent!", {
        description: "Please check your email inbox",
        icon: <Mail className="h-5 w-5 text-green-500" />
      });
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      toast.error("Failed to send magic link", {
        description: error.message || "Please try again later",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  // Return to email/password login form
  const handleBackToLogin = () => {
    setShowVerification(false);
  };

  const handleVerificationComplete = () => {
    navigate("/dashboard");
  };
  
  return (
    <AnimatedBackground>
      {showVerification ? (
        <EmailVerificationForm 
          email={emailForVerification} 
          onVerificationComplete={handleVerificationComplete}
          onBackToEmail={handleBackToLogin}
        />
      ) : (
        <LoginForm
          onSubmit={handleSubmit}
          onSendMagicLink={handleSendMagicLink}
          isLoading={isLoading}
          isSendingMagicLink={isSendingMagicLink}
        />
      )}
    </AnimatedBackground>
  );
};

export default LoginPage;
