
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ProfileMenu from "./navbar/ProfileMenu";
import MobileMenuToggle from "./navbar/MobileMenuToggle";
import DesktopNavLinks from "./navbar/DesktopNavLinks";
import NotificationManager from "./notifications/NotificationManager";
import { Home, BarChart3, TrendingUp, BookOpen, Users, Activity, Newspaper, Split } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
};

const links: NavLink[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3
  },
  {
    label: 'Investment',
    href: '/investment',
    icon: TrendingUp
  },
  {
    label: 'Budget Diary',
    href: '/budget-diary',
    icon: BookOpen
  },
  {
    label: 'Split Expenses',
    href: '/split-expenses',
    icon: Split
  },
  {
    label: 'Companions',
    href: '/companions',
    icon: Users
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: Activity
  },
  {
    label: 'News',
    href: '/news',
    icon: Newspaper
  }
];

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Skip navbar on login/signup pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-budget-blue to-budget-green">Budgetify</span>
            </Link>
            
            <DesktopNavLinks isAuthenticated={isAuthenticated} />
          </div>
          
          <div className="flex items-center gap-2">
            {isAuthenticated && <NotificationManager />}
            <ThemeToggle />
            <ProfileMenu />
            <MobileMenuToggle 
              isOpen={isMobileMenuOpen} 
              isAuthenticated={isAuthenticated} 
              toggleMenu={toggleMobileMenu} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
