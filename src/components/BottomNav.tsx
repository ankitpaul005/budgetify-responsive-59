
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BarChart2, PieChart, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-xs font-medium",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="relative">
        {icon}
        {isActive && (
          <motion.div
            layoutId="bottomNavIndicator"
            className="absolute -bottom-1 left-0 right-0 mx-auto h-1 w-1 rounded-full bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
      <span>{label}</span>
    </Link>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Don't render on login/signup pages
  if (["/login", "/signup"].includes(currentPath)) {
    return null;
  }

  const navItems = [
    { to: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { to: "/analytics", icon: <BarChart2 className="h-5 w-5" />, label: "Analytics" },
    { to: "/investments", icon: <PieChart className="h-5 w-5" />, label: "Invest" },
    { to: "/activity", icon: <Activity className="h-5 w-5" />, label: "Activity" },
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={currentPath === item.to}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default BottomNav;
