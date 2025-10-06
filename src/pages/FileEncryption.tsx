import { useState, useRef } from "react";
import { FileText, Upload, Download, Lock, Unlock, Eye, EyeOff, Copy, Check, X } from "lucide-react";
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDecryptPassword, setShowDecryptPassword] = useState(false);
  const [encryptedData, setEncryptedData] = useState<string>("");
  const [decryptedFile, setDecryptedFile] = useState<{ name: string; data: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const text = isArabic ? {
    title: "تشفير الملفات",
    subtitle: "قم بتشفير وفك تشفير الملفات بأمان تام",
    selectFile: "اختر ملفات",
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
    noFileSelected: "لم يتم اختيار ملفات",
    fileEncrypted: "تم تشفير الملفات بنجاح",
    fileDecrypted: "تم فك تشفير الملف بنجاح",
    processingFile: "جاري معالجة الملفات...",
    invalidData: "بيانات غير صالحة أو كلمة مرور خاطئة",
    dragDrop: "اسحب الملفات هنا أو انقر للاختيار",
    selectedFiles: "الملفات المحددة",
    remove: "إزالة"
  } : {
    title: "File Encryption",
    subtitle: "Encrypt and decrypt files with complete security",
    selectFile: "Select Files",
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
    noFileSelected: "No files selected",
    fileEncrypted: "Files encrypted successfully",
    fileDecrypted: "File decrypted successfully",
    processingFile: "Processing files...",
    invalidData: "Invalid data or wrong password",
    dragDrop: "Drag files here or click to select",
    selectedFiles: "Selected Files",
    remove: "Remove"
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEncrypt = async () => {
    if (selectedFiles.length === 0 || !password) {
      toast.error(isArabic ? "يرجى اختيار ملفات وإدخال كلمة مرور" : "Please select files and enter a password");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      const filesData = await Promise.all(
        selectedFiles.map(file => {
          return new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                type: file.type,
                data: e.target?.result as string
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const encrypted = encryptAES(JSON.stringify(filesData), password);
      
      clearInterval(progressInterval);
      setProgress(100);
      setEncryptedData(encrypted);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        toast.success(text.fileEncrypted);
      }, 500);
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
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{text.dragDrop}</p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>{text.selectedFiles} ({selectedFiles.length})</Label>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm truncate flex-1">
                              {file.name} ({Math.round(file.size / 1024)} KB)
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
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
                  disabled={selectedFiles.length === 0 || !password || isProcessing}
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