
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle, RefreshCw, Loader, Mail } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface EmailVerificationFormProps {
  email: string;
  onVerificationComplete: () => void;
  onBackToEmail: () => void;
}

const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
  email,
  onVerificationComplete,
  onBackToEmail,
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Timer countdown for resend button
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Send magic link on component mount
  useEffect(() => {
    sendMagicLink();
  }, []);

  const sendMagicLink = async () => {
    try {
      setIsResending(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        }
      });
      
      if (error) throw error;
      
      setMagicLinkSent(true);
      setTimeLeft(60);
      toast.success("Magic link sent!", {
        description: "Please check your email inbox",
        icon: <Mail className="h-5 w-5 text-green-500" />,
      });
    } catch (error) {
      console.error("Error sending magic link:", error);
      toast.error("Failed to send magic link", {
        description: error.message || "Please try again later",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsResending(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error("Invalid verification code", {
        description: "Please enter the 6-digit code from your email",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Verify OTP code
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });
      
      if (error) throw error;
      
      toast.success("Email verified successfully!", {
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      onVerificationComplete();
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Invalid verification code", {
        description: error.message || "Please check the code and try again",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -z-10 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl top-20 right-10"></div>
          <div className="absolute -z-10 w-60 h-60 rounded-full bg-green-500/5 blur-3xl bottom-0 left-20"></div>
        </div>

        <CardHeader>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-xl font-bold">Email Verification</CardTitle>
            <CardDescription>
              We've sent a 6-digit code and a magic link to {email}
            </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent>
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-sm text-green-800 dark:text-green-200">
              <p className="flex items-start">
                <Mail className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  We've sent you a verification email with a magic link and a 6-digit code. 
                  You can either click the link or enter the code below to verify your email.
                </span>
              </p>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="verification-code">Enter 6-digit code</Label>
              <div className="mt-2">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </motion.div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <motion.div className="flex gap-3 w-full" variants={itemVariants}>
            <Button
              variant="outline"
              onClick={onBackToEmail}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={verifyCode}
              className="flex-1"
              disabled={isLoading || !code || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants} className="w-full">
            <Button
              variant="ghost"
              onClick={sendMagicLink}
              disabled={isResending || timeLeft > 0}
              className="text-sm w-full"
            >
              {isResending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : timeLeft > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend in {timeLeft}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend magic link
                </>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EmailVerificationForm;
