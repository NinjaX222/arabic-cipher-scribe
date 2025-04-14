
import { Globe2, Moon, Sun, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCipher } from "@/contexts/CipherContext";
import { Link } from "react-router-dom";

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
  const { isArabic, toggleLanguage, isDarkMode, toggleDarkMode } = useCipher();
  const text = isArabic ? arabicText : englishText;

  return (
    <header className={`w-full px-6 py-4 bg-background ${isArabic ? "rtl font-arabic" : ""}`}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            CS
          </div>
          <h1 className="text-xl md:text-2xl font-bold">{text.title}</h1>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/help" title={text.help}>
              <BookOpen className="h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLanguage} 
            title={text.toggleLanguage}
          >
            <Globe2 className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            title={text.toggleDarkMode}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
