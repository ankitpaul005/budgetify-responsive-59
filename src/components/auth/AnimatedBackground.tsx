
import React from "react";
import { motion } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  return (
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
  );
};

export default AnimatedBackground;
