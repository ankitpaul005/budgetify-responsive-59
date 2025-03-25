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
export interface UserProfile extends Tables<"users"> {}

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
    const getSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(`Auth event: ${event}`);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
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

      setUserProfile(data);
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
  
      // Then update the public profile without phone_number
      const { error } = await supabase.from("users").update({ 
        name: displayName,
        // Remove phone_number since it doesn't exist in our schema
        // Store phoneNumber in some other way if needed
      }).eq("id", user.id);
  
      if (error) throw error;
  
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        name: displayName,
        // Don't add phone_number to the profile object
      }));
  
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

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
