
import React from "react";
import { Link } from "react-router-dom";

const NavLogo: React.FC = () => (
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

export default NavLogo;
