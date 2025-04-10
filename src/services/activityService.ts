
import { supabase } from "@/integrations/supabase/client";

// Activity types enum
export enum ActivityTypes {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  TRANSACTION = "TRANSACTION",
  BUDGET = "BUDGET",
  INVESTMENT = "INVESTMENT",
  PROFILE = "PROFILE",
  NEWS = "NEWS",
  EXPORT = "EXPORT", // Ensure EXPORT is defined
  PROFILE_UPDATE = "PROFILE_UPDATE" // Add PROFILE_UPDATE type
}

// Activity item interface
export interface ActivityItem {
  id: string;
  user_id: string;
  type: ActivityTypes;
  description: string;
  created_at: string;
  activity_type: string; // Added to match how it's used in ActivityLog
}

// Log activity function
export const logActivity = async (
  userId: string,
  type: ActivityTypes,
  description: string,
  metadata?: any
) => {
  try {
    const { data, error } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        activity_type: type,
        description
      })
      .select();

    if (error) {
      console.error("Error logging activity:", error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
};

// Get user activities
export const getUserActivities = async (
  userId: string,
  limit = 50,
  offset = 0,
  type?: ActivityTypes
) => {
  try {
    let query = supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Add type filter if specified
    if (type) {
      query = query.eq("activity_type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching activities:", error);
      return [];
    }

    return data as ActivityItem[];
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }
};

// Function used in ActivityLog component 
export const getRecentActivities = async (userId: string, limit = 100) => {
  return getUserActivities(userId, limit);
};
