-- Drop the insecure policy that exposes files to anyone
DROP POLICY IF EXISTS "Anyone can view active shares" ON public.shared_files;

-- Create a secure policy that only allows viewing with share_token via RPC
-- The application will use a secure function to fetch shared files by token
CREATE OR REPLACE FUNCTION public.get_shared_file_by_token(p_share_token text)
RETURNS TABLE (
  id uuid,
  file_name text,
  file_type text,
  file_size integer,
  encrypted_data text,
  password_hash text,
  expires_at timestamptz,
  max_downloads integer,
  download_count integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sf.id,
    sf.file_name,
    sf.file_type,
    sf.file_size,
    sf.encrypted_data,
    sf.password_hash,
    sf.expires_at,
    sf.max_downloads,
    sf.download_count,
    sf.is_active
  FROM public.shared_files sf
  WHERE sf.share_token = p_share_token
    AND sf.is_active = true
    AND sf.expires_at > now()
    AND (sf.max_downloads IS NULL OR sf.download_count < sf.max_downloads);
END;
$$;

-- Create a function to increment download count securely
CREATE OR REPLACE FUNCTION public.increment_download_count(p_share_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated boolean := false;
BEGIN
  UPDATE public.shared_files
  SET 
    download_count = COALESCE(download_count, 0) + 1,
    last_accessed_at = now()
  WHERE share_token = p_share_token
    AND is_active = true
    AND expires_at > now()
    AND (max_downloads IS NULL OR download_count < max_downloads);
  
  v_updated := FOUND;
  RETURN v_updated;
END;
$$;