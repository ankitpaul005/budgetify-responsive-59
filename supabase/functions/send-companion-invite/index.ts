
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { groupId, email } = await req.json();
    
    if (!groupId || !email) {
      throw new Error('groupId and email are required');
    }
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, check if the group exists
    const { data: group, error: groupError } = await supabase
      .from('companion_groups')
      .select('id, name, owner_id, users!companion_groups_owner_id_fkey(email)')
      .eq('id', groupId)
      .single();
    
    if (groupError || !group) {
      throw new Error(`Group not found: ${groupError?.message || 'Unknown error'}`);
    }
    
    // Check if the user exists or create a placeholder
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    let userId = existingUser?.id;
    
    if (!userId) {
      // Note: In a real implementation, we'd handle this differently
      // This is just a placeholder for demo purposes
      const { data: newUser, error: userError } = await supabase
        .from('user_profiles')
        .insert([{
          email,
          display_name: email.split('@')[0],
        }])
        .select('id')
        .single();
      
      if (userError || !newUser) {
        throw new Error(`Failed to create user placeholder: ${userError?.message || 'Unknown error'}`);
      }
      
      userId = newUser.id;
    }
    
    // Create the invitation/companion relationship
    const { error: relationError } = await supabase
      .from('companion_group_members')
      .insert([{
        group_id: groupId,
        user_id: userId,
        status: 'pending'
      }]);
    
    if (relationError) {
      throw new Error(`Failed to create companion relationship: ${relationError.message}`);
    }
    
    // Send the invitation email
    // In a real implementation, we would configure an email service
    // For now, we'll just simulate success
    console.log(`Would send invitation email to: ${email} for group: ${group.name}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Invitation sent to ${email}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-companion-invite function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
