
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Mail, Phone, Loader, ArrowRight, Check, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const { signup, isAuthenticated, updateUserPhoneNumber } = useAuth();
  const navigate = useNavigate();
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }
    
    // Simple password strength calculation
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains number
    if (/\d/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    
    // Set feedback based on strength
    switch(strength) {
      case 0:
        setPasswordFeedback("Very weak");
        break;
      case 1:
        setPasswordFeedback("Weak");
        break;
      case 2:
        setPasswordFeedback("Fair");
        break;
      case 3:
        setPasswordFeedback("Good");
        break;
      case 4:
        setPasswordFeedback("Strong");
        break;
      default:
        setPasswordFeedback("");
    }
  }, [password]);
  
  // Handle phone verification
  const handleVerifyPhone = async () => {
    // Validate phone number
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Please enter a valid phone number with country code (e.g., +1234567890)", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    try {
      setIsPhoneLoading(true);
      
      // Use Supabase phone OTP authentication
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        throw error;
      }
      
      setIsVerifyingPhone(true);
      toast.success("Verification code sent to your phone", {
        description: "Enter the 6-digit code you received",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code", {
        description: error.message || "Please try again later",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };
  
  // Handle code verification
  const handleCodeVerification = async () => {
    // Check code format
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast.error("Please enter a valid 6-digit code", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    try {
      setIsPhoneLoading(true);
      
      // Verify OTP
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: 'sms'
      });
      
      if (error) {
        throw error;
      }
      
      // Successfully verified
      setPhoneVerified(true);
      toast.success("Phone number verified successfully", {
        icon: <Check className="h-5 w-5 text-green-500" />
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Invalid verification code", {
        description: error.message || "Please try again with the correct code",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleInitiateEmailVerification = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    setIsVerifyingEmail(true);
  };
  
  const handleEmailVerificationComplete = () => {
    setEmailVerified(true);
    setIsVerifyingEmail(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Please fill all required fields", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    if (!emailVerified) {
      toast.error("Please verify your email before signing up", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signup(email, password, name);
      
      // If phone is verified, add phone number to user profile
      if (phoneVerified && phoneNumber) {
        try {
          await updateUserPhoneNumber(phoneNumber);
          toast.success("Phone number added to your profile", {
            description: "You can use it for two-factor authentication",
            icon: <Check className="h-5 w-5 text-green-500" />
          });
        } catch (error) {
          console.error("Error updating phone number:", error);
          toast.error("Could not add phone number to your profile", {
            description: "You can add it later in settings",
            icon: <AlertTriangle className="h-5 w-5 text-red-500" />
          });
        }
      }
      
      toast.success("Account created successfully", {
        description: "Welcome to Budgetify!",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      // Navigation is handled inside signup function
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account", {
        description: error.message || "Please try again later",
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
  
  // If user is verifying email, show the email verification form
  if (isVerifyingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <EmailVerificationForm 
          email={email}
          onVerificationComplete={handleEmailVerificationComplete}
          onBackToEmail={() => setIsVerifyingEmail(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center" variants={itemVariants}>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign up for a new account</p>
        </motion.div>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email Signup</TabsTrigger>
            <TabsTrigger value="phone">Phone Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <motion.form className="mt-8 space-y-6" onSubmit={handleSubmit} variants={containerVariants}>
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="pl-10"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label htmlFor="email">Email</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
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
                      disabled={emailVerified}
                    />
                  </div>
                  {emailVerified ? (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <Check className="mr-1 h-4 w-4" />
                      Email verified
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleInitiateEmailVerification}
                    >
                      Verify Email
                    </Button>
                  )}
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
                      autoComplete="new-password"
                      required
                      className="pl-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs">Password strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength === 0 ? "text-red-500" :
                          passwordStrength === 1 ? "text-orange-500" :
                          passwordStrength === 2 ? "text-yellow-500" :
                          passwordStrength === 3 ? "text-green-400" :
                          "text-green-500"
                        }`}>{passwordFeedback}</span>
                      </div>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            passwordStrength === 0 ? "bg-red-500 w-[10%]" :
                            passwordStrength === 1 ? "bg-orange-500 w-[25%]" :
                            passwordStrength === 2 ? "bg-yellow-500 w-[50%]" :
                            passwordStrength === 3 ? "bg-green-400 w-[75%]" :
                            "bg-green-500 w-full"
                          } transition-all duration-300`}
                        ></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-6"
                  disabled={isLoading || !emailVerified}
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </motion.div>
              
              {phoneVerified && (
                <motion.div 
                  className="flex items-center p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Phone number verified for 2FA
                </motion.div>
              )}
            </motion.form>
          </TabsContent>
          
          <TabsContent value="phone">
            <motion.div className="space-y-6" variants={containerVariants}>
              {!isVerifyingPhone ? (
                <motion.div className="space-y-4" variants={containerVariants}>
                  <motion.div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4" variants={itemVariants}>
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5 mr-2" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Add your phone number for two-factor authentication to increase your account security.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="pl-10"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Enter your phone number with country code (e.g., +1234567890)</p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Button
                      onClick={handleVerifyPhone}
                      className="w-full flex justify-center items-center py-6"
                      disabled={isPhoneLoading}
                    >
                      {isPhoneLoading ? (
                        <>
                          <Loader className="animate-spin mr-2" />
                          Sending code...
                        </>
                      ) : (
                        <>
                          Send Verification Code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              ) : phoneVerified ? (
                <motion.div 
                  className="text-center p-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Verification Successful</h3>
                  <p className="text-muted-foreground mb-4">Your phone number has been verified successfully.</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsVerifyingPhone(false)}
                    className="mr-2"
                  >
                    Change Number
                  </Button>
                  <Button onClick={() => {
                    // Fixed by using proper TypeScript casting for the HTMLElement
                    const emailTab = document.querySelector('[data-value="email"]') as HTMLElement;
                    if (emailTab) {
                      emailTab.click();
                    }
                  }}>
                    Continue to Signup
                  </Button>
                </motion.div>
              ) : (
                <motion.div className="space-y-4" variants={containerVariants}>
                  <motion.div variants={itemVariants}>
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      name="verificationCode"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={6}
                      className="text-center tracking-widest text-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We've sent a verification code to {phoneNumber}
                    </p>
                  </motion.div>
                  
                  <motion.div className="flex space-x-3" variants={itemVariants}>
                    <Button
                      variant="outline"
                      onClick={() => setIsVerifyingPhone(false)}
                      className="flex-1"
                      disabled={isPhoneLoading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleCodeVerification}
                      className="flex-1"
                      disabled={isPhoneLoading}
                    >
                      {isPhoneLoading ? (
                        <>
                          <Loader className="animate-spin mr-2 h-4 w-4" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.p 
                    className="text-center text-sm mt-4"
                    variants={itemVariants}
                  >
                    Didn't receive the code?{" "}
                    <button 
                      type="button"
                      className="text-primary hover:underline"
                      onClick={handleVerifyPhone}
                      disabled={isPhoneLoading}
                    >
                      Resend
                    </button>
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
        
        <motion.div className="mt-6 text-center" variants={itemVariants}>
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
