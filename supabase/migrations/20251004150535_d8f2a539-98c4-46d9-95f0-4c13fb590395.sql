-- Create app_settings table for storing application configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Anyone can view settings"
  ON public.app_settings
  FOR SELECT
  USING (true);

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON public.app_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.app_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
  ON public.app_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings
INSERT INTO public.app_settings (key, value) VALUES
  ('app_name', '{"ar": "سايفر", "en": "Cipher"}'),
  ('app_tagline', '{"ar": "حماية بياناتك بأمان تام", "en": "Protect your data with complete security"}'),
  ('primary_color', '"221.2 83.2% 53.3%"'),
  ('secondary_color', '"217.2 91.2% 59.8%"'),
  ('accent_color', '"210 40% 96.1%"')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for app assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for app-assets
CREATE POLICY "Public can view app assets"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'app-assets');

CREATE POLICY "Admins can upload app assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'app-assets' 
    AND (SELECT has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Admins can update app assets"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'app-assets' 
    AND (SELECT has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Admins can delete app assets"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'app-assets' 
    AND (SELECT has_role(auth.uid(), 'admin'::app_role))
  );