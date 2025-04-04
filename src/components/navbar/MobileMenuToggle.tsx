
import React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuToggleProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  toggleMenu: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({
  isOpen,
  isAuthenticated,
  toggleMenu,
}) => {
  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="ml-1"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={toggleMenu}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default MobileMenuToggle;
