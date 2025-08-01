import { useState } from "react";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Copy, MessageCircle, Mail, Download, QrCode } from "lucide-react";
import { toast } from "sonner";

interface Texts {
  title: string;
  description: string;
  shareVia: string;
  copyLink: string;
  whatsapp: string;
  email: string;
  downloadQR: string;
  appUrl: string;
  shareMessage: string;
  emailSubject: string;
  emailBody: string;
  linkCopied: string;
  qrGenerated: string;
}

const englishTexts: Texts = {
  title: "Share App",
  description: "Share Arabic Cipher Scribe with your friends and colleagues",
  shareVia: "Share via",
  copyLink: "Copy Link",
  whatsapp: "WhatsApp",
  email: "Email",
  downloadQR: "Download QR Code",
  appUrl: "App URL",
  shareMessage: "Check out Arabic Cipher Scribe - a powerful text and media encryption tool! Secure your messages, images, and videos with advanced encryption.",
  emailSubject: "Arabic Cipher Scribe - Secure Encryption Tool",
  emailBody: "I wanted to share this amazing encryption tool with you: Arabic Cipher Scribe.\n\nIt allows you to securely encrypt and decrypt text messages, images, and videos using advanced encryption algorithms.\n\nCheck it out here:",
  linkCopied: "Link copied to clipboard!",
  qrGenerated: "QR code will be generated soon"
};

const arabicTexts: Texts = {
  title: "مشاركة التطبيق",
  description: "شارك مشفر النصوص العربي مع أصدقائك وزملائك",
  shareVia: "المشاركة عبر",
  copyLink: "نسخ الرابط",
  whatsapp: "واتساب",
  email: "البريد الإلكتروني",
  downloadQR: "تحميل رمز QR",
  appUrl: "رابط التطبيق",
  shareMessage: "تحقق من مشفر النصوص العربي - أداة تشفير قوية للنصوص والوسائط! أمّن رسائلك وصورك ومقاطع الفيديو الخاصة بك بتشفير متقدم.",
  emailSubject: "مشفر النصوص العربي - أداة تشفير آمنة",
  emailBody: "أردت أن أشارك معك هذه الأداة الرائعة للتشفير: مشفر النصوص العربي.\n\nيتيح لك تشفير وفك تشفير الرسائل النصية والصور ومقاطع الفيديو بأمان باستخدام خوارزميات تشفير متقدمة.\n\nتحقق منه هنا:",
  linkCopied: "تم نسخ الرابط!",
  qrGenerated: "سيتم توليد رمز QR قريباً"
};

const ShareApp = () => {
  const { isArabic } = useCipher();
  const texts = isArabic ? arabicTexts : englishTexts;
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  const appUrl = window.location.origin;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      toast.success(texts.linkCopied);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`${texts.shareMessage}\n\n${appUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(texts.emailSubject);
    const body = encodeURIComponent(`${texts.emailBody}\n\n${appUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateQRCode = async () => {
    try {
      // Using a free QR code API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appUrl)}`;
      setQrCodeUrl(qrUrl);
      toast.success(texts.qrGenerated);
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) {
      generateQRCode();
      return;
    }
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'arabic-cipher-scribe-qr.png';
    link.click();
  };

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Share2 className="h-6 w-6" />
                {texts.title}
              </CardTitle>
              <CardDescription>{texts.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* App URL Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{texts.appUrl}</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                    {appUrl}
                  </div>
                  <Button onClick={copyToClipboard} size="icon" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{texts.shareVia}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline" 
                    className="h-auto p-4 justify-start gap-3"
                  >
                    <Copy className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{texts.copyLink}</div>
                      <div className="text-xs text-muted-foreground">
                        Copy URL to clipboard
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={shareViaWhatsApp} 
                    variant="outline" 
                    className="h-auto p-4 justify-start gap-3"
                  >
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">{texts.whatsapp}</div>
                      <div className="text-xs text-muted-foreground">
                        Share via WhatsApp
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={shareViaEmail} 
                    variant="outline" 
                    className="h-auto p-4 justify-start gap-3"
                  >
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">{texts.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Share via Email
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={downloadQRCode} 
                    variant="outline" 
                    className="h-auto p-4 justify-start gap-3"
                  >
                    <QrCode className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">{texts.downloadQR}</div>
                      <div className="text-xs text-muted-foreground">
                        Download QR code
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* QR Code Preview */}
              {qrCodeUrl && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">QR Code</h3>
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for app" 
                      className="max-w-[200px] max-h-[200px]"
                    />
                  </div>
                </div>
              )}

              {/* Share Message Preview */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Share Message Preview</h3>
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <p>{texts.shareMessage}</p>
                  <p className="mt-2 font-mono text-primary">{appUrl}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShareApp;