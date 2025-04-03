
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-6xl font-bold mb-6 text-primary">404</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">Oops! The page you're looking for doesn't exist.</p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page at <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.pathname}</span> was not found.
        </p>
        <Link to="/" className="inline-block bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
