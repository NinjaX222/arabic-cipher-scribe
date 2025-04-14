
import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCipher } from "@/contexts/CipherContext";

const Header: React.FC = () => {
  const { isArabic, isDarkMode, toggleLanguage, toggleDarkMode } = useCipher();

  return (
    <header className="w-full p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className="h-9 w-9 rounded-lg bg-cipher-purple text-white flex items-center justify-center">
          <span className="font-bold text-lg">ش</span>
        </div>
        <h1 className={`text-xl font-bold ${isArabic ? "font-arabic" : ""}`}>
          {isArabic ? "مشفر النصوص العربي" : "Arabic Cipher Scribe"}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
        >
          <Languages className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
