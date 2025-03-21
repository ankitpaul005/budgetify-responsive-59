
import React from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ProfileMenu from "./ProfileMenu";

interface MobileMenuToggleProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  toggleMenu: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ 
  isOpen, 
  isAuthenticated, 
  toggleMenu 
}) => {
  return (
    <div className="flex md:hidden items-center space-x-2">
      <ThemeToggle />
      {isAuthenticated && (
        <ProfileMenu />
      )}
      <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default MobileMenuToggle;
