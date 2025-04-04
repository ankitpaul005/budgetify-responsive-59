
import React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import NotificationManager from "../notifications/NotificationManager";

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
    <div className="flex items-center gap-2 lg:hidden">
      {isAuthenticated && (
        <>
          <NotificationManager />
          <ProfileMenu />
          <ThemeToggle />
        </>
      )}
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
