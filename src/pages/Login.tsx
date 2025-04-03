
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Loader, Check, AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA verification", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken
        }
      });
      
      if (error) throw error;
      
      toast.success("Login successful", {
        description: "Welcome back to Budgetify!",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      let errorMessage = "Please check your credentials and try again";
      if (error.message && error.message.includes("captcha")) {
        errorMessage = "CAPTCHA verification failed. Please try again.";
        // Reset captcha
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA verification", {
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
          captchaToken
        }
      });
      
      if (error) throw error;
      
      toast.success("Magic link and OTP sent!", {
        description: "Please check your email inbox. You can either click the magic link or enter the OTP here.",
        icon: <Mail className="h-5 w-5 text-green-500" />
      });
      
      // Show OTP input field
      setIsVerifyingOTP(true);
    } catch (error) {
      console.error("Error sending magic link:", error);
      toast.error("Failed to send magic link", {
        description: error.message || "Please try again later",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      
      // Reset captcha
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast.error("Please enter a valid OTP code", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      });
      
      if (error) throw error;
      
      toast.success("OTP verified successfully", {
        description: "You are being logged in",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP", {
        description: error.message || "Please check the code and try again",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
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
        
        {isVerifyingOTP ? (
          <motion.div 
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Label htmlFor="otp">Enter OTP Code</Label>
              <div className="mt-1">
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  className="text-center tracking-widest text-lg"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
            </motion.div>
            
            <motion.div className="flex space-x-3" variants={itemVariants}>
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => setIsVerifyingOTP(false)}
              >
                Back
              </Button>
              <Button
                className="w-1/2"
                onClick={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                onClick={handleSendMagicLink}
                disabled={isSendingMagicLink}
                className="w-full text-sm"
              >
                {isSendingMagicLink ? (
                  <>
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend OTP
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            <motion.div className="space-y-4" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Label htmlFor="email">Email</Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Label htmlFor="password">Password</Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-4">
                <div className="captcha-container flex justify-center">
                  <HCaptcha
                    sitekey="10000000-ffff-ffff-ffff-000000000001" // Test sitekey, replace with real one in production
                    onVerify={handleCaptchaVerify}
                    ref={captchaRef}
                    theme="light"
                  />
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full flex justify-center py-6"
                disabled={isLoading || !captchaToken}
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
                disabled={isSendingMagicLink || !captchaToken}
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
          </motion.form>
        )}
        
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
    </motion.div>
  );
};

export default LoginPage;
