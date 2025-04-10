
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status: 'pending' | 'active' | 'declined';
  created_at: string;
}

export interface CompanionGroup {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  members: GroupMember[];
}

export const fetchCompanionGroups = async (userId: string): Promise<CompanionGroup[]> => {
  if (!userId) return [];

  try {
    // Fetch groups the user owns or is a member of
    const { data: groups, error } = await supabase
      .from('companion_groups')
      .select('*');

    if (error) throw error;

    // Since our database schema is now properly defined in the types file,
    // we need to manually type the responses as the generic types don't match
    const groupsWithMembers: CompanionGroup[] = groups.map(group => {
      // Format structure to match our CompanionGroup interface
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        owner_id: group.owner_id,
        created_at: group.created_at,
        members: [] // We'll populate this below
      };
    });

    // Fetch members for each group
    for (const group of groupsWithMembers) {
      try {
        // Fix the join query to correctly handle the relationship
        const { data: memberships, error: memberError } = await supabase
          .from('companion_group_members')
          .select(`
            id,
            user_id,
            status,
            created_at,
            users (
              id,
              name,
              email
            )
          `)
          .eq('group_id', group.id);

        if (memberError) {
          console.error("Error fetching group members:", memberError);
          continue;
        }

        if (memberships) {
          // Format members data and add to group
          group.members = memberships.map(m => {
            // Check if m.users exists and has data - it should be an array with a single user
            const user = Array.isArray(m.users) && m.users.length > 0 
              ? m.users[0] 
              : (typeof m.users === 'object' && m.users !== null ? m.users : null);
              
            return {
              id: m.user_id,
              name: user?.name || 'Unknown User',
              email: user?.email || '',
              status: m.status as 'pending' | 'active' | 'declined',
              created_at: m.created_at,
            };
          });
        }
      } catch (error) {
        console.error(`Error processing members for group ${group.id}:`, error);
      }
    }

    return groupsWithMembers;
  } catch (error) {
    console.error("Error fetching companion groups:", error);
    return [];
  }
};

export const createCompanionGroup = async (
  userId: string, 
  name: string, 
  description?: string
): Promise<CompanionGroup | null> => {
  try {
    // Create a new group
    const { data: group, error } = await supabase
      .from('companion_groups')
      .insert({
        name,
        description,
        owner_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    // Return the created group with the owner as a member
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      owner_id: group.owner_id,
      created_at: group.created_at,
      members: [{
        id: userId,
        name: 'You (Owner)',
        email: '',
        status: 'active',
        created_at: group.created_at,
      }]
    };
  } catch (error) {
    console.error("Error creating companion group:", error);
    toast.error("Failed to create group");
    return null;
  }
};

export const inviteCompanion = async (
  groupId: string, 
  email: string
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
      // User doesn't exist, send invite via email
      const { error: inviteError } = await supabase.functions.invoke('send-companion-invite', {
        body: { groupId, email }
      });

      if (inviteError) throw inviteError;
      
      // Create a pending membership for this email
      // In a real app, you'd need a more sophisticated approach to handle users who don't exist yet
      return true;
    }

    // For existing users, we'll add them to the group with a pending status
    // We can't directly use the types, so we need to create the object manually
    const memberData = {
      group_id: groupId,
      user_id: user.id,
      status: 'pending'
    };

    // User exists, add them to the group
    const { error: memberError } = await supabase
      .from('companion_group_members')
      .insert(memberData);

    if (memberError) throw memberError;

    // Send notification email
    const { error: notifyError } = await supabase.functions.invoke('send-companion-invite', {
      body: { groupId, email, userId: user.id }
    });

    if (notifyError) throw notifyError;

    return true;
  } catch (error) {
    console.error("Error inviting companion:", error);
    return false;
  }
};

export const acceptGroupInvitation = async (
  groupId: string, 
  userId: string
): Promise<boolean> => {
  try {
    // We need to update the status manually instead of using the types
    const updateData = { status: 'active' };
    
    const { error } = await supabase
      .from('companion_group_members')
      .update(updateData)
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return false;
  }
};

export const declineGroupInvitation = async (
  groupId: string, 
  userId: string
): Promise<boolean> => {
  try {
    // We need to update the status manually instead of using the types
    const updateData = { status: 'declined' };
    
    const { error } = await supabase
      .from('companion_group_members')
      .update(updateData)
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error declining invitation:", error);
    return false;
  }
};

export const leaveGroup = async (
  groupId: string, 
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('companion_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error leaving group:", error);
    return false;
  }
};

export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    // Delete all members first (due to foreign key constraints)
    const { error: membersError } = await supabase
      .from('companion_group_members')
      .delete()
      .eq('group_id', groupId);

    if (membersError) throw membersError;

    // Then delete the group
    const { error } = await supabase
      .from('companion_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting group:", error);
    return false;
  }
};
