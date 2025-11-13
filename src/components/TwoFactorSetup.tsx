import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { use2FA } from '@/hooks/use2FA';
import { useCipher } from '@/contexts/CipherContext';

export const TwoFactorSetup = () => {
  const { isArabic } = useCipher();
  const { twoFactorAuth, loading, generateSecret, enable2FA, disable2FA } = use2FA();
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUri: string; backupCodes: string[] } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  const text = isArabic ? {
    title: "المصادقة الثنائية (2FA)",
    description: "أضف طبقة أمان إضافية لحسابك",
    enabled: "مفعلة",
    disabled: "غير مفعلة",
    enable: "تفعيل 2FA",
    disable: "تعطيل 2FA",
    setupTitle: "إعداد المصادقة الثنائية",
    setupDesc: "امسح رمز QR باستخدام تطبيق المصادقة",
    step1: "الخطوة 1: امسح رمز QR",
    step1Desc: "استخدم تطبيق مصادقة مثل Google Authenticator أو Authy",
    step2: "الخطوة 2: أدخل رمز التحقق",
    step2Desc: "أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة",
    verificationCode: "رمز التحقق",
    verifyAndEnable: "التحقق والتفعيل",
    backupCodes: "رموز النسخ الاحتياطي",
    backupCodesDesc: "احفظ هذه الرموز في مكان آمن. يمكن استخدام كل رمز مرة واحدة فقط.",
    copyBackupCodes: "نسخ الرموز",
    copied: "تم النسخ!",
    cancel: "إلغاء",
    disableConfirm: "هل أنت متأكد من تعطيل 2FA؟",
    status: "الحالة:",
    secretKey: "المفتاح السري (للإدخال اليدوي):",
    copySecret: "نسخ المفتاح"
  } : {
    title: "Two-Factor Authentication (2FA)",
    description: "Add an extra layer of security to your account",
    enabled: "Enabled",
    disabled: "Disabled",
    enable: "Enable 2FA",
    disable: "Disable 2FA",
    setupTitle: "Set Up Two-Factor Authentication",
    setupDesc: "Scan the QR code with your authenticator app",
    step1: "Step 1: Scan QR Code",
    step1Desc: "Use an authenticator app like Google Authenticator or Authy",
    step2: "Step 2: Enter Verification Code",
    step2Desc: "Enter the 6-digit code from your authenticator app",
    verificationCode: "Verification Code",
    verifyAndEnable: "Verify & Enable",
    backupCodes: "Backup Codes",
    backupCodesDesc: "Save these codes in a safe place. Each code can only be used once.",
    copyBackupCodes: "Copy Codes",
    copied: "Copied!",
    cancel: "Cancel",
    disableConfirm: "Are you sure you want to disable 2FA?",
    status: "Status:",
    secretKey: "Secret Key (for manual entry):",
    copySecret: "Copy Key"
  };

  const handleSetup = async () => {
    try {
      const data = await generateSecret();
      setSetupData(data);
      setShowSetup(true);
    } catch (error) {
      toast.error(isArabic ? "فشل إنشاء المفتاح السري" : "Failed to generate secret");
    }
  };

  const handleEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error(isArabic ? "الرجاء إدخال رمز مكون من 6 أرقام" : "Please enter a 6-digit code");
      return;
    }

    setIsEnabling(true);
    try {
      await enable2FA(verificationCode);
      toast.success(isArabic ? "تم تفعيل 2FA بنجاح" : "2FA enabled successfully");
      setShowSetup(false);
      setVerificationCode('');
      setSetupData(null);
    } catch (error) {
      toast.error(isArabic ? "رمز التحقق غير صحيح" : "Invalid verification code");
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm(text.disableConfirm)) return;

    try {
      await disable2FA();
      toast.success(isArabic ? "تم تعطيل 2FA" : "2FA disabled");
    } catch (error) {
      toast.error(isArabic ? "فشل تعطيل 2FA" : "Failed to disable 2FA");
    }
  };

  const copyToClipboard = (text: string, successMsg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(successMsg);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return <div className="animate-pulse">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>{text.title}</CardTitle>
          </div>
          <CardDescription>{text.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{text.status}</p>
              <p className={`text-sm ${twoFactorAuth?.is_enabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                {twoFactorAuth?.is_enabled ? text.enabled : text.disabled}
              </p>
            </div>
            <Button
              onClick={twoFactorAuth?.is_enabled ? handleDisable : handleSetup}
              variant={twoFactorAuth?.is_enabled ? "destructive" : "default"}
            >
              {twoFactorAuth?.is_enabled ? text.disable : text.enable}
            </Button>
          </div>

          {twoFactorAuth?.is_enabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {isArabic 
                  ? "حسابك محمي بالمصادقة الثنائية. ستحتاج إلى رمز من تطبيق المصادقة عند تسجيل الدخول."
                  : "Your account is protected with 2FA. You'll need a code from your authenticator app when logging in."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className={`max-w-2xl ${isArabic ? "rtl font-arabic" : ""}`}>
          <DialogHeader>
            <DialogTitle>{text.setupTitle}</DialogTitle>
            <DialogDescription>{text.setupDesc}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {setupData && (
              <>
                {/* QR Code Section */}
                <div className="space-y-2">
                  <h3 className="font-medium">{text.step1}</h3>
                  <p className="text-sm text-muted-foreground">{text.step1Desc}</p>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeSVG value={setupData.qrCodeUri} size={200} />
                  </div>
                  <div className="space-y-2">
                    <Label>{text.secretKey}</Label>
                    <div className="flex gap-2">
                      <Input value={setupData.secret} readOnly className="font-mono" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(setupData.secret, text.copied)}
                      >
                        {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Verification Section */}
                <div className="space-y-2">
                  <h3 className="font-medium">{text.step2}</h3>
                  <p className="text-sm text-muted-foreground">{text.step2Desc}</p>
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">{text.verificationCode}</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                </div>

                {/* Backup Codes Section */}
                <div className="space-y-2">
                  <h3 className="font-medium">{text.backupCodes}</h3>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{text.backupCodesDesc}</AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                    {setupData.backupCodes.map((code, index) => (
                      <div key={index}>{code}</div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), text.copied)}
                  >
                    {copiedCode ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {text.copyBackupCodes}
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowSetup(false);
                      setVerificationCode('');
                      setSetupData(null);
                    }}
                  >
                    {text.cancel}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleEnable}
                    disabled={isEnabling || verificationCode.length !== 6}
                  >
                    {isEnabling ? (isArabic ? "جاري التحقق..." : "Verifying...") : text.verifyAndEnable}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
