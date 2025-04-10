
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
      .select('*')
      .or(`owner_id.eq.${userId},id.in.(
        select group_id from companion_group_members 
        where user_id = '${userId}' and status = 'active'
      )`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch all members for these groups
    const groupIds = groups.map(group => group.id);
    const membersPromises = groupIds.map(async (groupId) => {
      const { data: memberships, error: memberError } = await supabase
        .from('companion_group_members')
        .select('*, users:user_id(id, name, email)')
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      return { groupId, members: memberships };
    });

    const membersResults = await Promise.all(membersPromises);
    
    // Map the groups with their members
    const groupsWithMembers: CompanionGroup[] = groups.map(group => {
      const groupMembers = membersResults
        .find(m => m.groupId === group.id)?.members || [];
      
      // Format members data
      const formattedMembers: GroupMember[] = groupMembers.map(m => ({
        id: m.user_id,
        name: m.users?.name || 'Unknown User',
        email: m.users?.email || '',
        status: m.status as 'pending' | 'active' | 'declined',
        created_at: m.created_at,
      }));
      
      // Also add the owner as a member if they're not already in the list
      if (!formattedMembers.some(m => m.id === group.owner_id)) {
        // Get owner details from users table
        const ownerPromise = supabase
          .from('users')
          .select('name, email')
          .eq('id', group.owner_id)
          .single();
          
        // We'll handle this asynchronously and update the state later if needed
        ownerPromise.then(({ data: owner }) => {
          if (owner) {
            formattedMembers.push({
              id: group.owner_id,
              name: owner.name || 'Group Owner',
              email: owner.email || '',
              status: 'active',
              created_at: group.created_at,
            });
          }
        });
      }
      
      return {
        ...group,
        members: formattedMembers,
      };
    });

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
    
    return {
      ...group,
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

    // User exists, add them to the group
    const { error: memberError } = await supabase
      .from('companion_group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        status: 'pending'
      });

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
    const { error } = await supabase
      .from('companion_group_members')
      .update({ status: 'active' })
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
    const { error } = await supabase
      .from('companion_group_members')
      .update({ status: 'declined' })
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
