import { Globe2, Moon, Sun, BookOpen, Menu, ImageIcon, VideoIcon, KeyRound, Share2 } from "lucide-react";
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
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            CS
          </div>
          <h1 className="text-xl md:text-2xl font-bold">{text.title}</h1>
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