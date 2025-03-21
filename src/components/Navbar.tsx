
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NavLogo from "./navbar/NavLogo";
import DesktopMenu from "./navbar/DesktopMenu";
import MobileMenuToggle from "./navbar/MobileMenuToggle";
import MobileMenu from "./navbar/MobileMenu";

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll for styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items that appear when logged in
  const authenticatedNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Investments", path: "/investments" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
        isScrolled 
          ? "py-3 backdrop-blur-lg bg-white/80 dark:bg-black/50 shadow-sm" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <NavLogo />

          {/* Desktop Menu */}
          <DesktopMenu 
            isAuthenticated={isAuthenticated}
            navItems={authenticatedNavItems}
          />

          {/* Mobile Menu Button */}
          <MobileMenuToggle 
            isOpen={mobileMenuOpen}
            isAuthenticated={isAuthenticated}
            toggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </nav>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={mobileMenuOpen}
          navItems={authenticatedNavItems}
        />
      </div>
    </header>
  );
};

export default Navbar;
