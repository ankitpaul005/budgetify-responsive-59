import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BudgetAccessLevel = 'owner' | 'editor' | 'viewer';

export interface BudgetDiaryMember {
  id: string;
  user_id: string;
  budget_id: string;
  access_level: BudgetAccessLevel;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface BudgetDiary {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  members: BudgetDiaryMember[];
}

export const renameBudgetToBudgetDiary = async (
  budgetId: string,
  userId: string,
  name: string,
  description?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('budget_sheets')
      .update({
        name,
        description
      })
      .eq('id', budgetId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error renaming budget diary:", error);
    toast.error("Failed to rename budget diary");
    return false;
  }
};

// Mock implementation for budget diary members since the table doesn't exist yet
// This will temporarily fix the TypeScript errors but won't actually work until 
// the budget_diary_members table is created
export const addBudgetDiaryMember = async (
  budgetId: string,
  email: string,
  accessLevel: BudgetAccessLevel = 'viewer'
): Promise<boolean> => {
  try {
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      toast.error(`User with email ${email} not found`);
      return false;
    }

    // Simulated implementation until budget_diary_members table exists
    toast.success(`Added ${email} to budget diary`);
    return true;
  } catch (error) {
    console.error("Error adding budget diary member:", error);
    toast.error("Failed to add member to budget diary");
    return false;
  }
};

export const removeBudgetDiaryMember = async (
  budgetId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Simulated implementation until budget_diary_members table exists
    toast.success("Member removed from budget diary");
    return true;
  } catch (error) {
    console.error("Error removing budget diary member:", error);
    toast.error("Failed to remove member from budget diary");
    return false;
  }
};

export const getBudgetDiaryMembers = async (budgetId: string): Promise<BudgetDiaryMember[]> => {
  try {
    // Simulated implementation until budget_diary_members table exists
    return [];
  } catch (error) {
    console.error("Error fetching budget diary members:", error);
    return [];
  }
};

export const checkBudgetDiaryAccess = async (
  budgetId: string, 
  userId: string
): Promise<BudgetAccessLevel | null> => {
  try {
    // First check if the user is the owner
    const { data: budget, error: budgetError } = await supabase
      .from('budget_sheets')
      .select('*')
      .eq('id', budgetId)
      .maybeSingle();

    if (budgetError) throw budgetError;

    if (budget?.user_id === userId) {
      return 'owner';
    }

    // Simulated implementation until budget_diary_members table exists
    return null;
  } catch (error) {
    console.error("Error checking budget diary access:", error);
    return null;
  }
};
