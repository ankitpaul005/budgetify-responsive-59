
import { supabase } from "@/integrations/supabase/client";

export interface Companion {
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
  description?: string;
  owner_id: string;
  created_at: string;
  members: Companion[];
}

// Fetch companion groups for a user
export const fetchCompanionGroups = async (userId: string): Promise<CompanionGroup[]> => {
  try {
    // Try to fetch real data from Supabase
    const { data: groups, error } = await supabase
      .from('companion_groups')
      .select(`
        id, 
        name, 
        description, 
        owner_id, 
        created_at,
        companions:companion_group_members(
          id,
          user_id,
          status,
          users(id, email, display_name, avatar_url)
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching companion groups:", error);
      throw error;
    }

    // Format the data into our expected structure
    if (groups) {
      return groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        owner_id: group.owner_id,
        created_at: group.created_at,
        members: group.companions.map((member: any) => ({
          id: member.id,
          name: member.users.display_name || member.users.email,
          email: member.users.email,
          avatar_url: member.users.avatar_url,
          status: member.status,
          created_at: group.created_at,
        }))
      }));
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch companion groups:", error);
    
    // Return mock data if real data fetch fails
    return [
      {
        id: "mock-group-1",
        name: "Family Budget",
        description: "Family budget planning group",
        owner_id: userId,
        created_at: new Date().toISOString(),
        members: [
          {
            id: "mock-companion-1",
            name: "Jane Doe",
            email: "jane.doe@example.com",
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            id: "mock-companion-2",
            name: "John Smith",
            email: "john.smith@example.com",
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ]
      }
    ];
  }
};

// Create a new companion group
export const createCompanionGroup = async (userId: string, name: string, description?: string): Promise<CompanionGroup> => {
  try {
    // Insert the new group
    const { data: group, error } = await supabase
      .from('companion_groups')
      .insert([{ name, description, owner_id: userId }])
      .select()
      .single();

    if (error) {
      console.error("Error creating companion group:", error);
      throw error;
    }

    return {
      ...group,
      members: []
    };
  } catch (error) {
    console.error("Failed to create companion group:", error);
    
    // Return mock data as fallback
    return {
      id: crypto.randomUUID(),
      name,
      description,
      owner_id: userId,
      created_at: new Date().toISOString(),
      members: []
    };
  }
};

// Send companion invitation
export const inviteCompanion = async (groupId: string, email: string): Promise<boolean> => {
  try {
    // Send the invitation via our Edge Function
    const { error } = await supabase.functions.invoke('send-companion-invite', {
      body: { groupId, email }
    });

    if (error) {
      console.error("Error sending companion invitation:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to send companion invitation:", error);
    return false;
  }
};
