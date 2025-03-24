import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ActivityTypes, logActivity } from "@/services/activityService";

// Define user types
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  totalIncome: number;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserIncome: (income: number) => Promise<void>;
  updateProfile: (data: {name: string, totalIncome: number}) => Promise<void>;
  session: Session | null;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
  updateUserIncome: async () => {},
  updateProfile: async () => {},
  session: null,
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    console.log("Auth provider initializing...");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("User profile fetched:", data);
        setUserProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          totalIncome: Number(data.total_income) || 0,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      setSession(data.session);
      
      // Log login activity
      if (data.user) {
        logActivity(data.user.id, ActivityTypes.LOGIN, "User logged in");
      }
      
      return !!data.user;
    } catch (error) {
      console.error("Error logging in:", error);
      return false;
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return false;
      }
      
      toast.success("Account created successfully!");
      navigate("/dashboard");
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "An error occurred during signup");
      setLoading(false);
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (data: {name: string, totalIncome: number}) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          name: data.name,
          total_income: data.totalIncome,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error("Failed to update profile: " + error.message);
        return;
      }
      
      // Log activity
      await logActivity(user.id, ActivityTypes.PROFILE_UPDATE, "Updated profile");
      
      // Update local state
      setUserProfile(prev => prev ? { 
        ...prev, 
        name: data.name,
        totalIncome: data.totalIncome 
      } : null);
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile: " + error.message);
    }
  };

  // Update user income
  const updateUserIncome = async (income: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          total_income: income,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error("Failed to update income: " + error.message);
        return;
      }
      
      // Log activity
      await logActivity(user.id, ActivityTypes.PROFILE_UPDATE, "Updated income to " + income);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, totalIncome: income } : null);
      toast.success("Income updated successfully!");
    } catch (error: any) {
      console.error("Error updating income:", error);
      toast.error("Failed to update income: " + error.message);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Log logout activity before actually logging out
      if (user) {
        await logActivity(user.id, ActivityTypes.LOGOUT, "User logged out");
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserProfile(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  // Add signOut as an alias for logout for consistency
  const signOut = logout;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        signup,
        logout,
        signOut,
        isAuthenticated: !!user,
        updateUserIncome,
        updateProfile,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
