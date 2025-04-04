import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback
} from "react";
import {
  User,
  Session,
  AuthError
} from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, AlertTriangle, Loader, LogIn, UserPlus, LogOut, RefreshCw } from "lucide-react";

// Update UserProfile interface to include phone_number
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  total_income: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  currency?: string;
  phone_number?: string | null; // Make it explicitly nullable
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserIncome: (income: number) => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  updateUserPhoneNumber: (phoneNumber: string) => Promise<void>;
  resetUserData: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User profile doesn't exist, create one
          return null;
        }
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        
        // Defer profile fetching to avoid Supabase auth deadlock
        if (currentSession?.user) {
          setTimeout(async () => {
            const profile = await fetchUserProfile(currentSession.user.id);
            setUserProfile(profile);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id).then(profile => {
          setUserProfile(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);
        
        toast.success("Logged in successfully", {
          description: `Welcome back, ${profile?.name || email}!`,
          icon: <Check className="h-5 w-5 text-green-500" />
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Invalid email or password";
      
      if (error instanceof AuthError) {
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in";
        }
      }
      
      toast.error("Login failed", {
        description: errorMessage,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Create a user profile
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            email,
            name
          }
        ]);

        if (profileError) {
          throw profileError;
        }

        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      let errorMessage = "Failed to create account";
      if (error instanceof AuthError) {
        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered";
        }
      }
      
      toast.error("Signup failed", {
        description: errorMessage,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAuthenticated(false);

      toast.success("Logged out successfully", {
        icon: <LogOut className="h-5 w-5 text-green-500" />
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
    }
  };
  
  // Alias for logout to maintain compatibility with Settings.tsx
  const signOut = logout;

  // Update profile method to handle phone_number
  const updateProfile = async (userData: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...userData
        });
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  // Update user name
  const updateUserName = async (name: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          name
        });
      }
    } catch (error) {
      console.error("Error updating user name:", error);
      throw error;
    }
  };

  // Update user income
  const updateUserIncome = async (income: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ total_income: income })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          total_income: income
        });
      }
    } catch (error) {
      console.error("Error updating user income:", error);
      throw error;
    }
  };

  // Update user phone number
  const updateUserPhoneNumber = async (phoneNumber: string) => {
    await updateProfile({ phone_number: phoneNumber });
  };

  // Reset user data
  const resetUserData = async () => {
    if (!user) return;

    try {
      // Delete all user transactions
      let { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (transactionError) throw transactionError;

      // Delete all user activities
      let { error: activityError } = await supabase
        .from('activities')
        .delete()
        .eq('user_id', user.id);

      if (activityError) throw activityError;
    } catch (error) {
      console.error("Error resetting user data:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userProfile,
        session,
        login,
        signup,
        logout,
        updateUserIncome,
        updateUserName,
        updateUserPhoneNumber,
        resetUserData,
        updateProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
