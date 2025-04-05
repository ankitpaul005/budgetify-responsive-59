
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Check, AlertTriangle, Loader } from "lucide-react";
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
      
      // Add validation for email format
      if (!values.email.includes('@') || !values.email.includes('.')) {
        toast.error("Invalid email format", {
          description: "Please enter a valid email address",
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />
        });
        setIsLoading(false);
        return;
      }
      
      await login(values.email, values.password);
      
      toast.success("Login successful", {
        description: "Welcome back to Budgetify!",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle error cases with more specific feedback
      let errorMessage = "Please check your credentials and try again";
      if (error.message?.includes("rate limited")) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check and try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before logging in.";
      }
      
      toast.error("Login failed", {
        description: errorMessage,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </AnimatedBackground>
  );
};

export default LoginPage;
