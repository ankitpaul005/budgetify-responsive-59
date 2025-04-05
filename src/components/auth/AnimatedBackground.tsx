
import React from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  // Background animation
  const bgVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
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
      {children}
    </motion.div>
  );
};

export default AnimatedBackground;
