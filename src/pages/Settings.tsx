import { Globe2, Moon, Sun, User, Bell, Shield, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";

const Settings = () => {
  const { isArabic, toggleLanguage, isDarkMode, toggleDarkMode } = useCipher();

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
    notifications: "الإشعارات",
    notificationsDesc: "إدارة تفضيلات الإشعارات",
    security: "الأمان",
    securityDesc: "إعدادات الأمان والخصوصية"
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
    notifications: "Notifications", 
    notificationsDesc: "Manage your notification preferences",
    security: "Security",
    securityDesc: "Security and privacy settings"
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
              <p className="text-muted-foreground">{isArabic ? "قريباً..." : "Coming soon..."}</p>
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
            <CardContent>
              <p className="text-muted-foreground">{isArabic ? "قريباً..." : "Coming soon..."}</p>
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
            <CardContent>
              <p className="text-muted-foreground">{isArabic ? "قريباً..." : "Coming soon..."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;