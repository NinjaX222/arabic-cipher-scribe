import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, Trash2, Shield, Loader2 } from "lucide-react";
import { useCipher } from "@/contexts/CipherContext";

const EmergencyMode = () => {
  const navigate = useNavigate();
  const { isArabic } = useCipher();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedData, setSelectedData] = useState({
    passwords: true,
    shares: true,
    backups: true,
    templates: true,
    activityLogs: true,
    statistics: true,
    twoFactor: false
  });

  const requiredText = isArabic ? "حذف جميع بياناتي" : "DELETE ALL MY DATA";

  const handleEmergencyDelete = async () => {
    if (confirmText !== requiredText) {
      toast.error(isArabic ? "يرجى كتابة نص التأكيد بشكل صحيح" : "Please type the confirmation text correctly");
      return;
    }
    setShowConfirmDialog(true);
  };

  const executeEmergencyDelete = async () => {
    setIsDeleting(true);
    setShowConfirmDialog(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(isArabic ? "يجب تسجيل الدخول" : "You must be logged in");
        return;
      }

      const deletionPromises = [];

      if (selectedData.passwords) {
        deletionPromises.push(
          supabase.from('password_vault').delete().eq('user_id', user.id)
        );
      }

      if (selectedData.shares) {
        deletionPromises.push(
          supabase.from('shared_files').delete().eq('user_id', user.id)
        );
      }

      if (selectedData.backups) {
        deletionPromises.push(
          supabase.from('secure_backups').delete().eq('user_id', user.id)
        );
      }

      if (selectedData.templates) {
        deletionPromises.push(
          supabase.from('encryption_templates').delete().eq('user_id', user.id)
        );
      }

      if (selectedData.activityLogs) {
        deletionPromises.push(
          supabase.from('activity_logs').delete().eq('user_id', user.id)
        );
      }

      if (selectedData.statistics) {
        deletionPromises.push(
          supabase.from('user_statistics').delete().eq('user_id', user.id)
        );
      }

      if (selectedData.twoFactor) {
        deletionPromises.push(
          supabase.from('two_factor_auth').delete().eq('user_id', user.id)
        );
      }

      // Delete notifications
      deletionPromises.push(
        supabase.from('notifications').delete().eq('user_id', user.id)
      );

      await Promise.all(deletionPromises);

      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();

      toast.success(isArabic ? "تم حذف جميع البيانات بنجاح" : "All data deleted successfully");

      // Sign out and redirect
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Emergency delete error:', error);
      toast.error(isArabic ? "حدث خطأ أثناء الحذف" : "Error during deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  const dataOptions = [
    { key: 'passwords', label: isArabic ? "كلمات المرور المحفوظة" : "Saved Passwords", critical: true },
    { key: 'shares', label: isArabic ? "الملفات المشاركة" : "Shared Files", critical: true },
    { key: 'backups', label: isArabic ? "النسخ الاحتياطية" : "Backups", critical: true },
    { key: 'templates', label: isArabic ? "قوالب التشفير" : "Encryption Templates", critical: false },
    { key: 'activityLogs', label: isArabic ? "سجل النشاط" : "Activity Logs", critical: false },
    { key: 'statistics', label: isArabic ? "الإحصائيات" : "Statistics", critical: false },
    { key: 'twoFactor', label: isArabic ? "إعدادات المصادقة الثنائية" : "2FA Settings", critical: true }
  ];

  return (
    <div className="min-h-screen bg-background p-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              {isArabic ? "وضع الطوارئ" : "Emergency Mode"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? "حذف جميع بياناتك فوراً عند الخطر" : "Instantly delete all your data in case of emergency"}
            </p>
          </div>
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {isArabic ? "تحذير خطير" : "Critical Warning"}
            </CardTitle>
            <CardDescription>
              {isArabic 
                ? "هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع البيانات المحددة نهائياً ولن تتمكن من استعادتها."
                : "This action cannot be undone. All selected data will be permanently deleted and cannot be recovered."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {isArabic ? "اختر البيانات المراد حذفها:" : "Select data to delete:"}
              </Label>
              <div className="grid gap-3">
                {dataOptions.map((option) => (
                  <div
                    key={option.key}
                    className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg border ${
                      option.critical ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                    }`}
                  >
                    <Checkbox
                      id={option.key}
                      checked={selectedData[option.key as keyof typeof selectedData]}
                      onCheckedChange={(checked) =>
                        setSelectedData(prev => ({ ...prev, [option.key]: !!checked }))
                      }
                    />
                    <Label htmlFor={option.key} className="flex-1 cursor-pointer">
                      {option.label}
                      {option.critical && (
                        <span className="text-destructive text-xs ml-2">
                          ({isArabic ? "حرج" : "Critical"})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label>
                {isArabic 
                  ? `اكتب "${requiredText}" للتأكيد:`
                  : `Type "${requiredText}" to confirm:`}
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={requiredText}
                className="border-destructive/50 focus:border-destructive"
              />
            </div>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handleEmergencyDelete}
              disabled={confirmText !== requiredText || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isArabic ? "جاري الحذف..." : "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isArabic ? "حذف البيانات الآن" : "Delete Data Now"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{isArabic ? "متى تستخدم وضع الطوارئ؟" : "When to use Emergency Mode?"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• {isArabic ? "عند فقدان أو سرقة جهازك" : "When your device is lost or stolen"}</li>
              <li>• {isArabic ? "عند الشك في اختراق حسابك" : "When you suspect your account is compromised"}</li>
              <li>• {isArabic ? "عند الحاجة لحذف البيانات بشكل عاجل" : "When you need to urgently delete data"}</li>
              <li>• {isArabic ? "قبل التخلص من جهاز قديم" : "Before disposing of an old device"}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {isArabic ? "تأكيد الحذف النهائي" : "Confirm Permanent Deletion"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isArabic
                  ? "هل أنت متأكد تماماً؟ هذا الإجراء نهائي ولا يمكن التراجع عنه. ستفقد جميع البيانات المحددة للأبد."
                  : "Are you absolutely sure? This is final and cannot be undone. You will lose all selected data forever."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {isArabic ? "إلغاء" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={executeEmergencyDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isArabic ? "نعم، احذف كل شيء" : "Yes, Delete Everything"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EmergencyMode;
