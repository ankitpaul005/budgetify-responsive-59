
import { supabase } from "./client";

/**
 * Helper function to access tables without TypeScript errors.
 * This is useful for accessing tables that exist in the database but 
 * aren't properly typed in the generated types file.
 * 
 * @param tableName The name of the table to access
 * @returns A PostgrestQueryBuilder instance for the specified table
 */
export const getTable = (tableName: string) => {
  // Using type assertion to bypass TypeScript's type checking
  // This is necessary for tables that exist in the database but aren't in the generated types
  return supabase.from(tableName as any);
};

/**
 * Helper function to execute raw SQL queries when needed.
 * Use with caution, as this bypasses row-level security.
 */
export const executeRawQuery = async (query: string, params?: any[]) => {
  try {
    // @ts-ignore - Using RPC requires bypassing type checking
    const { data, error } = await supabase.rpc('execute_sql', { 
      query_text: query,
      params: params || []
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error executing raw query:", error);
    return { data: null, error };
  }
};
