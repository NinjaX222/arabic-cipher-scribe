import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get shares expiring in the next 24 hours
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: expiringShares, error: sharesError } = await supabase
      .from('shared_files')
      .select(`
        *,
        profiles!shared_files_user_id_fkey (name, email)
      `)
      .eq('is_active', true)
      .gt('expires_at', now.toISOString())
      .lt('expires_at', twentyFourHoursLater.toISOString());

    if (sharesError) {
      throw sharesError;
    }

    console.log(`Found ${expiringShares?.length || 0} expiring shares`);

    const emailResults = [];

    // Send notification for each expiring share
    for (const share of expiringShares || []) {
      try {
        const userEmail = share.profiles?.email;
        const userName = share.profiles?.name || userEmail;

        if (!userEmail) continue;

        const timeLeft = Math.ceil(
          (new Date(share.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        
        const shareLink = `${Deno.env.get('SITE_URL') || 'https://your-domain.com'}/shared/${share.share_token}`;
        const expiryDate = new Date(share.expires_at).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        });

        const emailResponse = await resend.emails.send({
          from: "Cipher Guard <onboarding@resend.dev>",
          to: [userEmail],
          subject: `⏰ Your shared file link expires in ${timeLeft} hour${timeLeft > 1 ? 's' : ''}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                  }
                  .header {
                    background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                  }
                  .content {
                    background: #f9fafb;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                  }
                  .file-info {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #f59e0b;
                  }
                  .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 14px 28px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                  }
                  .urgent {
                    background: #fee2e2;
                    border: 2px solid #dc2626;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1 style="margin: 0; font-size: 28px;">⏰ Link Expiring Soon</h1>
                </div>
                <div class="content">
                  <p>Hello ${userName},</p>
                  
                  <div class="urgent">
                    <h2 style="margin: 0 0 10px 0; color: #dc2626;">
                      ⚠️ Urgent: Link expires in ${timeLeft} hour${timeLeft > 1 ? 's' : ''}!
                    </h2>
                    <p style="margin: 0; font-size: 18px;">
                      Your shared file link will expire on<br>
                      <strong>${expiryDate}</strong>
                    </p>
                  </div>
                  
                  <div class="file-info">
                    <h3 style="margin-top: 0; color: #f59e0b;">📄 File Details</h3>
                    <p><strong>File Name:</strong> ${share.file_name}</p>
                    <p><strong>Downloads:</strong> ${share.download_count} / ${share.max_downloads || 'Unlimited'}</p>
                    <p><strong>Shared:</strong> ${new Date(share.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                  </div>

                  <p><strong>What you can do:</strong></p>
                  <ul>
                    <li>Share the link with anyone who hasn't downloaded it yet</li>
                    <li>Create a new share link from your dashboard if needed</li>
                    <li>Download the file yourself before it expires</li>
                  </ul>

                  <div style="text-align: center;">
                    <a href="${Deno.env.get('SITE_URL') || 'https://your-domain.com'}/secure-share" class="button">
                      Manage Your Shares
                    </a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Share Link: <a href="${shareLink}" style="color: #667eea;">${shareLink}</a>
                  </p>
                </div>
                <div class="footer">
                  <p>This is an automated reminder from Cipher Guard</p>
                  <p>Please do not reply to this email</p>
                </div>
              </body>
            </html>
          `,
        });

        emailResults.push({
          shareId: share.id,
          email: userEmail,
          status: 'sent',
          result: emailResponse
        });

        console.log(`Expiry notification sent to ${userEmail} for share ${share.id}`);
      } catch (emailError) {
        console.error(`Failed to send notification for share ${share.id}:`, emailError);
        emailResults.push({
          shareId: share.id,
          status: 'failed',
          error: emailError.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: expiringShares?.length || 0,
        notifications: emailResults.length,
        results: emailResults
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error checking expiring shares:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
