import { useState, useEffect } from "react";
import { 
  Home, 
  ImageIcon, 
  VideoIcon, 
  KeyRound, 
  Share2, 
  BookOpen, 
  Shield, 
  LogIn, 
  UserPlus,
  ChevronDown,
  ChevronRight,
  LockIcon,
  Mic,
  FileText,
  Settings,
  User,
  BarChart3,
  History,
  HardDrive,
  Layout,
  FolderOpen,
  Clock,
  Bell,
  Key,
  AlertTriangle,
  FileBarChart
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCipher } from "@/contexts/CipherContext";
import { supabase } from "@/integrations/supabase/client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isArabic } = useCipher();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isToolsOpen, setIsToolsOpen] = useState(true);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const text = isArabic ? {
    home: "الرئيسية",
    tools: "أدوات التشفير",
    imageEncryption: "تشفير الصور", 
    videoEncryption: "تشفير الفيديو",
    passwordGenerator: "مولد كلمات المرور",
    shareApp: "مشاركة التطبيق",
    account: "الحساب",
    login: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    help: "المساعدة",
    privacy: "سياسة الخصوصية",
    statistics: "الإحصائيات",
    activityLog: "سجل الأنشطة",
    backups: "النسخ الاحتياطية",
    batchProcessing: "المعالجة الدفعية",
    notifications: "الإشعارات",
    passwordManager: "مدير كلمات المرور",
    emergencyMode: "وضع الطوارئ",
    securityReports: "التقارير الأمنية"
  } : {
    home: "Home",
    tools: "Encryption Tools",
    imageEncryption: "Image Encryption",
    videoEncryption: "Video Encryption", 
    passwordGenerator: "Password Generator",
    shareApp: "Share App",
    account: "Account",
    login: "Login",
    signUp: "Sign Up",
    settings: "Settings",
    profile: "Profile",
    help: "Help",
    privacy: "Privacy Policy",
    statistics: "Statistics",
    activityLog: "Activity Log",
    backups: "Backups",
    batchProcessing: "Batch Processing",
    notifications: "Notifications",
    passwordManager: "Password Manager",
    emergencyMode: "Emergency Mode",
    securityReports: "Security Reports"
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  const mainItems = [
    { title: text.home, url: "/", icon: Home },
  ];

  const toolItems = [
    { title: isArabic ? "تشفير النصوص" : "Text Encryption", url: "/text-encryption", icon: LockIcon },
    { title: isArabic ? "تشفير الصوت" : "Audio Encryption", url: "/audio-encryption", icon: Mic },
    { title: text.imageEncryption, url: "/image-encryption", icon: ImageIcon },
    { title: text.videoEncryption, url: "/video-encryption", icon: VideoIcon },
    { title: isArabic ? "تشفير الملفات" : "File Encryption", url: "/file-encryption", icon: FileText },
    { title: text.batchProcessing, url: "/batch-processing", icon: FolderOpen },
    { title: text.passwordGenerator, url: "/password-generator", icon: KeyRound },
    { title: isArabic ? "قوالب التشفير" : "Templates", url: "/templates", icon: Layout },
    { title: isArabic ? "المشاركة الآمنة" : "Secure Share", url: "/secure-share", icon: Shield },
    { title: isArabic ? "الإرسالات المجدولة" : "Scheduled Shares", url: "/scheduled-shares", icon: Clock },
    { title: text.shareApp, url: "/share", icon: Share2 },
  ];

  const accountItems = currentUser ? [
    { title: text.notifications, url: "/notifications", icon: Bell },
    { title: text.profile, url: "/profile", icon: User },
    { title: text.settings, url: "/settings", icon: Settings },
    { title: text.passwordManager, url: "/password-manager", icon: Key },
    { title: text.securityReports, url: "/security-reports", icon: FileBarChart },
    { title: text.statistics, url: "/statistics", icon: BarChart3 },
    { title: text.activityLog, url: "/activity-log", icon: History },
    { title: text.backups, url: "/backups", icon: HardDrive },
    { title: text.emergencyMode, url: "/emergency-mode", icon: AlertTriangle },
  ] : [
    { title: text.login, url: "/login", icon: LogIn },
    { title: text.signUp, url: "/signup", icon: UserPlus },
  ];

  const footerItems = [
    { title: text.help, url: "/help", icon: BookOpen },
    { title: text.privacy, url: "/privacy", icon: Shield },
  ];

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} border-r`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className={`flex items-center gap-3 ${isArabic ? "rtl font-arabic" : ""}`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-lg bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                {isArabic ? "حارس التشفير" : "Cipher Guard"}
              </h2>
              <div className="text-xs text-muted-foreground font-medium">
                {isArabic ? "حماية متقدمة" : "Advanced Security"}
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Shield className="h-4 w-4" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <SidebarTrigger className={`${collapsed ? "mx-auto" : "ml-auto"} mt-2`} />
      </SidebarHeader>

      <SidebarContent className={isArabic ? "rtl font-arabic" : ""}>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Tools Section */}
        <SidebarGroup>
          {!collapsed && (
            <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/label w-full flex items-center justify-between text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">
                  <span>{text.tools}</span>
                  {isToolsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {toolItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavCls}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {collapsed && (
            <SidebarGroupContent>
              <SidebarMenu>
                {toolItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls} title={item.title}>
                        <item.icon className="h-4 w-4" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Account Section */}
        <SidebarGroup>
          {!collapsed && (
            <Collapsible open={isAccountOpen} onOpenChange={setIsAccountOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/label w-full flex items-center justify-between text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">
                  <span>{text.account}</span>
                  {isAccountOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {accountItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavCls}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {collapsed && (
            <SidebarGroupContent>
              <SidebarMenu>
                {accountItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls} title={item.title}>
                        <item.icon className="h-4 w-4" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Footer Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {footerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}