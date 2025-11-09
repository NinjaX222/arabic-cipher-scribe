-- Create table for secure file sharing
CREATE TABLE IF NOT EXISTS public.shared_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  encrypted_data text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  password_hash text,
  expires_at timestamp with time zone NOT NULL,
  max_downloads integer DEFAULT NULL,
  download_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  last_accessed_at timestamp with time zone,
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own shares
CREATE POLICY "Users can create their own shares"
ON public.shared_files
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own shares
CREATE POLICY "Users can view their own shares"
ON public.shared_files
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own shares
CREATE POLICY "Users can update their own shares"
ON public.shared_files
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can delete their own shares
CREATE POLICY "Users can delete their own shares"
ON public.shared_files
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Anyone can view active, non-expired shares (for download)
CREATE POLICY "Anyone can view active shares"
ON public.shared_files
FOR SELECT
TO anon, authenticated
USING (
  is_active = true 
  AND expires_at > now() 
  AND (max_downloads IS NULL OR download_count < max_downloads)
);

-- Create index for faster token lookups
CREATE INDEX idx_shared_files_token ON public.shared_files(share_token);
CREATE INDEX idx_shared_files_expires_at ON public.shared_files(expires_at);
CREATE INDEX idx_shared_files_user_id ON public.shared_files(user_id);