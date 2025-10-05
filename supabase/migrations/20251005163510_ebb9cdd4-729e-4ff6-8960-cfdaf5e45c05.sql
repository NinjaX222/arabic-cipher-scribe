-- Create activity log table for tracking user operations
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_name TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user statistics table
CREATE TABLE public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_encryptions INTEGER DEFAULT 0,
  total_decryptions INTEGER DEFAULT 0,
  total_files_encrypted INTEGER DEFAULT 0,
  total_images_encrypted INTEGER DEFAULT 0,
  total_audio_encrypted INTEGER DEFAULT 0,
  total_video_encrypted INTEGER DEFAULT 0,
  total_keys_generated INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Users can view their own statistics
CREATE POLICY "Users can view their own statistics"
ON public.user_statistics
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own statistics
CREATE POLICY "Users can update their own statistics"
ON public.user_statistics
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own statistics
CREATE POLICY "Users can insert their own statistics"
ON public.user_statistics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all statistics
CREATE POLICY "Admins can view all statistics"
ON public.user_statistics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create secure backups table for storing encrypted backup data
CREATE TABLE public.secure_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  backup_name TEXT NOT NULL,
  backup_type TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index
CREATE INDEX idx_secure_backups_user_id ON public.secure_backups(user_id);
CREATE INDEX idx_secure_backups_created_at ON public.secure_backups(created_at DESC);

-- Enable RLS
ALTER TABLE public.secure_backups ENABLE ROW LEVEL SECURITY;

-- Users can manage their own backups
CREATE POLICY "Users can view their own backups"
ON public.secure_backups
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backups"
ON public.secure_backups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backups"
ON public.secure_backups
FOR DELETE
USING (auth.uid() = user_id);

-- Create encryption templates table
CREATE TABLE public.encryption_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  settings JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX idx_encryption_templates_user_id ON public.encryption_templates(user_id);

-- Enable RLS
ALTER TABLE public.encryption_templates ENABLE ROW LEVEL SECURITY;

-- Users can manage their own templates
CREATE POLICY "Users can view their own templates"
ON public.encryption_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.encryption_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.encryption_templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.encryption_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update user statistics timestamp
CREATE OR REPLACE FUNCTION public.update_statistics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for statistics
CREATE TRIGGER update_user_statistics_updated_at
BEFORE UPDATE ON public.user_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_statistics_timestamp();

-- Create trigger for templates
CREATE TRIGGER update_encryption_templates_updated_at
BEFORE UPDATE ON public.encryption_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();