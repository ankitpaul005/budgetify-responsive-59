
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

export const addBudgetDiaryMember = async (
  budgetId: string,
  email: string,
  accessLevel: BudgetAccessLevel = 'viewer'
): Promise<boolean> => {
  try {
    // First check if the user exists
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

    // Check if they're already a member
    const { data: existingMember, error: memberError } = await supabase
      .from('budget_diary_members')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError) throw memberError;

    if (existingMember) {
      // Update their access level if they're already a member
      const { error: updateError } = await supabase
        .from('budget_diary_members')
        .update({ access_level: accessLevel })
        .eq('id', existingMember.id);

      if (updateError) throw updateError;
      toast.success(`Updated access for ${email}`);
    } else {
      // Add them as a new member
      const { error: insertError } = await supabase
        .from('budget_diary_members')
        .insert({
          budget_id: budgetId,
          user_id: user.id,
          access_level: accessLevel
        });

      if (insertError) throw insertError;
      toast.success(`Added ${email} to budget diary`);
    }

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
    const { error } = await supabase
      .from('budget_diary_members')
      .delete()
      .eq('budget_id', budgetId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing budget diary member:", error);
    toast.error("Failed to remove member from budget diary");
    return false;
  }
};

export const getBudgetDiaryMembers = async (budgetId: string): Promise<BudgetDiaryMember[]> => {
  try {
    const { data: members, error: membersError } = await supabase
      .from('budget_diary_members')
      .select('*')
      .eq('budget_id', budgetId);

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return [];
    }

    // Get user details
    const userIds = members.map(member => member.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds);

    if (usersError) {
      console.error("Error fetching user details:", usersError);
      return members;
    }

    // Add user details to members
    return members.map(member => {
      const user = users?.find(u => u.id === member.user_id);
      return {
        ...member,
        user_name: user?.name || 'Unknown User',
        user_email: user?.email || ''
      };
    });
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

    // Check if they're a member with specific access
    const { data: member, error: memberError } = await supabase
      .from('budget_diary_members')
      .select('access_level')
      .eq('budget_id', budgetId)
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError) throw memberError;

    return member?.access_level || null;
  } catch (error) {
    console.error("Error checking budget diary access:", error);
    return null;
  }
};
