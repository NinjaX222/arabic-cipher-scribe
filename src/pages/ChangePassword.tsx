import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

const ChangePassword = () => {
  const { isArabic } = useCipher();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const text = isArabic ? {
    title: "تغيير كلمة المرور",
    description: "قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    currentPasswordPlaceholder: "أدخل كلمة المرور الحالية",
    newPasswordPlaceholder: "أدخل كلمة المرور الجديدة",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور الجديدة",
    changeButton: "تغيير كلمة المرور",
    back: "رجوع",
    passwordMismatch: "كلمات المرور غير متطابقة",
    passwordTooShort: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    success: "تم تغيير كلمة المرور بنجاح",
    error: "حدث خطأ أثناء تغيير كلمة المرور",
    fillAllFields: "الرجاء ملء جميع الحقول"
  } : {
    title: "Change Password",
    description: "Update your password to keep your account secure",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    currentPasswordPlaceholder: "Enter current password",
    newPasswordPlaceholder: "Enter new password",
    confirmPasswordPlaceholder: "Re-enter new password",
    changeButton: "Change Password",
    back: "Back",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 8 characters",
    success: "Password changed successfully",
    error: "Error changing password",
    fillAllFields: "Please fill all fields"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(text.fillAllFields);
      return;
    }

    if (newPassword.length < 8) {
      toast.error(text.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(text.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      // First verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error(text.error);
        return;
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        toast.error(isArabic ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect");
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(text.success);
      navigate("/settings");
    } catch (error) {
      toast.error(text.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{text.title}</CardTitle>
            <CardDescription>{text.description}</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{text.currentPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder={text.currentPasswordPlaceholder}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">{text.newPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder={text.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <PasswordStrengthMeter password={newPassword} isArabic={isArabic} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{text.confirmPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={text.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (isArabic ? "جاري التغيير..." : "Changing...") : text.changeButton}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/settings")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {text.back}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ChangePassword;
