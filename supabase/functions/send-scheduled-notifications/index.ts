import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // 1. إرسال التذكيرات (قبل ساعة من الإرسال)
    const { data: reminderShares, error: reminderError } = await supabase
      .from('shared_files')
      .select('*')
      .not('scheduled_send_at', 'is', null)
      .eq('reminder_sent', false)
      .lte('scheduled_send_at', oneHourFromNow.toISOString())
      .gte('scheduled_send_at', now.toISOString());

    if (reminderError) {
      console.error('Error fetching reminder shares:', reminderError);
    } else if (reminderShares && reminderShares.length > 0) {
      console.log(`Processing ${reminderShares.length} reminder notifications`);
      
      for (const share of reminderShares) {
        const details = share.details as { recipient_email?: string; message?: string } | null;
        if (details?.recipient_email) {
          try {
            const shareUrl = `${Deno.env.get('SITE_URL')}/shared/${share.share_token}`;
            const scheduledTime = new Date(share.scheduled_send_at).toLocaleString('ar-SA');

            await resend.emails.send({
              from: "Cipher Guard <onboarding@resend.dev>",
              to: [details.recipient_email],
              subject: "تذكير: إرسال مجدول خلال ساعة",
              html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>تذكير بإرسال مجدول</h2>
                  <p>مرحباً،</p>
                  <p>هذا تذكير بأن لديك ملف مجدول للإرسال خلال ساعة واحدة.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
                    <p><strong>اسم الملف:</strong> ${share.file_name}</p>
                    <p><strong>موعد الإرسال:</strong> ${scheduledTime}</p>
                    ${details.message ? `<p><strong>الرسالة:</strong> ${details.message}</p>` : ''}
                  </div>
                  <p>سيتم إرسال الرابط تلقائياً في الموعد المحدد.</p>
                  <p>مع تحيات فريق Cipher Guard</p>
                </div>
              `,
            });

            // Mark reminder as sent
            await supabase
              .from('shared_files')
              .update({ reminder_sent: true })
              .eq('id', share.id);

            console.log(`Reminder sent for share ${share.id}`);
          } catch (emailError) {
            console.error(`Error sending reminder for share ${share.id}:`, emailError);
          }
        }
      }
    }

    // 2. إرسال الإشعارات المجدولة
    const { data: shares, error: sharesError } = await supabase
      .from('shared_files')
      .select('*')
      .not('scheduled_send_at', 'is', null)
      .eq('notification_sent', false)
      .lte('scheduled_send_at', now.toISOString());

    if (sharesError) {
      console.error('Error processing scheduled notifications:', sharesError);
      throw sharesError;
    }

    if (!shares || shares.length === 0) {
      console.log('No scheduled notifications to send');
      return new Response(
        JSON.stringify({ message: 'No scheduled notifications to send' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Processing ${shares.length} scheduled notifications`);
    const results = [];

    for (const share of shares) {
      const details = share.details as { recipient_email?: string; message?: string } | null;
      
      if (!details?.recipient_email) {
        console.log(`Skipping share ${share.id}: no recipient email`);
        continue;
      }

      try {
        const shareUrl = `${Deno.env.get('SITE_URL')}/shared/${share.share_token}`;
        
        const emailResponse = await resend.emails.send({
          from: "Cipher Guard <onboarding@resend.dev>",
          to: [details.recipient_email],
          subject: "ملف مشفر مشارك معك",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>تم مشاركة ملف مشفر معك</h2>
              <p>مرحباً،</p>
              <p>تم مشاركة ملف مشفر معك عبر Cipher Guard.</p>
              <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p><strong>اسم الملف:</strong> ${share.file_name}</p>
                ${details.message ? `<p><strong>رسالة المرسل:</strong> ${details.message}</p>` : ''}
              </div>
              <p style="margin: 25px 0;">
                <a href="${shareUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  فتح الملف المشفر
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                <strong>ملاحظة:</strong> هذا الرابط محمي وسينتهي بعد ${Math.round((new Date(share.expires_at).getTime() - Date.now()) / (1000 * 60 * 60))} ساعة.
              </p>
            </div>
          `,
        });

        console.log(`Email sent for share ${share.id}:`, emailResponse);

        // إنشاء إشعار داخل التطبيق للمستخدم
        try {
          await supabase.from('notifications').insert({
            user_id: share.user_id,
            title: share.recurrence_type !== 'none' ? 'تم إرسال ملف متكرر' : 'تم إرسال ملف مجدول',
            message: `تم إرسال الملف "${share.file_name}" إلى ${details.recipient_email} بنجاح`,
            type: 'success',
            related_share_id: share.id,
          });
          console.log(`In-app notification created for share ${share.id}`);
        } catch (notifError) {
          console.error(`Error creating notification for share ${share.id}:`, notifError);
        }

        // تحديث حالة الإرسال وحساب الإرسال التالي للتكرارات
        const updates: any = {
          notification_sent: true,
          last_sent_at: now.toISOString(),
        };

        // حساب موعد الإرسال التالي للإرسالات المتكررة
        if (share.recurrence_type && share.recurrence_type !== 'none') {
          const currentSendDate = new Date(share.scheduled_send_at);
          let nextSendDate = new Date(currentSendDate);

          switch (share.recurrence_type) {
            case 'daily':
              nextSendDate.setDate(currentSendDate.getDate() + 1);
              break;
            case 'weekly':
              nextSendDate.setDate(currentSendDate.getDate() + 7);
              break;
            case 'monthly':
              nextSendDate.setMonth(currentSendDate.getMonth() + 1);
              break;
          }

          // التحقق من عدم تجاوز تاريخ النهاية
          const endDate = share.recurrence_end_date ? new Date(share.recurrence_end_date) : null;
          if (!endDate || nextSendDate <= endDate) {
            updates.next_send_at = nextSendDate.toISOString();
            updates.scheduled_send_at = nextSendDate.toISOString();
            updates.notification_sent = false;
            updates.reminder_sent = false;
          } else {
            // انتهى التكرار
            updates.next_send_at = null;
            updates.recurrence_type = 'none';
          }
        }

        await supabase
          .from('shared_files')
          .update(updates)
          .eq('id', share.id);

        results.push({
          id: share.id,
          status: 'sent',
          recipient: details.recipient_email,
        });
      } catch (error) {
        console.error(`Error processing share ${share.id}:`, error);
        results.push({
          id: share.id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Scheduled notifications processed',
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing scheduled notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
