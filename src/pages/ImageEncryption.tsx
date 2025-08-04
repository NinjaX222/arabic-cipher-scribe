import { useState, useRef } from "react";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Lock, Unlock, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { encryptFile, decryptFile } from "@/utils/encryption";

interface Texts {
  title: string;
  description: string;
  encryptTab: string;
  decryptTab: string;
  selectImage: string;
  selectEncryptedFile: string;
  password: string;
  passwordPlaceholder: string;
  encryptButton: string;
  decryptButton: string;
  downloadEncrypted: string;
  downloadDecrypted: string;
  selectImageFirst: string;
  passwordRequired: string;
  encryptionSuccess: string;
  decryptionSuccess: string;
  encryptionError: string;
  decryptionError: string;
  processing: string;
  pasteEncryptedData: string;
  encryptedDataPlaceholder: string;
  fileName: string;
}

const englishTexts: Texts = {
  title: "Image Encryption",
  description: "Encrypt and decrypt your images securely using AES encryption",
  encryptTab: "Encrypt Image",
  decryptTab: "Decrypt Image",
  selectImage: "Select Image",
  selectEncryptedFile: "Select Encrypted File or Paste Data",
  password: "Password",
  passwordPlaceholder: "Enter password for encryption/decryption",
  encryptButton: "Encrypt Image",
  decryptButton: "Decrypt Image",
  downloadEncrypted: "Download Encrypted Data",
  downloadDecrypted: "Download Decrypted Image",
  selectImageFirst: "Please select an image first",
  passwordRequired: "Password is required",
  encryptionSuccess: "Image encrypted successfully!",
  decryptionSuccess: "Image decrypted successfully!",
  encryptionError: "Failed to encrypt image",
  decryptionError: "Failed to decrypt image",
  processing: "Processing...",
  pasteEncryptedData: "Or paste encrypted data:",
  encryptedDataPlaceholder: "Paste encrypted image data here...",
  fileName: "Original file name:"
};

const arabicTexts: Texts = {
  title: "تشفير الصور",
  description: "قم بتشفير وفك تشفير صورك بأمان باستخدام تشفير AES",
  encryptTab: "تشفير الصورة",
  decryptTab: "فك التشفير",
  selectImage: "اختر صورة",
  selectEncryptedFile: "اختر ملف مشفر أو الصق البيانات",
  password: "كلمة المرور",
  passwordPlaceholder: "أدخل كلمة المرور للتشفير/فك التشفير",
  encryptButton: "تشفير الصورة",
  decryptButton: "فك تشفير الصورة",
  downloadEncrypted: "تحميل البيانات المشفرة",
  downloadDecrypted: "تحميل الصورة المفكوكة",
  selectImageFirst: "يرجى اختيار صورة أولاً",
  passwordRequired: "كلمة المرور مطلوبة",
  encryptionSuccess: "تم تشفير الصورة بنجاح!",
  decryptionSuccess: "تم فك تشفير الصورة بنجاح!",
  encryptionError: "فشل في تشفير الصورة",
  decryptionError: "فشل في فك تشفير الصورة",
  processing: "جاري المعالجة...",
  pasteEncryptedData: "أو الصق البيانات المشفرة:",
  encryptedDataPlaceholder: "الصق بيانات الصورة المشفرة هنا...",
  fileName: "اسم الملف الأصلي:"
};

const ImageEncryption = () => {
  const { isArabic } = useCipher();
  const texts = isArabic ? arabicTexts : englishTexts;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [encryptedDataInput, setEncryptedDataInput] = useState("");
  const [decryptedImageUrl, setDecryptedImageUrl] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("encrypt");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const encryptedFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setOriginalFileName(file.name);
    }
  };

  const handleEncryptedFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEncryptedDataInput(content);
      };
      reader.readAsText(file);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedFile(null);
    setPassword("");
    setEncryptedData("");
    setEncryptedDataInput("");
    setDecryptedImageUrl(null);
    setOriginalFileName("");
  };

  const encryptImage = async () => {
    if (!selectedFile) {
      toast.error(texts.selectImageFirst);
      return;
    }
    
    if (!password.trim()) {
      toast.error(texts.passwordRequired);
      return;
    }

    setIsProcessing(true);
    
    try {
      const encrypted = await encryptFile(selectedFile, password);
      setEncryptedData(encrypted);
      toast.success(texts.encryptionSuccess);
    } catch (error) {
      console.error('Encryption error:', error);
      toast.error(texts.encryptionError);
    } finally {
      setIsProcessing(false);
    }
  };

  const decryptImage = async () => {
    const dataToDecrypt = encryptedDataInput.trim();
    
    if (!dataToDecrypt) {
      toast.error("Please select an encrypted file or paste encrypted data");
      return;
    }
    
    if (!password.trim()) {
      toast.error(texts.passwordRequired);
      return;
    }

    setIsProcessing(true);
    
    try {
      const decryptedBlob = decryptFile(dataToDecrypt, password, originalFileName || "decrypted_image.png");
      const url = URL.createObjectURL(decryptedBlob);
      setDecryptedImageUrl(url);
      toast.success(texts.decryptionSuccess);
    } catch (error) {
      console.error('Decryption error:', error);
      toast.error(texts.decryptionError);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadEncryptedData = () => {
    if (!encryptedData) return;
    
    const blob = new Blob([encryptedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${originalFileName || 'image'}_encrypted.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadDecryptedImage = () => {
    if (!decryptedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = decryptedImageUrl;
    link.download = originalFileName || 'decrypted_image.png';
    link.click();
  };

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <ImageIcon className="h-6 w-6" />
                {texts.title}
              </CardTitle>
              <CardDescription>{texts.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="encrypt" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {texts.encryptTab}
                  </TabsTrigger>
                  <TabsTrigger value="decrypt" className="flex items-center gap-2">
                    <Unlock className="h-4 w-4" />
                    {texts.decryptTab}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="encrypt" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image-upload">{texts.selectImage}</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="mt-2"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="password">{texts.password}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={texts.passwordPlaceholder}
                        className="mt-2"
                      />
                    </div>
                    
                    <Button 
                      onClick={encryptImage}
                      disabled={isProcessing || !selectedFile || !password}
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {isProcessing ? texts.processing : texts.encryptButton}
                    </Button>

                    {encryptedData && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{texts.downloadEncrypted}</span>
                          <Button onClick={downloadEncryptedData} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            {isArabic ? "تحميل" : "Download"}
                          </Button>
                        </div>
                        <textarea 
                          className="w-full h-20 p-2 text-xs bg-background border rounded resize-none"
                          value={encryptedData}
                          readOnly
                          placeholder="Encrypted data will appear here..."
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="decrypt" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="encrypted-upload">{texts.selectEncryptedFile}</Label>
                      <Input
                        id="encrypted-upload"
                        type="file"
                        accept=".txt"
                        onChange={handleEncryptedFileSelect}
                        ref={encryptedFileInputRef}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="encrypted-data">{texts.pasteEncryptedData}</Label>
                      <textarea
                        id="encrypted-data"
                        value={encryptedDataInput}
                        onChange={(e) => setEncryptedDataInput(e.target.value)}
                        placeholder={texts.encryptedDataPlaceholder}
                        className="w-full h-32 p-3 text-sm border rounded-lg resize-none mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="original-filename">{texts.fileName}</Label>
                      <Input
                        id="original-filename"
                        type="text"
                        value={originalFileName}
                        onChange={(e) => setOriginalFileName(e.target.value)}
                        placeholder="image.jpg"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="decrypt-password">{texts.password}</Label>
                      <Input
                        id="decrypt-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={texts.passwordPlaceholder}
                        className="mt-2"
                      />
                    </div>
                    
                    <Button 
                      onClick={decryptImage}
                      disabled={isProcessing || !encryptedDataInput || !password}
                      className="w-full"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {isProcessing ? texts.processing : texts.decryptButton}
                    </Button>

                    {decryptedImageUrl && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium">{texts.downloadDecrypted}</span>
                          <Button onClick={downloadDecryptedImage} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            {isArabic ? "تحميل" : "Download"}
                          </Button>
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={decryptedImageUrl} 
                            alt="Decrypted" 
                            className="max-w-full max-h-64 object-contain rounded-lg border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImageEncryption;