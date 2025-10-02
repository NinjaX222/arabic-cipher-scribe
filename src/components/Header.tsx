import { BookOpen, Menu, ImageIcon, VideoIcon, KeyRound, Share2, Shield, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCipher } from "@/contexts/CipherContext";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authService, supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

interface HeaderTexts {
  title: string;
  help: string;
  signOut: string;
  profile: string;
  settings: string;
}

const englishText: HeaderTexts = {
  title: "Cipher Guard",
  help: "Help & Guide",
  signOut: "Sign Out",
  profile: "Profile", 
  settings: "Settings"
};

const arabicText: HeaderTexts = {
  title: "حارس التشفير",
  help: "المساعدة والدليل",
  signOut: "تسجيل الخروج",
  profile: "الملف الشخصي",
  settings: "الإعدادات"
};

const Header = () => {
  const { isArabic } = useCipher();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const text = isArabic ? arabicText : englishText;

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      const session = await authService.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch profile data
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Fetch profile when user logs in
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
      setProfile(null);
      toast.success(isArabic ? "تم تسجيل الخروج بنجاح" : "Signed out successfully");
      navigate("/login");
    }
  };

  return (
    <header className={`w-full px-3 md:px-6 py-3 md:py-4 bg-background border-b ${isArabic ? "rtl font-arabic" : ""}`}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Shield className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-cyan-600 transition-all duration-300">
              {text.title}
            </h1>
            <div className="text-xs text-muted-foreground font-medium hidden sm:block">
              {isArabic ? "حماية متقدمة" : "Advanced Security"}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Desktop Navigation */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 md:h-10">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/image-encryption" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {isArabic ? "تشفير الصور" : "Image Encryption"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/video-encryption" className="flex items-center gap-2">
                    <VideoIcon className="h-4 w-4" />
                    {isArabic ? "تشفير الفيديو" : "Video Encryption"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/password-generator" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    {isArabic ? "مولد كلمات المرور" : "Password Generator"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/share" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    {isArabic ? "مشاركة التطبيق" : "Share App"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {text.help}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 sm:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/image-encryption" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {isArabic ? "تشفير الصور" : "Image Encryption"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/video-encryption" className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4" />
                  {isArabic ? "تشفير الفيديو" : "Video Encryption"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/password-generator" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  {isArabic ? "مولد كلمات المرور" : "Password Generator"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/share" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  {isArabic ? "مشاركة التطبيق" : "Share App"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/help" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {text.help}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile or Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
                    <AvatarFallback>
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.name || (isArabic ? "مستخدم" : "User")}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {text.settings}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  {text.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">
                {isArabic ? "تسجيل الدخول" : "Login"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;