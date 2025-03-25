
import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { NavItem } from "./types";
import NotificationManager from "../notifications/NotificationManager";

interface DesktopMenuProps {
  isAuthenticated: boolean;
  navItems: NavItem[];
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({
  isAuthenticated,
  navItems,
}) => {
  return (
    <div className="hidden lg:flex items-center gap-1">
      {isAuthenticated ? (
        <>
          <nav className="mr-4">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to="/activity"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  Activity
                </NavLink>
              </li>
            </ul>
          </nav>
          <NotificationManager />
          <ProfileMenu />
          <ThemeToggle />
        </>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <NavLink to="/login">Login</NavLink>
          </Button>
          <Button asChild>
            <NavLink to="/signup">Sign Up</NavLink>
          </Button>
          <ThemeToggle />
        </>
      )}
    </div>
  );
};

export default DesktopMenu;
