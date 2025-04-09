
import React from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { BarChart3, DollarSign, ActivityIcon, ClipboardList, User, Settings, LogIn, UserPlus, Users, Newspaper } from "lucide-react";

interface MobileMenuToggleProps {
  isAuthenticated: boolean;
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({
  isAuthenticated,
  isOpen,
  toggleMenu,
}) => {
  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="h-4 w-4 mr-2" />, requireAuth: true },
    { label: "Investments", href: "/investments", icon: <DollarSign className="h-4 w-4 mr-2" />, requireAuth: true },
    { label: "Analytics", href: "/analytics", icon: <ActivityIcon className="h-4 w-4 mr-2" />, requireAuth: true },
    { label: "Activity", href: "/activity", icon: <ClipboardList className="h-4 w-4 mr-2" />, requireAuth: true },
    { label: "News", href: "/news", icon: <Newspaper className="h-4 w-4 mr-2" />, requireAuth: false },
    { label: "Companions", href: "/companions", icon: <Users className="h-4 w-4 mr-2" />, requireAuth: true },
    { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4 mr-2" />, requireAuth: true },
    // Authentication links
    { label: "Login", href: "/login", icon: <LogIn className="h-4 w-4 mr-2" />, requireAuth: false, hideIfAuth: true },
    { label: "Sign Up", href: "/signup", icon: <UserPlus className="h-4 w-4 mr-2" />, requireAuth: false, hideIfAuth: true },
  ];

  // Filter links based on authentication status
  const filteredLinks = navLinks.filter(link => 
    (link.requireAuth ? isAuthenticated : true) && 
    (link.hideIfAuth ? !isAuthenticated : true)
  );

  return (
    <Sheet open={isOpen} onOpenChange={toggleMenu}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <nav className="flex flex-col gap-4 mt-8">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent"
              onClick={toggleMenu}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenuToggle;
