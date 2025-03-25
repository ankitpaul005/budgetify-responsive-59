
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ProfileMenu from "./navbar/ProfileMenu";
import MobileMenuToggle from "./navbar/MobileMenuToggle";
import DesktopNavLinks from "./navbar/DesktopNavLinks";
import NotificationManager from "./notifications/NotificationManager";

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
