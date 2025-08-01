import { useState, useEffect } from "react";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw, KeyRound, Check } from "lucide-react";
import { toast } from "sonner";

interface Texts {
  title: string;
  description: string;
  length: string;
  options: string;
  includeUppercase: string;
  includeLowercase: string;
  includeNumbers: string;
  includeSymbols: string;
  excludeSimilar: string;
  generatedPassword: string;
  generate: string;
  copy: string;
  copied: string;
  strength: string;
  weak: string;
  medium: string;
  strong: string;
  veryStrong: string;
}

const englishTexts: Texts = {
  title: "Password Generator",
  description: "Generate strong and secure passwords with customizable options",
  length: "Password Length",
  options: "Password Options",
  includeUppercase: "Include Uppercase Letters (A-Z)",
  includeLowercase: "Include Lowercase Letters (a-z)",
  includeNumbers: "Include Numbers (0-9)",
  includeSymbols: "Include Symbols (!@#$%^&*)",
  excludeSimilar: "Exclude Similar Characters (0, O, l, 1)",
  generatedPassword: "Generated Password",
  generate: "Generate Password",
  copy: "Copy",
  copied: "Copied!",
  strength: "Password Strength",
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
  veryStrong: "Very Strong"
};

const arabicTexts: Texts = {
  title: "مولد كلمات المرور",
  description: "توليد كلمات مرور قوية وآمنة مع خيارات قابلة للتخصيص",
  length: "طول كلمة المرور",
  options: "خيارات كلمة المرور",
  includeUppercase: "تضمين الأحرف الكبيرة (A-Z)",
  includeLowercase: "تضمين الأحرف الصغيرة (a-z)",
  includeNumbers: "تضمين الأرقام (0-9)",
  includeSymbols: "تضمين الرموز (!@#$%^&*)",
  excludeSimilar: "استبعاد الأحرف المتشابهة (0, O, l, 1)",
  generatedPassword: "كلمة المرور المولدة",
  generate: "توليد كلمة مرور",
  copy: "نسخ",
  copied: "تم النسخ!",
  strength: "قوة كلمة المرور",
  weak: "ضعيف",
  medium: "متوسط",
  strong: "قوي",
  veryStrong: "قوي جداً"
};

const PasswordGenerator = () => {
  const { isArabic } = useCipher();
  const texts = isArabic ? arabicTexts : englishTexts;
  
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const similarChars = "0Ol1";

  const generatePassword = () => {
    let characterSet = "";
    
    if (includeUppercase) characterSet += uppercaseChars;
    if (includeLowercase) characterSet += lowercaseChars;
    if (includeNumbers) characterSet += numberChars;
    if (includeSymbols) characterSet += symbolChars;
    
    if (excludeSimilar) {
      characterSet = characterSet.split('').filter(char => !similarChars.includes(char)).join('');
    }
    
    if (characterSet === "") {
      toast.error("Please select at least one character type");
      return;
    }
    
    let newPassword = "";
    for (let i = 0; i < length[0]; i++) {
      newPassword += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
    }
    
    setPassword(newPassword);
    setIsCopied(false);
  };

  const copyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      setIsCopied(true);
      toast.success(texts.copied);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy password");
    }
  };

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    return score;
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return texts.weak;
    if (score <= 4) return texts.medium;
    if (score <= 5) return texts.strong;
    return texts.veryStrong;
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return "text-red-500";
    if (score <= 4) return "text-yellow-500";
    if (score <= 5) return "text-blue-500";
    return "text-green-500";
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar]);

  const strengthScore = calculateStrength(password);

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <KeyRound className="h-6 w-6" />
                {texts.title}
              </CardTitle>
              <CardDescription>{texts.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Length */}
              <div className="space-y-3">
                <Label>{texts.length}: {length[0]}</Label>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  min={4}
                  max={128}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Password Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">{texts.options}</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={includeUppercase}
                      onCheckedChange={(checked) => setIncludeUppercase(checked === true)}
                    />
                    <Label htmlFor="uppercase" className="text-sm">
                      {texts.includeUppercase}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={includeLowercase}
                      onCheckedChange={(checked) => setIncludeLowercase(checked === true)}
                    />
                    <Label htmlFor="lowercase" className="text-sm">
                      {texts.includeLowercase}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={includeNumbers}
                      onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
                    />
                    <Label htmlFor="numbers" className="text-sm">
                      {texts.includeNumbers}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={includeSymbols}
                      onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
                    />
                    <Label htmlFor="symbols" className="text-sm">
                      {texts.includeSymbols}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeSimilar"
                      checked={excludeSimilar}
                      onCheckedChange={(checked) => setExcludeSimilar(checked === true)}
                    />
                    <Label htmlFor="excludeSimilar" className="text-sm">
                      {texts.excludeSimilar}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Generated Password */}
              <div className="space-y-3">
                <Label>{texts.generatedPassword}</Label>
                <div className="flex gap-2">
                  <Input
                    value={password}
                    readOnly
                    className="font-mono text-sm"
                    placeholder="Generated password will appear here"
                  />
                  <Button onClick={copyToClipboard} size="icon" variant="outline">
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="space-y-2">
                  <Label>{texts.strength}</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          strengthScore <= 2 ? 'bg-red-500' :
                          strengthScore <= 4 ? 'bg-yellow-500' :
                          strengthScore <= 5 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(strengthScore / 6) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${getStrengthColor(strengthScore)}`}>
                      {getStrengthText(strengthScore)}
                    </span>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button onClick={generatePassword} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                {texts.generate}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PasswordGenerator;