
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Loader, Mail } from "lucide-react";
import { motion } from "framer-motion";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  isSendingMagicLink: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSendMagicLink: () => Promise<void>;
  captchaRef: React.RefObject<HCaptcha>;
  captchaToken: string | null;
  handleCaptchaVerify: (token: string) => void;
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

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  isSendingMagicLink,
  handleSubmit,
  handleSendMagicLink,
  captchaRef,
  captchaToken,
  handleCaptchaVerify
}) => {
  return (
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
  );
};

export default LoginForm;
