
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DesktopNavLinksProps {
  isAuthenticated: boolean;
}

const DesktopNavLinks: React.FC<DesktopNavLinksProps> = ({ isAuthenticated }) => {
  const location = useLocation();
  
  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <nav className="ml-6 hidden lg:flex">
      <ul className="flex items-center space-x-4">
        <li>
          <Link 
            to="/dashboard" 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isLinkActive("/dashboard") 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/investments" 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isLinkActive("/investments") 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Investments
          </Link>
        </li>
        <li>
          <Link 
            to="/analytics" 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isLinkActive("/analytics") 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Analytics
          </Link>
        </li>
        <li>
          <Link 
            to="/activity" 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isLinkActive("/activity") 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Activity
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default DesktopNavLinks;
