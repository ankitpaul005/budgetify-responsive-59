
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
    // Since the companion_groups table doesn't exist in the current database schema,
    // we'll use mock data for now
    console.log("Using mock data for companion groups as the table doesn't exist yet");
    
    // Return mock data
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
  } catch (error) {
    console.error("Failed to fetch companion groups:", error);
    
    // Return mock data as fallback
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
    // Since we can't create a real group in the database yet, return a mock response
    console.log("Creating mock companion group as the table doesn't exist yet");
    
    // Return mock data
    return {
      id: crypto.randomUUID(),
      name,
      description,
      owner_id: userId,
      created_at: new Date().toISOString(),
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
    // Log the invitation attempt
    console.log(`Mock invitation sent to ${email} for group ${groupId}`);
    
    // Simulate a successful invitation
    return true;
  } catch (error) {
    console.error("Failed to send companion invitation:", error);
    return false;
  }
};
