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
  title: "Arabic Cipher Scribe",
  toggleLanguage: "Switch to Arabic",
  toggleDarkMode: "Toggle dark mode",
  help: "Help & Guide"
};
const arabicText: HeaderTexts = {
  title: "مشفر النصوص العربي",
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
  return <header className={`w-full px-6 py-4 bg-background ${isArabic ? "rtl font-arabic" : ""}`}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Shield className="h-6 w-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-cyan-600 transition-all duration-300">
              {text.title}
            </h1>
            <div className="text-xs text-muted-foreground font-medium">
              {isArabic ? "حماية متقدمة" : "Advanced Security"}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
          
          <Button variant="ghost" size="icon" onClick={toggleLanguage} title={text.toggleLanguage}>
            <Globe2 className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} title={text.toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>;
};
export default Header;