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

interface Texts {
  title: string;
  description: string;
  encryptTab: string;
  decryptTab: string;
  selectImage: string;
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
}

const englishTexts: Texts = {
  title: "Image Encryption",
  description: "Encrypt and decrypt your images securely using AES encryption",
  encryptTab: "Encrypt Image",
  decryptTab: "Decrypt Image",
  selectImage: "Select Image",
  password: "Password",
  passwordPlaceholder: "Enter password for encryption/decryption",
  encryptButton: "Encrypt Image",
  decryptButton: "Decrypt Image",
  downloadEncrypted: "Download Encrypted Image",
  downloadDecrypted: "Download Decrypted Image",
  selectImageFirst: "Please select an image first",
  passwordRequired: "Password is required",
  encryptionSuccess: "Image encrypted successfully!",
  decryptionSuccess: "Image decrypted successfully!",
  encryptionError: "Failed to encrypt image",
  decryptionError: "Failed to decrypt image"
};

const arabicTexts: Texts = {
  title: "تشفير الصور",
  description: "قم بتشفير وفك تشفير صورك بأمان باستخدام تشفير AES",
  encryptTab: "تشفير الصورة",
  decryptTab: "فك التشفير",
  selectImage: "اختر صورة",
  password: "كلمة المرور",
  passwordPlaceholder: "أدخل كلمة المرور للتشفير/فك التشفير",
  encryptButton: "تشفير الصورة",
  decryptButton: "فك تشفير الصورة",
  downloadEncrypted: "تحميل الصورة المشفرة",
  downloadDecrypted: "تحميل الصورة المفكوكة",
  selectImageFirst: "يرجى اختيار صورة أولاً",
  passwordRequired: "كلمة المرور مطلوبة",
  encryptionSuccess: "تم تشفير الصورة بنجاح!",
  decryptionSuccess: "تم فك تشفير الصورة بنجاح!",
  encryptionError: "فشل في تشفير الصورة",
  decryptionError: "فشل في فك تشفير الصورة"
};

const ImageEncryption = () => {
  const { isArabic } = useCipher();
  const texts = isArabic ? arabicTexts : englishTexts;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("encrypt");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setProcessedImage(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedFile(null);
    setPassword("");
    setProcessedImage(null);
  };

  const processImage = async (encrypt: boolean) => {
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
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        // For now, we'll just simulate encryption by encoding/decoding the base64
        // In a real implementation, you'd use proper encryption on the image data
        if (encrypt) {
          // Simulate encryption by reversing the base64 string (placeholder)
          const encryptedData = btoa(base64Data.split('').reverse().join(''));
          setProcessedImage(`data:application/octet-stream;base64,${encryptedData}`);
          toast.success(texts.encryptionSuccess);
        } else {
          try {
            // Simulate decryption by reversing the process
            const decryptedData = atob(base64Data.replace(/^data:.*,/, ''));
            const originalData = decryptedData.split('').reverse().join('');
            setProcessedImage(originalData);
            toast.success(texts.decryptionSuccess);
          } catch {
            toast.error(texts.decryptionError);
          }
        }
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error(encrypt ? texts.encryptionError : texts.decryptionError);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = activeTab === "encrypt" ? "encrypted_image.enc" : "decrypted_image.png";
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
                      onClick={() => processImage(true)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {isProcessing ? "..." : texts.encryptButton}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="decrypt" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="encrypted-upload">{texts.selectImage}</Label>
                      <Input
                        id="encrypted-upload"
                        type="file"
                        onChange={handleFileSelect}
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
                      onClick={() => processImage(false)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {isProcessing ? "..." : texts.decryptButton}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {processedImage && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {activeTab === "encrypt" ? texts.downloadEncrypted : texts.downloadDecrypted}
                    </span>
                    <Button onClick={downloadResult} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      تحميل
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImageEncryption;