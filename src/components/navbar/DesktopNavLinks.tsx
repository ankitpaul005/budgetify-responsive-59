
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { BarChart3, DollarSign, ActivityIcon, Users, Newspaper, Settings } from "lucide-react";

const navLinks = [
  { 
    title: "Dashboard", 
    href: "/dashboard", 
    icon: <BarChart3 className="h-4 w-4 mr-1" />, 
    requireAuth: true 
  },
  { 
    title: "Investments", 
    href: "/investments", 
    icon: <DollarSign className="h-4 w-4 mr-1" />, 
    requireAuth: true 
  },
  { 
    title: "Analytics", 
    href: "/analytics", 
    icon: <ActivityIcon className="h-4 w-4 mr-1" />, 
    requireAuth: true 
  },
  { 
    title: "News", 
    href: "/news", 
    icon: <Newspaper className="h-4 w-4 mr-1" />, 
    requireAuth: false 
  },
  { 
    title: "Companions", 
    href: "/companions", 
    icon: <Users className="h-4 w-4 mr-1" />, 
    requireAuth: true 
  },
  { 
    title: "Settings", 
    href: "/settings", 
    icon: <Settings className="h-4 w-4 mr-1" />, 
    requireAuth: true 
  },
];

interface DesktopNavLinksProps {
  isAuthenticated: boolean;
}

const DesktopNavLinks: React.FC<DesktopNavLinksProps> = ({ isAuthenticated }) => {
  const location = useLocation();
  
  // Filter links based on authentication status
  const filteredLinks = navLinks.filter(link => !link.requireAuth || isAuthenticated);

  return (
    <NavigationMenu className="hidden md:flex ml-4">
      <NavigationMenuList>
        {filteredLinks.map((link) => (
          <NavigationMenuItem key={link.href}>
            <Link
              to={link.href}
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                location.pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/60"
              )}
            >
              {link.icon}
              {link.title}
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default DesktopNavLinks;
