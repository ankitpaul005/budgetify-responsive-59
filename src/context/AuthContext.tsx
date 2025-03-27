import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Session,
  User as SupabaseUser,
  AuthChangeEvent,
} from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

// Define the types for user profile and auth context
export interface UserProfile extends Tables<"users"> {
  currency?: string; // Add currency property
  phone_number?: string; // Add phone_number property
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, phoneNumber: string) => Promise<void>;
  updateUserIncome: (income: number) => Promise<void>;
  updateUserPhoneNumber: (phoneNumber: string) => Promise<void>;
  resetUserData: () => Promise<void>;
  updateProfile: (data: {
    name: string;
    total_income?: number;
    currency?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(`Auth event: ${event}`);
        
        // Only synchronous state updates here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        // Clear session if not on login or signup page to prevent auto-login
        const currentPath = window.location.pathname;
        if (session && !currentPath.includes("/login") && !currentPath.includes("/signup") && currentPath === "/") {
          await supabase.auth.signOut({ scope: "local" });
          setSession(null);
          setUser(null);
          setUserProfile(null);
          console.log("Session cleared on landing page");
        } else if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUserProfile({
        ...data,
        currency: "INR" // Default currency
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Sign up function
  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // Create user profile in the database
      if (data.user?.id) {
        await createUserProfile(data.user.id, email, name);
      }

      toast.success("Signup successful! Please check your email to verify.");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create user profile in the database
  const createUserProfile = async (
    userId: string,
    email: string,
    name: string
  ) => {
    try {
      const { error } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          name,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error creating user profile:", error);
      toast.error("Failed to create user profile.");
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserProfile(null);
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile function (alias for updateProfile)
  const updateUserProfile = async (displayName: string, phoneNumber: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your profile");
        return;
      }
  
      // Update auth metadata first
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: displayName }
      });
  
      if (authError) throw authError;
  
      // Then update the public profile
      const { error } = await supabase.from("users").update({ 
        name: displayName
      }).eq("id", user.id);
  
      if (error) throw error;
  
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        name: displayName
      }));
  
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  // Update user income function
  const updateUserIncome = async (income: number) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your income");
        return;
      }

      // Update the public profile
      const { error } = await supabase
        .from("users")
        .update({ total_income: income })
        .eq("id", user.id);

      if (error) throw error;

      setUserProfile((prevProfile) => ({
        ...prevProfile,
        total_income: income
      }));

      toast.success("Income updated successfully");
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error("Failed to update income");
      throw error;
    }
  };

  // Update user phone number (this would be stored in auth metadata in a real app)
  const updateUserPhoneNumber = async (phoneNumber: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your phone number");
        return;
      }

      // In a real app, we would update the phone number in the database
      // Here we'll just update it in the local state
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        phone_number: phoneNumber // This is just for UI display, not stored in DB
      }));

      toast.success("Phone number updated successfully");
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast.error("Failed to update phone number");
      throw error;
    }
  };

  // Reset user data function with enhanced reset capabilities
  const resetUserData = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to reset your data");
        return;
      }

      // Delete user transactions
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id);

      if (transactionError) throw transactionError;

      // Reset user income to 0
      const { error: incomeError } = await supabase
        .from("users")
        .update({ total_income: 0 })
        .eq("id", user.id);
        
      if (incomeError) throw incomeError;
      
      // Update local profile state
      setUserProfile(prev => prev ? {...prev, total_income: 0} : null);

      // Clear local storage data
      localStorage.removeItem(`budgetify-investments-${user.id}`);
      localStorage.removeItem(`budgetify-categories-${user.id}`);
      localStorage.removeItem(`budgetify-budget-${user.id}`);

      toast.success("Data reset successfully");
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset data");
      throw error;
    }
  };

  // Update full profile function
  const updateProfile = async (data: {
    name: string;
    total_income?: number;
    currency?: string;
  }) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      // Update auth metadata first
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: data.name }
      });

      if (authError) throw authError;

      // Prepare update data
      const updateData: any = { name: data.name };
      
      // Add total_income if provided
      if (data.total_income !== undefined) {
        updateData.total_income = data.total_income;
      }

      // Then update the public profile
      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      // Update local user profile
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        name: data.name,
        ...(data.total_income !== undefined && { total_income: data.total_income }),
        ...(data.currency !== undefined && { currency: data.currency })
      }));

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  // Sign out (alias for logout)
  const signOut = logout;

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    updateUserProfile,
    updateUserIncome,
    updateUserPhoneNumber,
    resetUserData,
    updateProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
