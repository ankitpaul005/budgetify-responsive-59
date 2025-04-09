
import React, { useState } from "react";
import Layout from "@/components/Layout";
import LoginForm from "@/components/auth/LoginForm";
import AnimatedBackground from "@/components/auth/AnimatedBackground";
import PageGuide from "@/components/accessibility/PageGuide";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginGuideSteps = [
    {
      title: "Enter Credentials",
      description: "Fill in your email address and password in the login form.",
    },
    {
      title: "Use Accessibility Tools",
      description: "If you need assistance, use the keyboard icon to access the virtual keyboard or the speaker icon to have instructions read aloud.",
    },
    {
      title: "Submit Form",
      description: "Click the 'Sign In' button to log in to your account.",
    },
    {
      title: "Need an Account?",
      description: "If you don't have an account, click the 'Create an account' link below the login form.",
    }
  ];

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      // Simulate login - in a real app, this would call your auth service
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Login attempt with:", values);
      toast.success("Successfully logged in!");
      // Here you would normally navigate to dashboard or home page after successful login
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout withPadding={false}>
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="flex-1 hidden md:block relative overflow-hidden">
          <AnimatedBackground>
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-4">Welcome to Budgetify</h2>
                <p className="text-white/90 text-lg">Your personal finance companion</p>
              </div>
            </div>
          </AnimatedBackground>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Enter your credentials to access your account
              </p>
              <div className="mt-2 flex justify-center">
                <PageGuide 
                  title="Login Page Guide" 
                  steps={loginGuideSteps} 
                />
              </div>
            </div>
            
            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
            />
            
            <div className="mt-8 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" className="p-0" asChild>
                  <Link to="/signup">Create an account</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
