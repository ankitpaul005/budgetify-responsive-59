
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SplitExpense {
  id: string;
  title: string;
  description: string | null;
  category: string;
  total_amount: number;
  currency: string;
  date: string;
  creator_id: string;
  created_at: string;
  shares: SplitExpenseShare[];
}

export interface SplitExpenseShare {
  id: string;
  split_expense_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'declined';
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export const createSplitExpense = async (
  userId: string,
  title: string,
  description: string | null,
  category: string,
  totalAmount: number,
  date: string,
  shares: { userId: string; amount: number }[],
  currency: string = 'USD'
): Promise<SplitExpense | null> => {
  try {
    // Create the split expense record
    const { data: expense, error: expenseError } = await supabase
      .from('split_expenses')
      .insert({
        title,
        description,
        category,
        total_amount: totalAmount,
        date,
        creator_id: userId,
        currency
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Create shares for each person
    const sharesData = shares.map(share => ({
      split_expense_id: expense.id,
      user_id: share.userId,
      amount: share.amount,
      status: share.userId === userId ? 'paid' : 'pending'
    }));

    const { data: createdShares, error: sharesError } = await supabase
      .from('split_expense_shares')
      .insert(sharesData)
      .select();

    if (sharesError) throw sharesError;

    // Get user details for each share
    const userIds = shares.map(share => share.userId);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds);

    if (usersError) {
      console.error("Error fetching user details:", usersError);
    }

    // Map user details to shares
    const sharesWithUserDetails = createdShares.map(share => {
      const user = users?.find(u => u.id === share.user_id);
      return {
        ...share,
        user_name: user?.name || 'Unknown User',
        user_email: user?.email || ''
      } as SplitExpenseShare;
    });

    return {
      ...expense,
      shares: sharesWithUserDetails
    };
  } catch (error) {
    console.error("Error creating split expense:", error);
    toast.error("Failed to create split expense");
    return null;
  }
};

export const fetchUserSplitExpenses = async (userId: string): Promise<SplitExpense[]> => {
  try {
    // Get expenses created by user or where user has a share
    const { data: shares, error: sharesError } = await supabase
      .from('split_expense_shares')
      .select('split_expense_id')
      .eq('user_id', userId);

    if (sharesError) throw sharesError;

    // Get all expense IDs for this user (both created by them and shared with them)
    const expenseIds = shares.map(share => share.split_expense_id);

    // Also get expenses created by the user
    const { data: createdExpenses, error: createdError } = await supabase
      .from('split_expenses')
      .select('id')
      .eq('creator_id', userId);

    if (createdError) throw createdError;
    
    // Combine all expense IDs (remove duplicates)
    const allExpenseIds = [...new Set([
      ...expenseIds,
      ...createdExpenses.map(expense => expense.id)
    ])];

    if (allExpenseIds.length === 0) {
      return [];
    }

    // Fetch all expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('split_expenses')
      .select('*')
      .in('id', allExpenseIds);

    if (expensesError) throw expensesError;

    // Fetch all shares for these expenses
    const { data: allShares, error: allSharesError } = await supabase
      .from('split_expense_shares')
      .select('*')
      .in('split_expense_id', allExpenseIds);

    if (allSharesError) throw allSharesError;

    // Fetch all users involved
    const userIds = allShares.map(share => share.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds);

    if (usersError) {
      console.error("Error fetching user details:", usersError);
    }

    // Map shares to each expense
    return expenses.map(expense => {
      const expenseShares = allShares
        .filter(share => share.split_expense_id === expense.id)
        .map(share => {
          const user = users?.find(u => u.id === share.user_id);
          return {
            ...share,
            user_name: user?.name || 'Unknown User',
            user_email: user?.email || ''
          };
        });

      return {
        ...expense,
        shares: expenseShares
      };
    });
  } catch (error) {
    console.error("Error fetching split expenses:", error);
    return [];
  }
};

export const updateExpenseShareStatus = async (
  shareId: string,
  status: 'paid' | 'declined',
  userId: string
): Promise<boolean> => {
  try {
    // First check if this share belongs to the user
    const { data: share, error: shareError } = await supabase
      .from('split_expense_shares')
      .select('*')
      .eq('id', shareId)
      .eq('user_id', userId)
      .single();

    if (shareError || !share) {
      console.error("Error fetching share or unauthorized:", shareError);
      return false;
    }

    // Update the status
    const { error: updateError } = await supabase
      .from('split_expense_shares')
      .update({ status })
      .eq('id', shareId);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error("Error updating expense share status:", error);
    return false;
  }
};

export const deleteSplitExpense = async (expenseId: string, userId: string): Promise<boolean> => {
  try {
    // First check if this expense belongs to the user
    const { data: expense, error: expenseError } = await supabase
      .from('split_expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('creator_id', userId)
      .single();

    if (expenseError || !expense) {
      console.error("Error fetching expense or unauthorized:", expenseError);
      return false;
    }

    // Delete the shares first (because of foreign key constraints)
    const { error: sharesError } = await supabase
      .from('split_expense_shares')
      .delete()
      .eq('split_expense_id', expenseId);

    if (sharesError) throw sharesError;

    // Delete the expense
    const { error: deleteError } = await supabase
      .from('split_expenses')
      .delete()
      .eq('id', expenseId);

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error("Error deleting split expense:", error);
    return false;
  }
};
