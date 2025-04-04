
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Loader, Check, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      
      // Try direct login first without email verification
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        // If email not confirmed, show verification form
        if (error.message.includes("Email not confirmed")) {
          setShowVerification(true);
          toast.info("Please verify your email", {
            description: "We've sent you a verification email",
            icon: <Mail className="h-5 w-5 text-blue-500" />
          });
        } else {
          throw error;
        }
        return;
      }
      
      toast.success("Login successful", {
        description: "Welcome back to Budgetify!",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    const email = form.getValues("email");
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }

    try {
      setIsSendingMagicLink(true);
      
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
    } catch (error) {
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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Background animation
  const bgVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as any,
        duration: 20,
        ease: "linear"
      }
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-[length:200%_200%]"
      animate="animate"
      variants={bgVariants}
    >
      {showVerification ? (
        <EmailVerificationForm 
          email={form.getValues("email")} 
          onVerificationComplete={handleVerificationComplete}
          onBackToEmail={handleBackToLogin}
        />
      ) : (
        <motion.div 
          className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg relative overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div 
              className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-blue-200/30 to-transparent blur-3xl dark:from-blue-900/20"
              animate={{ 
                y: [0, 10, 0], 
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.5, 0.4] 
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-green-200/30 to-transparent blur-3xl dark:from-green-900/20"
              animate={{ 
                y: [0, -10, 0], 
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.5, 0.4] 
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            ></motion.div>
          </div>

          <motion.div className="text-center" variants={itemVariants}>
            <motion.h1 
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome Back
            </motion.h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
          </motion.div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="example@email.com"
                              className="pl-10"
                              type="email"
                              autoComplete="email"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              autoComplete="current-password"
                              className="pl-10"
                              placeholder="••••••••"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </motion.div>

              <motion.div 
                className="flex justify-center pt-2"
                variants={itemVariants}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSendMagicLink}
                  disabled={isSendingMagicLink}
                  className="text-sm"
                >
                  {isSendingMagicLink ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Sign in with magic link
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
          
          <motion.div 
            className="mt-6 text-center space-y-2" 
            variants={itemVariants}
          >
            <motion.p 
              className="text-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
                Sign up
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoginPage;
