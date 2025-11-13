import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { use2FA } from '@/hooks/use2FA';

interface TwoFactorVerificationProps {
  isArabic: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorVerification = ({ isArabic, onSuccess, onCancel }: TwoFactorVerificationProps) => {
  const { verify2FACode } = use2FA();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const text = isArabic ? {
    title: "التحقق من الهوية",
    description: "أدخل رمز التحقق من تطبيق المصادقة أو رمز النسخ الاحتياطي",
    code: "رمز التحقق",
    codePlaceholder: "000000",
    verify: "تحقق",
    cancel: "إلغاء",
    backupCodeInfo: "يمكنك أيضاً استخدام أحد رموز النسخ الاحتياطي",
    verifying: "جاري التحقق..."
  } : {
    title: "Two-Factor Authentication",
    description: "Enter the verification code from your authenticator app or a backup code",
    code: "Verification Code",
    codePlaceholder: "000000",
    verify: "Verify",
    cancel: "Cancel",
    backupCodeInfo: "You can also use one of your backup codes",
    verifying: "Verifying..."
  };

  const handleVerify = async () => {
    if (!code || (code.length !== 6 && code.length !== 8)) {
      toast.error(isArabic ? "الرجاء إدخال رمز صحيح" : "Please enter a valid code");
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verify2FACode(code);
      
      if (isValid) {
        toast.success(isArabic ? "تم التحقق بنجاح" : "Verification successful");
        onSuccess();
      } else {
        toast.error(isArabic ? "رمز التحقق غير صحيح" : "Invalid verification code");
      }
    } catch (error) {
      toast.error(isArabic ? "فشل التحقق" : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className={`w-full max-w-md ${isArabic ? "rtl font-arabic" : ""}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="2fa-code">{text.code}</Label>
          <Input
            id="2fa-code"
            type="text"
            maxLength={8}
            placeholder={text.codePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9A-Z]/gi, '').toUpperCase())}
            className="text-center text-2xl tracking-widest"
            autoComplete="off"
            autoFocus
          />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {text.backupCodeInfo}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isVerifying}
          >
            {text.cancel}
          </Button>
          <Button
            className="flex-1"
            onClick={handleVerify}
            disabled={isVerifying || !code}
          >
            {isVerifying ? text.verifying : text.verify}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
