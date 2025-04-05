
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Mail, Loader, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AnimatedBackground from "@/components/auth/AnimatedBackground";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Check password strength and requirements
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      setPasswordErrors([]);
      return;
    }
    
    // Password requirements
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/\d/.test(password)) errors.push("At least one number");
    if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("At least one symbol");
    
    setPasswordErrors(errors);
    
    // Simple password strength calculation
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains number
    if (/\d/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
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
      case 5:
        setPasswordFeedback("Strong");
        break;
      default:
        setPasswordFeedback("");
    }
  }, [password]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Please fill all required fields", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      toast.error("Invalid email format", {
        description: "Please enter a valid email address",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Check password requirements
    if (passwordErrors.length > 0) {
      toast.error("Password doesn't meet requirements", {
        description: "Please fix the password issues and try again",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signup(email, password, name);
      
      toast.success("Account created successfully", {
        description: "Welcome to Budgetify!",
        icon: <Check className="h-5 w-5 text-green-500" />
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Failed to create account. Please try again.";
      if (error.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Try logging in instead.";
      }
      
      toast.error("Failed to create account", {
        description: errorMessage,
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
  
  return (
    <AnimatedBackground>
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
                  
                  {/* Password requirements list */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Password requirements:</p>
                    <ul className="text-xs space-y-1 pl-2">
                      <li className={`flex items-center gap-1 ${!password.length || password.length >= 8 ? 'text-green-500' : 'text-red-500'}`}>
                        {!password.length || password.length >= 8 ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        At least 8 characters
                      </li>
                      <li className={`flex items-center gap-1 ${!password.length || /\d/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
                        {!password.length || /\d/.test(password) ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        At least one number
                      </li>
                      <li className={`flex items-center gap-1 ${!password.length || /[A-Z]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
                        {!password.length || /[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        At least one uppercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${!password.length || /[a-z]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
                        {!password.length || /[a-z]/.test(password) ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        At least one lowercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${!password.length || /[^A-Za-z0-9]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
                        {!password.length || /[^A-Za-z0-9]/.test(password) ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        At least one symbol
                      </li>
                    </ul>
                  </div>
                </div>
              )}
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
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </motion.div>
        </motion.form>
        
        <motion.div className="mt-6 text-center" variants={itemVariants}>
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AnimatedBackground>
  );
};

export default SignUpPage;
