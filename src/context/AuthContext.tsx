
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

export interface UserProfile extends Tables<"users"> {
  currency?: string;
  phone_number?: string;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(`Auth event: ${event}`);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      console.log("Fetched user profile:", data);
      
      setUserProfile({
        ...data,
        currency: "INR"
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

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

      if (data.user?.id) {
        await createUserProfile(data.user.id, email, name);
      }

      toast.success("Signup successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const updateUserProfile = async (displayName: string, phoneNumber: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your profile");
        return;
      }
  
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: displayName }
      });

      if (authError) throw authError;
  
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

  const updateUserIncome = async (income: number) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your income");
        return;
      }

      // Input validation to ensure we're getting a proper number
      if (isNaN(income) || income < 0 || income > 10000000) {
        toast.error("Invalid income amount. Please enter a valid number.");
        return;
      }

      console.log("Updating income to:", income);

      // Store the exact input value without any currency conversion
      const { error } = await supabase
        .from("users")
        .update({ total_income: income })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state with exactly the same value
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

  const updateUserPhoneNumber = async (phoneNumber: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your phone number");
        return;
      }

      setUserProfile((prevProfile) => ({
        ...prevProfile,
        phone_number: phoneNumber
      }));

      toast.success("Phone number updated successfully");
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast.error("Failed to update phone number");
      throw error;
    }
  };

  const resetUserData = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to reset your data");
        return;
      }

      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id);

      if (transactionError) throw transactionError;

      const { error: incomeError } = await supabase
        .from("users")
        .update({ total_income: 0 })
        .eq("id", user.id);
        
      if (incomeError) throw incomeError;
      
      setUserProfile(prev => prev ? {...prev, total_income: 0} : null);

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

      const { error: authError } = await supabase.auth.updateUser({
        data: { name: data.name }
      });

      if (authError) throw authError;

      const updateData: any = { name: data.name };
      
      if (data.total_income !== undefined) {
        updateData.total_income = data.total_income;
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
