
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Check if this was a direct page load (refresh) or navigation
    const isRefresh = window.performance && 
      window.performance.navigation ? 
      (window.performance.navigation.type === 1) : 
      false;

    if (isRefresh && location.pathname !== "/") {
      // If it's a refresh of a valid page, try to reload it
      const validPaths = ["/dashboard", "/analytics", "/investments", "/activity", "/settings", "/login", "/signup"];
      
      if (validPaths.some(path => location.pathname.startsWith(path))) {
        // This is a refresh of a valid route, redirect to the same path
        const redirectUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
        window.location.href = redirectUrl;
      }
    }
  }, [location.pathname]);

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-9xl font-extrabold text-gray-700 dark:text-gray-300 mb-6">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleBackClick} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={handleHomeClick} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
