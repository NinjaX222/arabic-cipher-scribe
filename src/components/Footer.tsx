
import { Shield, ShieldCheck } from "lucide-react";
import { useCipher } from "@/contexts/CipherContext";

const Footer: React.FC = () => {
  const { isArabic } = useCipher();
  
  return (
    <footer className={`w-full p-6 mt-8 text-center ${isArabic ? "rtl font-arabic" : ""}`}>
      <div className="flex items-center justify-center mb-2">
        <ShieldCheck className="h-5 w-5 text-cipher-purple mr-2 rtl:ml-2 rtl:mr-0" />
        <span className="text-sm">
          {isArabic
            ? "تشفير آمن وموثوق"
            : "Secure and reliable encryption"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {isArabic
          ? "© ٢٠٢٥ مشفر النصوص العربي - تم تطويره بواسطة Lovable"
          : "© 2025 Arabic Cipher Scribe - Developed with Lovable"}
      </p>
    </footer>
  );
};

export default Footer;
