import { useState } from "react";
import { FileText, Upload, Download, Lock, Unlock, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCipher } from "@/contexts/CipherContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { encryptAES, decryptAES } from "@/utils/encryption";

const FileEncryption = () => {
  const { isArabic } = useCipher();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDecryptPassword, setShowDecryptPassword] = useState(false);
  const [encryptedData, setEncryptedData] = useState<string>("");
  const [decryptedFile, setDecryptedFile] = useState<{ name: string; data: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const text = isArabic ? {
    title: "تشفير الملفات",
    subtitle: "قم بتشفير وفك تشفير الملفات بأمان تام",
    selectFile: "اختر ملف",
    password: "كلمة المرور",
    encrypt: "تشفير",
    decrypt: "فك التشفير", 
    encryptedData: "البيانات المشفرة",
    decryptedFile: "الملف المفكوك",
    copy: "نسخ",
    copied: "تم النسخ",
    download: "تحميل",
    encryptTab: "تشفير",
    decryptTab: "فك التشفير",
    passwordPlaceholder: "أدخل كلمة مرور قوية",
    encryptedDataPlaceholder: "الصق البيانات المشفرة هنا",
    noFileSelected: "لم يتم اختيار ملف",
    fileEncrypted: "تم تشفير الملف بنجاح",
    fileDecrypted: "تم فك تشفير الملف بنجاح",
    processingFile: "جاري معالجة الملف...",
    invalidData: "بيانات غير صالحة أو كلمة مرور خاطئة"
  } : {
    title: "File Encryption",
    subtitle: "Encrypt and decrypt files with complete security",
    selectFile: "Select File",
    password: "Password",
    encrypt: "Encrypt",
    decrypt: "Decrypt",
    encryptedData: "Encrypted Data",
    decryptedFile: "Decrypted File",
    copy: "Copy",
    copied: "Copied",
    download: "Download",
    encryptTab: "Encrypt",
    decryptTab: "Decrypt", 
    passwordPlaceholder: "Enter a strong password",
    encryptedDataPlaceholder: "Paste encrypted data here",
    noFileSelected: "No file selected",
    fileEncrypted: "File encrypted successfully",
    fileDecrypted: "File decrypted successfully",
    processingFile: "Processing file...",
    invalidData: "Invalid data or wrong password"
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile || !password) {
      toast.error(isArabic ? "يرجى اختيار ملف وإدخال كلمة مرور" : "Please select a file and enter a password");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const fileInfo = {
          name: selectedFile.name,
          type: selectedFile.type,
          data: fileData
        };

        const encrypted = encryptAES(JSON.stringify(fileInfo), password);
        
        clearInterval(progressInterval);
        setProgress(100);
        setEncryptedData(encrypted);
        
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(0);
          toast.success(text.fileEncrypted);
        }, 500);
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast.error(isArabic ? "خطأ في التشفير" : "Encryption error");
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedData || !decryptPassword) {
      toast.error(isArabic ? "يرجى إدخال البيانات المشفرة وكلمة المرور" : "Please enter encrypted data and password");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const decrypted = decryptAES(encryptedData, decryptPassword);
      const fileInfo = JSON.parse(decrypted);
      
      clearInterval(progressInterval);
      setProgress(100);
      setDecryptedFile({ name: fileInfo.name, data: fileInfo.data });
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        toast.success(text.fileDecrypted);
      }, 500);
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast.error(text.invalidData);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(isArabic ? "تم النسخ إلى الحافظة" : "Copied to clipboard");
    } catch (error) {
      toast.error(isArabic ? "فشل في النسخ" : "Failed to copy");
    }
  };

  const downloadFile = (data: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = data;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(isArabic ? "تم تحميل الملف" : "File downloaded");
    } catch (error) {
      toast.error(isArabic ? "فشل في التحميل" : "Download failed");
    }
  };

  return (
    <div className={`min-h-screen ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="container px-4 py-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {text.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="encrypt" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {text.encryptTab}
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              {text.decryptTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {text.encryptTab}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "اختر ملف وأدخل كلمة مرور لتشفيره" : "Select a file and enter a password to encrypt it"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{text.selectFile}</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{text.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={text.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{text.processingFile}</p>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <Button 
                  onClick={handleEncrypt} 
                  disabled={!selectedFile || !password || isProcessing}
                  className="w-full"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {text.encrypt}
                </Button>

                {encryptedData && (
                  <div className="space-y-2">
                    <Label>{text.encryptedData}</Label>
                    <div className="relative">
                      <textarea
                        value={encryptedData}
                        readOnly
                        className="w-full h-32 p-3 border rounded-md bg-muted font-mono text-sm resize-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(encryptedData)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decrypt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="h-5 w-5" />
                  {text.decryptTab}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "الصق البيانات المشفرة وأدخل كلمة المرور لفك التشفير" : "Paste encrypted data and enter password to decrypt"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{text.encryptedData}</Label>
                  <textarea
                    value={encryptedData}
                    onChange={(e) => setEncryptedData(e.target.value)}
                    placeholder={text.encryptedDataPlaceholder}
                    className="w-full h-32 p-3 border rounded-md font-mono text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decrypt-password">{text.password}</Label>
                  <div className="relative">
                    <Input
                      id="decrypt-password"
                      type={showDecryptPassword ? "text" : "password"}
                      placeholder={text.passwordPlaceholder}
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowDecryptPassword(!showDecryptPassword)}
                    >
                      {showDecryptPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{text.processingFile}</p>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <Button 
                  onClick={handleDecrypt} 
                  disabled={!encryptedData || !decryptPassword || isProcessing}
                  className="w-full"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  {text.decrypt}
                </Button>

                {decryptedFile && (
                  <div className="space-y-2">
                    <Label>{text.decryptedFile}</Label>
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                      <span className="font-medium">{decryptedFile.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(decryptedFile.data, decryptedFile.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {text.download}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FileEncryption;