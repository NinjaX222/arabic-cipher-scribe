-- Create password_vault table for secure password storage
CREATE TABLE public.password_vault (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  site_name TEXT NOT NULL,
  site_url TEXT,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_vault ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own passwords"
ON public.password_vault FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passwords"
ON public.password_vault FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords"
ON public.password_vault FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords"
ON public.password_vault FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_password_vault_updated_at
BEFORE UPDATE ON public.password_vault
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create security_reports table for monthly reports
CREATE TABLE public.security_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_month DATE NOT NULL,
  total_logins INTEGER DEFAULT 0,
  total_encryptions INTEGER DEFAULT 0,
  total_decryptions INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  new_devices INTEGER DEFAULT 0,
  security_score INTEGER DEFAULT 0,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_month)
);

-- Enable RLS
ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports"
ON public.security_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
ON public.security_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);