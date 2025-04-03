
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// Import our new components
import LoginForm from "@/components/auth/LoginForm";
import OTPVerificationForm from "@/components/auth/OTPVerificationForm";
import AnimatedBackground from "@/components/auth/AnimatedBackground";

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
        description: "Welcome back to Budgetify!"
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
        description: "Please check your email inbox. You can either click the magic link or enter the OTP here."
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
        description: "You are being logged in"
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
        {/* Animated background */}
        <AnimatedBackground />

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
          <OTPVerificationForm 
            email={email}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            isLoading={isLoading}
            isSendingMagicLink={isSendingMagicLink}
            handleVerifyOTP={handleVerifyOTP}
            handleSendMagicLink={handleSendMagicLink}
            onBack={() => setIsVerifyingOTP(false)}
          />
        ) : (
          <LoginForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            isSendingMagicLink={isSendingMagicLink}
            handleSubmit={handleSubmit}
            handleSendMagicLink={handleSendMagicLink}
            captchaRef={captchaRef}
            captchaToken={captchaToken}
            handleCaptchaVerify={handleCaptchaVerify}
          />
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
