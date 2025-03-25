
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";
import { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActivityTypes, logActivity } from "@/services/activityService";

// Define types for the user profile
interface UserProfile {
  id: string;
  name?: string;
  totalIncome?: number;
  currency?: string;
  phone_number?: string;
}

// Auth context type definition
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  supabase: SupabaseClient;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserIncome: (income: number) => Promise<void>;
  updateUserPhoneNumber: (phoneNumber: string) => Promise<void>;
  resetUserData: () => Promise<void>;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userProfile: null,
  session: null,
  supabase,
  login: async () => {},
  logout: async () => {},
  signOut: async () => {},
  signup: async () => {},
  loading: true,
  updateProfile: async () => {},
  updateUserIncome: async () => {},
  updateUserPhoneNumber: async () => {},
  resetUserData: async () => {},
});

// Create the auth provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize Supabase auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: currentSession } = await supabase.auth.getSession();
        setSession(currentSession.session);
        setUser(currentSession.session?.user || null);

        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, updatedSession) => {
            setSession(updatedSession);
            setUser(updatedSession?.user || null);
          }
        );

        setLoading(false);

        return () => {
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch user profile whenever user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }

          setUserProfile(data as UserProfile);
        } catch (error) {
          console.error("Error in profile fetch:", error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data?.user) {
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Error signing out");
        throw error;
      }
      
      // Clear user state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // SignOut alias for logout (to maintain compatibility)
  const signOut = async () => {
    return logout();
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      // If user is created successfully, add their profile data
      if (data?.user) {
        const { error: profileError } = await supabase
          .from("users")
          .insert([
            { 
              id: data.user.id,
              email,
              name,
              total_income: 0
            }
          ]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          // We should log this but not block signup
        }
      }

      toast.success("Account created successfully! Please check your email for verification.");
      return navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update(profile)
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to update profile");
        throw error;
      }

      // Update the local state
      setUserProfile(prev => prev ? { ...prev, ...profile } : null);
      
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Update user income
  const updateUserIncome = async (income: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ total_income: income })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to update income");
        throw error;
      }

      // Log activity
      await logActivity(
        user.id,
        ActivityTypes.PROFILE,
        `Updated monthly income to ${income}`
      );

      // Update local state
      setUserProfile(prev => 
        prev ? { ...prev, totalIncome: income } : null
      );
      
      return;
    } catch (error) {
      console.error("Income update error:", error);
      throw error;
    }
  };

  // Update user phone number
  const updateUserPhoneNumber = async (phoneNumber: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ phone_number: phoneNumber })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to update phone number");
        throw error;
      }

      // Log activity
      await logActivity(
        user.id,
        ActivityTypes.PROFILE,
        `Updated phone number`
      );

      // Update local state
      setUserProfile(prev => 
        prev ? { ...prev, phone_number: phoneNumber } : null
      );
      
      toast.success("Phone number updated successfully");
    } catch (error) {
      console.error("Phone update error:", error);
      throw error;
    }
  };

  // Reset user data
  const resetUserData = async () => {
    if (!user) return;

    try {
      // Delete all transactions
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id);

      if (transactionError) {
        console.error("Error deleting transactions:", transactionError);
        throw transactionError;
      }

      // Log activity
      await logActivity(
        user.id,
        ActivityTypes.PROFILE,
        "Reset all financial data"
      );

      toast.success("Financial data has been reset successfully");
    } catch (error) {
      console.error("Reset data error:", error);
      toast.error("Failed to reset data");
      throw error;
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    userProfile,
    session,
    supabase,
    login,
    logout,
    signOut,
    signup,
    loading,
    updateProfile,
    updateUserIncome,
    updateUserPhoneNumber,
    resetUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
