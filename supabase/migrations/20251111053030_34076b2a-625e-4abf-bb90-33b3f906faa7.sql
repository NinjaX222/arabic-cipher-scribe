-- إضافة حقول التكرار والتذكير لجدول shared_files
ALTER TABLE public.shared_files 
ADD COLUMN IF NOT EXISTS recurrence_type text DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS recurrence_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_send_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sent_at timestamp with time zone;

-- إنشاء فهرس للبحث السريع عن الإرسالات المجدولة
CREATE INDEX IF NOT EXISTS idx_scheduled_files ON public.shared_files(scheduled_send_at) WHERE scheduled_send_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_next_send ON public.shared_files(next_send_at) WHERE next_send_at IS NOT NULL;

-- تعليق على الأعمدة الجديدة
COMMENT ON COLUMN public.shared_files.recurrence_type IS 'نوع التكرار: none (بدون تكرار), daily (يومي), weekly (أسبوعي), monthly (شهري)';
COMMENT ON COLUMN public.shared_files.recurrence_end_date IS 'تاريخ انتهاء التكرار';
COMMENT ON COLUMN public.shared_files.next_send_at IS 'موعد الإرسال التالي للإرسالات المتكررة';
COMMENT ON COLUMN public.shared_files.reminder_sent IS 'هل تم إرسال التذكير قبل ساعة من الإرسال';
COMMENT ON COLUMN public.shared_files.last_sent_at IS 'تاريخ آخر إرسال (للإرسالات المتكررة)';