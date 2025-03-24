
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ActivityTypes = {
  LOGIN: "Login",
  LOGOUT: "Logout",
  TRANSACTION: "Transaction",
  INVESTMENT: "Investment",
  PROFILE_UPDATE: "Profile Update",
  SETTINGS_CHANGE: "Settings Change",
  AI_INTERACTION: "AI Interaction",
};

export const logActivity = async (
  userId: string | undefined,
  activityType: string,
  description: string
) => {
  if (!userId) {
    console.warn("Cannot log activity: User ID is undefined");
    return;
  }

  try {
    const { error } = await supabase.from("activities").insert({
      user_id: userId,
      activity_type: activityType,
      description,
    });

    if (error) {
      console.error("Error logging activity:", error);
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getRecentActivities = async (userId: string, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch recent activities:", error);
    toast.error("Failed to load recent activities");
    return [];
  }
};
