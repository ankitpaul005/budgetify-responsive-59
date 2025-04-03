
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Check, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface TOTPSetupFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

const TOTPSetupForm: React.FC<TOTPSetupFormProps> = ({ onComplete, onCancel }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { enableTOTP, verifyTOTP } = useAuth();

  const handleSetupTOTP = async () => {
    try {
      setIsSettingUp(true);
      const totpData = await enableTOTP();
      setQrCode(totpData.qrCode);
      setSecret(totpData.secret);
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      toast.error('Failed to set up two-factor authentication', {
        description: error.message || 'Please try again later',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast.error('Please enter a valid 6-digit code', {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      return;
    }

    try {
      setIsLoading(true);
      const success = await verifyTOTP(verificationCode);
      
      if (success) {
        onComplete();
      }
    } catch (error) {
      console.error('Error verifying TOTP:', error);
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
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <motion.div variants={itemVariants}>
            <CardTitle>Two-Factor Authentication</CardTitle>
          </motion.div>
        </CardHeader>
        
        <CardContent>
          {!qrCode ? (
            <motion.div className="space-y-4" variants={itemVariants}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account by enabling two-factor authentication with Google Authenticator or similar apps.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm text-blue-800 dark:text-blue-200">
                <p>
                  You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator installed on your phone.
                </p>
              </div>
              
              <Button
                onClick={handleSetupTOTP}
                disabled={isSettingUp}
                className="w-full mt-4"
              >
                {isSettingUp ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Set Up Two-Factor Authentication"
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div className="space-y-6" variants={containerVariants}>
              <motion.div className="text-center" variants={itemVariants}>
                <h3 className="text-base font-medium mb-2">Scan QR Code</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Scan this QR code with your authenticator app
                </p>
                
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-2 rounded-md inline-block">
                    <img 
                      src={qrCode} 
                      alt="QR Code for authenticator app" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">Or enter this code manually:</p>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-md py-2 px-4 text-center font-mono break-all">
                    {secret}
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Label htmlFor="verification-code">Enter 6-digit verification code</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-xl tracking-widest mt-1"
                />
              </motion.div>
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter className={`flex ${qrCode ? 'justify-between' : 'justify-end'}`}>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            {qrCode ? "Cancel" : "Skip for now"}
          </Button>
          
          {qrCode && (
            <Button
              onClick={handleVerifyTOTP}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Activate"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TOTPSetupForm;
