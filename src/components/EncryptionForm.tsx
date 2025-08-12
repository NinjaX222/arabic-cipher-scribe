import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, KeyRound, Lock, LockOpen, RefreshCcw, Trash } from "lucide-react";
import { useCipher } from "@/contexts/CipherContext";
import { encryptAES, decryptAES, doubleEncrypt, doubleDecrypt } from "@/utils/encryption";
import { toast } from "sonner";

interface TabText {
  encrypt: string;
  decrypt: string;
  encryptPlaceholder: string;
  decryptPlaceholder: string;
  encryptDescription: string;
  decryptDescription: string;
  password: string;
  passwordPlaceholder: string;
  encryptionType: string;
  simpleEncryption: string;
  doubleEncryption: string;
  expiration: string;
  expirationPlaceholder: string;
  submitButton: string;
  clearButton: string;
  copyButton: string;
  result: string;
  resultPlaceholder: string;
  usePassword: string;
}

const englishText: TabText = {
  encrypt: "Encrypt",
  decrypt: "Decrypt",
  encryptPlaceholder: "Enter text to encrypt...",
  decryptPlaceholder: "Enter text to decrypt...",
  encryptDescription: "Enter your message and choose your encryption method",
  decryptDescription: "Enter the encrypted text and provide the correct password",
  password: "Password",
  passwordPlaceholder: "Enter encryption password",
  encryptionType: "Encryption Type",
  simpleEncryption: "Simple Encryption",
  doubleEncryption: "Double Encryption",
  expiration: "Expiration (hours)",
  expirationPlaceholder: "24",
  submitButton: "Process",
  clearButton: "Clear",
  copyButton: "Copy",
  result: "Result",
  resultPlaceholder: "Encrypted/Decrypted text will appear here",
  usePassword: "Use Password",
};

const arabicText: TabText = {
  encrypt: "تشفير",
  decrypt: "فك التشفير",
  encryptPlaceholder: "أدخل النص للتشفير...",
  decryptPlaceholder: "أدخل النص لفك التشفير...",
  encryptDescription: "أدخل رسالتك واختر طريقة التشفير",
  decryptDescription: "أدخل النص المشفر وقدم كلمة المرور الصحيحة",
  password: "كلمة المرور",
  passwordPlaceholder: "أدخل كلمة مرور التشفير",
  encryptionType: "نوع التشفير",
  simpleEncryption: "تشفير بسيط",
  doubleEncryption: "تشفير مزدوج",
  expiration: "انتهاء الصلاحية (ساعات)",
  expirationPlaceholder: "24",
  submitButton: "معالجة",
  clearButton: "مسح",
  copyButton: "نسخ",
  result: "النتيجة",
  resultPlaceholder: "سيظهر النص المشفر/المفكك هنا",
  usePassword: "استخدام كلمة مرور",
};

const EncryptionForm: React.FC = () => {
  const { isArabic } = useCipher();
  const text = isArabic ? arabicText : englishText;
  
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [result, setResult] = useState("");
  const [encryptionType, setEncryptionType] = useState<"simple" | "double">("simple");
  const [expiration, setExpiration] = useState("24");
  const [usePassword, setUsePassword] = useState(true);

  const handleModeChange = (newMode: "encrypt" | "decrypt") => {
    setMode(newMode);
    setInput("");
    setPassword("");
    setSecondPassword("");
    setResult("");
  };

  const handleSubmit = () => {
    try {
      if (!input) {
        toast.error(isArabic ? "الرجاء إدخال نص" : "Please enter text");
        return;
      }

      if (usePassword && !password) {
        toast.error(isArabic ? "الرجاء إدخال كلمة مرور" : "Please enter a password");
        return;
      }
      
      if (encryptionType === "double" && (!secondPassword && mode === "encrypt")) {
        toast.error(
          isArabic 
            ? "للتشفير المزدوج، الرجاء إدخال كلمة المرور الثانية" 
            : "For double encryption, please enter the second password"
        );
        return;
      }

      if (mode === "encrypt") {
        if (encryptionType === "simple") {
          setResult(encryptAES(input, password));
        } else {
          setResult(doubleEncrypt(input, password, secondPassword));
        }
        toast.success(
          isArabic ? "تم تشفير النص بنجاح" : "Text encrypted successfully"
        );
      } else {
        if (encryptionType === "simple") {
          const decrypted = decryptAES(input, password);
          setResult(decrypted);
        } else {
          const decrypted = doubleDecrypt(input, password, secondPassword);
          setResult(decrypted);
        }
        toast.success(
          isArabic ? "تم فك تشفير النص بنجاح" : "Text decrypted successfully"
        );
      }
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "حدث خطأ أثناء المعالجة" : "An error occurred during processing"));
      console.error("Processing error:", error);
    }
  };

  const handleClear = () => {
    setInput("");
    setPassword("");
    setSecondPassword("");
    setResult("");
  };

  const handleCopy = () => {
    if (!result) {
      toast.error(isArabic ? "لا يوجد نص للنسخ" : "No text to copy");
      return;
    }
    
    navigator.clipboard.writeText(result)
      .then(() => {
        toast.success(isArabic ? "تم نسخ النص" : "Text copied to clipboard");
      })
      .catch(() => {
        toast.error(isArabic ? "فشل نسخ النص" : "Failed to copy text");
      });
  };

  return (
    <div className={`w-full max-w-3xl mx-auto glass-card p-6 ${isArabic ? "rtl font-arabic" : ""}`}>
      <Tabs
        defaultValue="encrypt"
        className="w-full"
        onValueChange={(value) => handleModeChange(value as "encrypt" | "decrypt")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encrypt">{text.encrypt}</TabsTrigger>
          <TabsTrigger value="decrypt">{text.decrypt}</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            {mode === "encrypt" ? text.encryptDescription : text.decryptDescription}
          </p>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="message">{mode === "encrypt" ? text.encrypt : text.decrypt}</Label>
              <Textarea
                id="message"
                placeholder={mode === "encrypt" ? text.encryptPlaceholder : text.decryptPlaceholder}
                className="min-h-32"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="usePassword"
                checked={usePassword}
                onCheckedChange={setUsePassword}
              />
              <Label htmlFor="usePassword">{text.usePassword}</Label>
            </div>
            
            {usePassword && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">{text.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder={text.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <KeyRound className="absolute right-3 rtl:left-3 rtl:right-auto top-3 text-muted-foreground h-4 w-4" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="encryptionType">{text.encryptionType}</Label>
                  <Select
                    value={encryptionType}
                    onValueChange={(value) => setEncryptionType(value as "simple" | "double")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">{text.simpleEncryption}</SelectItem>
                      <SelectItem value="double">{text.doubleEncryption}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {encryptionType === "double" && (
                  <div className="grid gap-2">
                    <Label htmlFor="secondPassword">{text.password} 2</Label>
                    <div className="relative">
                      <Input
                        id="secondPassword"
                        type="password"
                        placeholder={text.passwordPlaceholder}
                        value={secondPassword}
                        onChange={(e) => setSecondPassword(e.target.value)}
                      />
                      <KeyRound className="absolute right-3 rtl:left-3 rtl:right-auto top-3 text-muted-foreground h-4 w-4" />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-2">
              <Button onClick={handleSubmit} className="gap-2">
                {mode === "encrypt" ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
                {text.submitButton}
              </Button>
              
              <div className="space-x-2 rtl:space-x-reverse">
                <Button variant="outline" onClick={handleClear}>
                  <Trash className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {text.clearButton}
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="result">{text.result}</Label>
                {result && (
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    {text.copyButton}
                  </Button>
                )}
              </div>
              <div className="relative">
                <Textarea
                  id="result"
                  value={result}
                  readOnly
                  className="min-h-24 bg-muted/50"
                  placeholder={text.resultPlaceholder}
                />
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default EncryptionForm;
