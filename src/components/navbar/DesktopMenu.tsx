
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import { NavItem } from "./types";

interface DesktopMenuProps {
  isAuthenticated: boolean;
  navItems: NavItem[];
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({ isAuthenticated, navItems }) => {
  const location = useLocation();

  return (
    <div className="hidden md:flex items-center space-x-1">
      {isAuthenticated ? (
        <>
          <div className="flex items-center space-x-6 mr-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-2 text-foreground/80 hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 after:origin-left after:transition-transform hover:after:scale-x-100 ${
                  location.pathname === item.path
                    ? "text-primary after:scale-x-100"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </>
      ) : (
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DesktopMenu;
