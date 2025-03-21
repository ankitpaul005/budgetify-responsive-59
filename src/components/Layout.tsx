
import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthContext";
import { initializeUserData } from "@/utils/mockData";

interface LayoutProps {
  children: React.ReactNode;
  withPadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, withPadding = true }) => {
  const { user, isAuthenticated } = useAuth();

  // Initialize user data when a user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeUserData(user.id);
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${withPadding ? 'pt-24 pb-12 px-6' : ''}`}>
        {children}
      </main>
      <footer className="py-8 px-6 text-center text-sm text-muted-foreground bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} Budgetify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
