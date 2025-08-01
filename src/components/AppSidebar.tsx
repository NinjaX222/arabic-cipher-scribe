import { useState } from "react";
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
  Mic
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCipher } from "@/contexts/CipherContext";

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
    help: "المساعدة",
    privacy: "سياسة الخصوصية"
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
    help: "Help",
    privacy: "Privacy Policy"
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
    { title: text.passwordGenerator, url: "/password-generator", icon: KeyRound },
    { title: text.shareApp, url: "/share", icon: Share2 },
  ];

  const accountItems = [
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
          <div className={`flex items-center gap-2 ${isArabic ? "rtl font-arabic" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              CS
            </div>
            <h2 className="font-bold text-lg">
              {isArabic ? "مشفر النصوص" : "Cipher Scribe"}
            </h2>
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