
import { cn } from "@/lib/utils";
import React from "react";

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowEffect?: boolean;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  className,
  hoverEffect = false,
  glowEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative rounded-xl backdrop-blur-lg bg-white/80 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-sm p-6",
        hoverEffect && "transition-all duration-300 hover:shadow-lg hover:bg-white/90 dark:hover:bg-black/30",
        glowEffect && "before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-r before:from-primary/20 before:to-budget-purple/20 before:blur-xl before:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
