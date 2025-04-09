
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { User, Lock, Loader } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AccessibilityTools from "@/components/accessibility/AccessibilityTools";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
}

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

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div className="space-y-4" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Email</FormLabel>
                      <AccessibilityTools 
                        text="Enter your email address" 
                        showKeyboard={true}
                        targetInputId="email-input"
                      />
                    </div>
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
                          id="email-input"
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
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <AccessibilityTools 
                        text="Enter your password" 
                        showKeyboard={true}
                        targetInputId="password-input"
                      />
                    </div>
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
                          id="password-input"
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
  );
};

export default LoginForm;
