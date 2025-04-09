
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, DollarSign, ActivityIcon, Settings, Newspaper, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Skip rendering on login/signup pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }
  
  const links = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: <BarChart3 className="w-5 h-5" />,
      requireAuth: true,
    },
    { 
      name: "Investments", 
      path: "/investments", 
      icon: <DollarSign className="w-5 h-5" />,
      requireAuth: true,
    },
    { 
      name: "News", 
      path: "/news", 
      icon: <Newspaper className="w-5 h-5" />,
      requireAuth: false,
    },
    { 
      name: "Companions", 
      path: "/companions", 
      icon: <Users className="w-5 h-5" />,
      requireAuth: true,
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: <Settings className="w-5 h-5" />,
      requireAuth: true,
    },
  ];

  // Filter links based on authentication status
  const filteredLinks = links.filter(link => !link.requireAuth || isAuthenticated);
  
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full grid-cols-5">
        {filteredLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className={cn(
              "inline-flex flex-col items-center justify-center text-xs font-medium",
              location.pathname === link.path
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {link.icon}
            <span className="mt-1">{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
