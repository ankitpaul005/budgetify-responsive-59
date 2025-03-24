
import { supabase } from "@/integrations/supabase/client";

export enum ActivityTypes {
  LOGIN = "login",
  SIGNUP = "signup",
  TRANSACTION = "transaction",
  BUDGET = "budget",
  INCOME = "income",
  INVESTMENT = "investment",
  PROFILE = "profile",
  PROFILE_UPDATE = "profile_update", // Added missing type
  LOGOUT = "logout"                   // Added missing type
}

// Define the ActivityItem type for TypeScript
export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  // Add any other properties that might be in your activities table
}

export const logActivity = async (
  userId: string,
  activityType: ActivityTypes,
  description: string
) => {
  try {
    const { error } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        activity_type: activityType,
        description
      });

    if (error) {
      console.error("Error logging activity:", error);
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getRecentActivities = async (userId: string, limit = 10): Promise<ActivityItem[]> => {
  try {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching activities:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }
};
