import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShareNotificationRequest {
  shareId: string;
  recipientEmail: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { shareId, recipientEmail, message }: ShareNotificationRequest = await req.json();

    // Get share details
    const { data: share, error: shareError } = await supabase
      .from('shared_files')
      .select('*')
      .eq('id', shareId)
      .eq('user_id', user.id)
      .single();

    if (shareError || !share) {
      return new Response(
        JSON.stringify({ error: 'Share not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single();

    const senderName = profile?.name || profile?.email || 'A user';
    const shareLink = `${Deno.env.get('SITE_URL') || 'https://your-domain.com'}/shared/${share.share_token}`;
    const expiryDate = new Date(share.expires_at).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Cipher Guard <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${senderName} shared a secure file with you`,
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                border-left: 4px solid #667eea;
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
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .warning {
                background: #fef3c7;
                border: 1px solid #fbbf24;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔐 Secure File Shared</h1>
            </div>
            <div class="content">
              <p><strong>${senderName}</strong> has securely shared an encrypted file with you.</p>
              
              ${message ? `<p style="font-style: italic; color: #6b7280;">"${message}"</p>` : ''}
              
              <div class="file-info">
                <h3 style="margin-top: 0; color: #667eea;">📄 File Details</h3>
                <p><strong>File Name:</strong> ${share.file_name}</p>
                <p><strong>File Size:</strong> ${(share.file_size / 1024).toFixed(2)} KB</p>
                <p><strong>Expires:</strong> ${expiryDate}</p>
                ${share.max_downloads ? `<p><strong>Max Downloads:</strong> ${share.max_downloads}</p>` : ''}
              </div>

              <div style="text-align: center;">
                <a href="${shareLink}" class="button">
                  Download Encrypted File
                </a>
              </div>

              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
                <ul style="margin: 10px 0 0 0;">
                  <li>You will need the decryption key from ${senderName} to access the file</li>
                  <li>This link will expire on ${expiryDate}</li>
                  ${share.password_hash ? '<li>This file is password protected</li>' : ''}
                </ul>
              </div>

              <p style="color: #6b7280; font-size: 14px;">
                If you're having trouble with the button above, copy and paste this URL into your browser:<br>
                <a href="${shareLink}" style="color: #667eea;">${shareLink}</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message from Cipher Guard</p>
              <p>Please do not reply to this email</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
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
