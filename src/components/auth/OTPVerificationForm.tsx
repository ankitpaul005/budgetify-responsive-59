
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface OTPVerificationFormProps {
  email: string;
  otpCode: string;
  setOtpCode: (code: string) => void;
  isLoading: boolean;
  isSendingMagicLink: boolean;
  handleVerifyOTP: () => Promise<void>;
  handleSendMagicLink: () => Promise<void>;
  onBack: () => void;
}

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

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  email,
  otpCode,
  setOtpCode,
  isLoading,
  isSendingMagicLink,
  handleVerifyOTP,
  handleSendMagicLink,
  onBack
}) => {
  return (
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
          onClick={onBack}
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
  );
};

export default OTPVerificationForm;
