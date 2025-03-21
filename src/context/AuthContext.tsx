
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Define user types
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalIncome?: number;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserIncome: (income: number) => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isAuthenticated: false,
  updateUserIncome: () => {},
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("budgetify-user");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("budgetify-user");
      }
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const usersList = JSON.parse(localStorage.getItem("budgetify-users") || "[]");
      const foundUser = usersList.find(
        (u: any) => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        toast.error("Invalid email or password");
        setLoading(false);
        return false;
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword);
      localStorage.setItem("budgetify-user", JSON.stringify(userWithoutPassword));
      
      toast.success("Login successful!");
      navigate("/dashboard");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const usersList = JSON.parse(localStorage.getItem("budgetify-users") || "[]");
      
      if (usersList.some((u: any) => u.email === email)) {
        toast.error("User with this email already exists");
        setLoading(false);
        return false;
      }
      
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        totalIncome: 50000, // Default income in INR
        createdAt: new Date().toISOString(),
      };
      
      usersList.push(newUser);
      localStorage.setItem("budgetify-users", JSON.stringify(usersList));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem("budgetify-user", JSON.stringify(userWithoutPassword));
      
      toast.success("Account created successfully!");
      navigate("/dashboard");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user income
  const updateUserIncome = (income: number) => {
    if (!user) return;

    try {
      // Update user in state
      const updatedUser = { ...user, totalIncome: income };
      setUser(updatedUser);
      
      // Update in local storage
      localStorage.setItem("budgetify-user", JSON.stringify(updatedUser));
      
      // Update in users list
      const usersList = JSON.parse(localStorage.getItem("budgetify-users") || "[]");
      const updatedUsersList = usersList.map((u: any) => 
        u.id === user.id ? { ...u, totalIncome: income } : u
      );
      localStorage.setItem("budgetify-users", JSON.stringify(updatedUsersList));
      
      toast.success("Income updated successfully!");
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error("Failed to update income");
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("budgetify-user");
    toast.info("You have been logged out");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        updateUserIncome,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
