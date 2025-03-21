import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, Activity } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll for styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items that appear when logged in
  const authenticatedNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Investments", path: "/investments" },
    { label: "Analytics", path: "/analytics" },
  ];

  // Logo component
  const Logo = () => (
    <Link 
      to="/" 
      className="text-2xl font-medium flex items-center space-x-2 text-primary transition-opacity duration-300 hover:opacity-90"
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
        <path d="M13 7h-2v6h2zm2 3h-6v2h6z"/>
      </svg>
      <span>Budgetify</span>
    </Link>
  );

  // Profile menu for desktop
  const ProfileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/activity" className="flex items-center cursor-pointer">
            <Activity className="mr-2 h-4 w-4" />
            <span>Activity Log</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
        isScrolled 
          ? "py-3 backdrop-blur-lg bg-white/80 dark:bg-black/50 shadow-sm" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-6 mr-8">
                  {authenticatedNavItems.map((item) => (
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
                <div className="flex items-center space-x-4">
                  <ProfileMenu />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  {authenticatedNavItems.map((item) => (
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
                    onClick={logout}
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
        )}
      </div>
    </header>
  );
};

export default Navbar;
