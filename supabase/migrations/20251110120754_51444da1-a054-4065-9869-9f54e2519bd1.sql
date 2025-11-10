-- Add scheduled_send_at column to shared_files table
ALTER TABLE public.shared_files 
ADD COLUMN scheduled_send_at timestamp with time zone,
ADD COLUMN notification_sent boolean DEFAULT false;

-- Create index for scheduled notifications
CREATE INDEX idx_shared_files_scheduled ON public.shared_files(scheduled_send_at, notification_sent) 
WHERE scheduled_send_at IS NOT NULL AND notification_sent = false;