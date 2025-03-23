
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NavItem } from "./types";
import { toast } from "sonner";

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, navItems }) => {
  const { isAuthenticated, user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 animate-fadeIn">
      <div className="flex flex-col space-y-4">
        {isAuthenticated ? (
          <>
            <div className="p-3 mb-2 border-b border-border">
              <p className="font-medium">{userProfile?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 text-foreground/80 hover:text-foreground transition-colors ${
                  location.pathname === item.path
                    ? "text-primary font-medium"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/settings"
              className="py-2 text-foreground/80 hover:text-foreground transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
            <Link
              to="/activity"
              className="py-2 text-foreground/80 hover:text-foreground transition-colors flex items-center"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-transparent hover:border-border"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" className="w-full justify-start">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="w-full justify-start">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
