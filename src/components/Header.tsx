import { Globe2, Moon, Sun, BookOpen, Menu, ImageIcon, VideoIcon, KeyRound, Share2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCipher } from "@/contexts/CipherContext";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderTexts {
  title: string;
  toggleLanguage: string;
  toggleDarkMode: string;
  help: string;
}

const englishText: HeaderTexts = {
  title: "Cipher Guard",
  toggleLanguage: "Switch to Arabic",
  toggleDarkMode: "Toggle dark mode",
  help: "Help & Guide"
};

const arabicText: HeaderTexts = {
  title: "حارس التشفير",
  toggleLanguage: "التبديل إلى الإنجليزية",
  toggleDarkMode: "تبديل الوضع المظلم",
  help: "المساعدة والدليل"
};

const Header = () => {
  const {
    isArabic,
    toggleLanguage,
    isDarkMode,
    toggleDarkMode
  } = useCipher();

  const text = isArabic ? arabicText : englishText;

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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleLanguage} className="flex items-center gap-2">
                <Globe2 className="h-4 w-4" />
                {text.toggleLanguage}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleDarkMode} className="flex items-center gap-2">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {text.toggleDarkMode}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Desktop Language and Theme Toggle */}
          <Button variant="ghost" size="sm" className="h-8 w-8 md:h-10 md:w-10 hidden sm:block" onClick={toggleLanguage} title={text.toggleLanguage}>
            <Globe2 className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 md:h-10 md:w-10 hidden sm:block" onClick={toggleDarkMode} title={text.toggleDarkMode}>
            {isDarkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;