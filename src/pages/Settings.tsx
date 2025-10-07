import { Globe2, Moon, Sun, User, Bell, Shield, Palette, Lock, Mail, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const { isArabic, toggleLanguage, isDarkMode, toggleDarkMode } = useCipher();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    encryption: true,
    security: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const text = isArabic ? {
    title: "الإعدادات",
    description: "إدارة تفضيلات التطبيق الخاص بك",
    appearance: "المظهر",
    appearanceDesc: "تخصيص شكل ومظهر التطبيق",
    language: "اللغة",
    languageDesc: "اختر لغة التطبيق",
    currentLanguage: "العربية",
    switchToEnglish: "التبديل إلى الإنجليزية",
    theme: "السمة",
    themeDesc: "اختر بين السمة الفاتحة والمظلمة",
    darkMode: "الوضع المظلم",
    lightMode: "الوضع الفاتح",
    profile: "الملف الشخصي",
    profileDesc: "إعدادات الحساب والملف الشخصي",
    viewProfile: "عرض الملف الشخصي",
    notifications: "الإشعارات",
    notificationsDesc: "إدارة تفضيلات الإشعارات",
    emailNotif: "إشعارات البريد الإلكتروني",
    pushNotif: "الإشعارات الفورية",
    encryptionNotif: "إشعارات التشفير",
    securityNotif: "إشعارات الأمان",
    security: "الأمان",
    securityDesc: "إعدادات الأمان والخصوصية",
    changePassword: "تغيير كلمة المرور",
    twoFactor: "المصادقة الثنائية",
    twoFactorDesc: "إضافة طبقة أمان إضافية",
    loginRequired: "يجب تسجيل الدخول أولاً"
  } : {
    title: "Settings",
    description: "Manage your application preferences",
    appearance: "Appearance",
    appearanceDesc: "Customize the look and feel of the application",
    language: "Language",
    languageDesc: "Choose your preferred language",
    currentLanguage: "English",
    switchToEnglish: "Switch to Arabic",
    theme: "Theme",
    themeDesc: "Choose between light and dark theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    profile: "Profile",
    profileDesc: "Account and profile settings",
    viewProfile: "View Profile",
    notifications: "Notifications", 
    notificationsDesc: "Manage your notification preferences",
    emailNotif: "Email Notifications",
    pushNotif: "Push Notifications",
    encryptionNotif: "Encryption Notifications",
    securityNotif: "Security Alerts",
    security: "Security",
    securityDesc: "Security and privacy settings",
    changePassword: "Change Password",
    twoFactor: "Two-Factor Authentication",
    twoFactorDesc: "Add an extra layer of security",
    loginRequired: "Please login first"
  };

  return (
    <div className={`min-h-screen bg-background ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{text.title}</h1>
          <p className="text-muted-foreground">{text.description}</p>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>{text.appearance}</CardTitle>
              </div>
              <CardDescription>{text.appearanceDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Setting */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4" />
                    <label className="text-base font-medium">{text.language}</label>
                  </div>
                  <p className="text-sm text-muted-foreground">{text.languageDesc}</p>
                </div>
                <Button onClick={toggleLanguage} variant="outline">
                  {isArabic ? text.switchToEnglish : "العربية"}
                </Button>
              </div>

              <Separator />

              {/* Theme Setting */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <label className="text-base font-medium">{text.theme}</label>
                  </div>
                  <p className="text-sm text-muted-foreground">{text.themeDesc}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm">{text.lightMode}</label>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                  <label className="text-sm">{text.darkMode}</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>{text.profile}</CardTitle>
              </div>
              <CardDescription>{text.profileDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Button onClick={() => navigate("/profile")} className="w-full">
                  {text.viewProfile}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <p>{text.loginRequired}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>{text.notifications}</CardTitle>
              </div>
              <CardDescription>{text.notificationsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <label className="text-sm font-medium">{text.emailNotif}</label>
                  </div>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(checked) => {
                    setNotifications({...notifications, email: checked});
                    toast.success(isArabic ? "تم تحديث الإعدادات" : "Settings updated");
                  }} 
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <label className="text-sm font-medium">{text.pushNotif}</label>
                  </div>
                </div>
                <Switch 
                  checked={notifications.push} 
                  onCheckedChange={(checked) => {
                    setNotifications({...notifications, push: checked});
                    toast.success(isArabic ? "تم تحديث الإعدادات" : "Settings updated");
                  }} 
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <label className="text-sm font-medium">{text.encryptionNotif}</label>
                  </div>
                </div>
                <Switch 
                  checked={notifications.encryption} 
                  onCheckedChange={(checked) => {
                    setNotifications({...notifications, encryption: checked});
                    toast.success(isArabic ? "تم تحديث الإعدادات" : "Settings updated");
                  }} 
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <label className="text-sm font-medium">{text.securityNotif}</label>
                  </div>
                </div>
                <Switch 
                  checked={notifications.security} 
                  onCheckedChange={(checked) => {
                    setNotifications({...notifications, security: checked});
                    toast.success(isArabic ? "تم تحديث الإعدادات" : "Settings updated");
                  }} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>{text.security}</CardTitle>
              </div>
              <CardDescription>{text.securityDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <label className="text-sm font-medium">{text.changePassword}</label>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info(isArabic ? "قريباً..." : "Coming soon...")}
                    >
                      {isArabic ? "تغيير" : "Change"}
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <label className="text-sm font-medium">{text.twoFactor}</label>
                      </div>
                      <p className="text-xs text-muted-foreground">{text.twoFactorDesc}</p>
                    </div>
                    <Switch 
                      defaultChecked={false}
                      onCheckedChange={() => toast.info(isArabic ? "قريباً..." : "Coming soon...")}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <p>{text.loginRequired}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;