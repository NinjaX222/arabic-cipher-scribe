import { useState } from "react";
import { LogOut, MonitorSmartphone, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SessionSecurityCardProps {
  isArabic?: boolean;
}

export const SessionSecurityCard = ({ isArabic = false }: SessionSecurityCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const text = isArabic ? {
    title: "أمان الجلسة",
    description: "إدارة جلسات تسجيل الدخول الخاصة بك",
    signOutAll: "تسجيل الخروج من جميع الأجهزة",
    signOutAllDesc: "سيتم تسجيل خروجك من جميع الأجهزة المتصلة بحسابك",
    confirmTitle: "تأكيد تسجيل الخروج الشامل",
    confirmDesc: "هل أنت متأكد من تسجيل الخروج من جميع الأجهزة؟ ستحتاج لتسجيل الدخول مرة أخرى على جميع الأجهزة.",
    cancel: "إلغاء",
    confirm: "تسجيل الخروج",
    success: "تم تسجيل الخروج من جميع الأجهزة",
    error: "حدث خطأ أثناء تسجيل الخروج",
    sessionTimeout: "انتهاء الجلسة التلقائي",
    sessionTimeoutDesc: "سيتم تسجيل خروجك تلقائياً بعد 30 دقيقة من عدم النشاط"
  } : {
    title: "Session Security",
    description: "Manage your login sessions",
    signOutAll: "Sign out from all devices",
    signOutAllDesc: "This will sign you out from all connected devices",
    confirmTitle: "Confirm Global Sign Out",
    confirmDesc: "Are you sure you want to sign out from all devices? You'll need to log in again on all devices.",
    cancel: "Cancel",
    confirm: "Sign Out",
    success: "Signed out from all devices",
    error: "Error signing out",
    sessionTimeout: "Auto Session Timeout",
    sessionTimeoutDesc: "You'll be automatically signed out after 30 minutes of inactivity"
  };

  const handleSignOutAll = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        toast.error(text.error);
        return;
      }

      toast.success(text.success);
      window.location.href = '/login';
    } catch (error) {
      toast.error(text.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>{text.title}</CardTitle>
        </div>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Timeout Info */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">{text.sessionTimeout}</label>
            </div>
            <p className="text-xs text-muted-foreground">{text.sessionTimeoutDesc}</p>
          </div>
        </div>

        <Separator />

        {/* Sign Out All Devices */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">{text.signOutAll}</label>
            </div>
            <p className="text-xs text-muted-foreground">{text.signOutAllDesc}</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isLoading}>
                <LogOut className="h-4 w-4 mr-2" />
                {isArabic ? "خروج شامل" : "Sign Out All"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{text.confirmTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {text.confirmDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOutAll}>
                  {text.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
