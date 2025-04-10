
import { supabase } from "@/integrations/supabase/client";
import { getTable } from "@/integrations/supabase/client-helpers";
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

    // Check if the user is already a member
    // Using any to bypass excessive type instantiation
    const budgetDiaryMembersTable = getTable('budget_diary_members');
    
    // Using type assertion to bypass type checking
    const { data: existingMember, error: memberCheckError } = await budgetDiaryMembersTable
      .select('id')
      .eq('budget_id', budgetId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberCheckError) throw memberCheckError;

    if (existingMember) {
      // Update existing member's access level
      const { error: updateError } = await budgetDiaryMembersTable
        .update({ access_level: accessLevel })
        .eq('id', existingMember.id);

      if (updateError) throw updateError;
      
      toast.success(`Updated access level for ${email}`);
      return true;
    }

    // Add new member
    const { error: insertError } = await budgetDiaryMembersTable
      .insert({
        budget_id: budgetId,
        user_id: user.id,
        access_level: accessLevel
      });

    if (insertError) throw insertError;

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
    const budgetDiaryMembersTable = getTable('budget_diary_members');
    
    const { error } = await budgetDiaryMembersTable
      .delete()
      .eq('budget_id', budgetId)
      .eq('user_id', userId);

    if (error) throw error;
    
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
    const budgetDiaryMembersTable = getTable('budget_diary_members');
    
    const { data, error } = await budgetDiaryMembersTable
      .select('*')
      .eq('budget_id', budgetId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Get user details for each member
    const membersWithDetails = await Promise.all(
      data.map(async (member: any) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', member.user_id)
          .single();

        if (userError) {
          console.error("Error fetching user details:", userError);
          return member;
        }

        return {
          ...member,
          user_name: userData.name,
          user_email: userData.email
        };
      })
    );

    // Cast to the correct type
    return membersWithDetails as BudgetDiaryMember[];
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

    // If user is the owner of the budget sheet
    if (budget && budget.user_id === userId) {
      return 'owner';
    }

    // Check if the user is a member
    const budgetDiaryMembersTable = getTable('budget_diary_members');
    
    const { data: membership, error: membershipError } = await budgetDiaryMembersTable
      .select('access_level')
      .eq('budget_id', budgetId)
      .eq('user_id', userId)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (membership) {
      // Need to use type assertion since we're bypassing type checking
      return (membership as any).access_level as BudgetAccessLevel;
    }

    return null;
  } catch (error) {
    console.error("Error checking budget diary access:", error);
    return null;
  }
};
