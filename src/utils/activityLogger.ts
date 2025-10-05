import { supabase } from "@/integrations/supabase/client";

interface LogActivity {
  actionType: 'encrypt' | 'decrypt' | 'generate';
  resourceType: 'text' | 'file' | 'image' | 'audio' | 'video';
  resourceName?: string;
  status?: 'success' | 'failed';
  details?: Record<string, any>;
}

export const logActivity = async ({
  actionType,
  resourceType,
  resourceName,
  status = 'success',
  details
}: LogActivity) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action_type: actionType,
      resource_type: resourceType,
      resource_name: resourceName,
      status,
      details,
      ip_address: null, // Could be filled from request headers if needed
      user_agent: navigator.userAgent
    });

    // Update statistics
    await updateStatistics(user.id, actionType, resourceType);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const updateStatistics = async (
  userId: string, 
  actionType: string, 
  resourceType: string
) => {
  try {
    // Fetch current statistics
    const { data: stats, error: fetchError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Prepare update data
    const updates: Record<string, any> = {
      last_activity_at: new Date().toISOString()
    };

    // Update counters based on action and resource type
    if (actionType === 'encrypt') {
      updates.total_encryptions = (stats?.total_encryptions || 0) + 1;
    } else if (actionType === 'decrypt') {
      updates.total_decryptions = (stats?.total_decryptions || 0) + 1;
    } else if (actionType === 'generate') {
      updates.total_keys_generated = (stats?.total_keys_generated || 0) + 1;
    }

    // Update resource-specific counters for encrypt operations
    if (actionType === 'encrypt' || actionType === 'decrypt') {
      switch (resourceType) {
        case 'file':
          updates.total_files_encrypted = (stats?.total_files_encrypted || 0) + 1;
          break;
        case 'image':
          updates.total_images_encrypted = (stats?.total_images_encrypted || 0) + 1;
          break;
        case 'audio':
          updates.total_audio_encrypted = (stats?.total_audio_encrypted || 0) + 1;
          break;
        case 'video':
          updates.total_video_encrypted = (stats?.total_video_encrypted || 0) + 1;
          break;
      }
    }

    // Insert or update statistics
    if (!stats) {
      await supabase.from('user_statistics').insert({
        user_id: userId,
        ...updates
      });
    } else {
      await supabase
        .from('user_statistics')
        .update(updates)
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
};