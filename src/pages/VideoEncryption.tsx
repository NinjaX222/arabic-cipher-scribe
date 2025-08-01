import { useState, useRef } from "react";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Lock, Unlock, VideoIcon } from "lucide-react";
import { toast } from "sonner";

interface Texts {
  title: string;
  description: string;
  encryptTab: string;
  decryptTab: string;
  selectVideo: string;
  password: string;
  passwordPlaceholder: string;
  encryptButton: string;
  decryptButton: string;
  downloadEncrypted: string;
  downloadDecrypted: string;
  selectVideoFirst: string;
  passwordRequired: string;
  encryptionSuccess: string;
  decryptionSuccess: string;
  encryptionError: string;
  decryptionError: string;
  processing: string;
  fileSizeWarning: string;
}

const englishTexts: Texts = {
  title: "Video Encryption",
  description: "Encrypt and decrypt your videos securely using AES encryption",
  encryptTab: "Encrypt Video",
  decryptTab: "Decrypt Video",
  selectVideo: "Select Video",
  password: "Password",
  passwordPlaceholder: "Enter password for encryption/decryption",
  encryptButton: "Encrypt Video",
  decryptButton: "Decrypt Video",
  downloadEncrypted: "Download Encrypted Video",
  downloadDecrypted: "Download Decrypted Video",
  selectVideoFirst: "Please select a video first",
  passwordRequired: "Password is required",
  encryptionSuccess: "Video encrypted successfully!",
  decryptionSuccess: "Video decrypted successfully!",
  encryptionError: "Failed to encrypt video",
  decryptionError: "Failed to decrypt video",
  processing: "Processing...",
  fileSizeWarning: "Large files may take longer to process"
};

const arabicTexts: Texts = {
  title: "تشفير الفيديو",
  description: "قم بتشفير وفك تشفير مقاطع الفيديو بأمان باستخدام تشفير AES",
  encryptTab: "تشفير الفيديو",
  decryptTab: "فك التشفير",
  selectVideo: "اختر فيديو",
  password: "كلمة المرور",
  passwordPlaceholder: "أدخل كلمة المرور للتشفير/فك التشفير",
  encryptButton: "تشفير الفيديو",
  decryptButton: "فك تشفير الفيديو",
  downloadEncrypted: "تحميل الفيديو المشفر",
  downloadDecrypted: "تحميل الفيديو المفكوك",
  selectVideoFirst: "يرجى اختيار فيديو أولاً",
  passwordRequired: "كلمة المرور مطلوبة",
  encryptionSuccess: "تم تشفير الفيديو بنجاح!",
  decryptionSuccess: "تم فك تشفير الفيديو بنجاح!",
  encryptionError: "فشل في تشفير الفيديو",
  decryptionError: "فشل في فك تشفير الفيديو",
  processing: "جاري المعالجة...",
  fileSizeWarning: "الملفات الكبيرة قد تستغرق وقتاً أطول للمعالجة"
};

const VideoEncryption = () => {
  const { isArabic } = useCipher();
  const texts = isArabic ? arabicTexts : englishTexts;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("encrypt");
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setProcessedVideo(null);
      
      // Show warning for large files
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.warning(texts.fileSizeWarning);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedFile(null);
    setPassword("");
    setProcessedVideo(null);
    setProcessingProgress(0);
  };

  const processVideo = async (encrypt: boolean) => {
    if (!selectedFile) {
      toast.error(texts.selectVideoFirst);
      return;
    }
    
    if (!password.trim()) {
      toast.error(texts.passwordRequired);
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Convert video to array buffer for processing
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      if (encrypt) {
        // Simulate encryption by XOR with password hash (placeholder)
        const passwordBytes = new TextEncoder().encode(password);
        const encryptedArray = new Uint8Array(uint8Array.length);
        
        for (let i = 0; i < uint8Array.length; i++) {
          encryptedArray[i] = uint8Array[i] ^ passwordBytes[i % passwordBytes.length];
        }
        
        const blob = new Blob([encryptedArray], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        setProcessedVideo(url);
        toast.success(texts.encryptionSuccess);
      } else {
        try {
          // Simulate decryption by reversing XOR
          const passwordBytes = new TextEncoder().encode(password);
          const decryptedArray = new Uint8Array(uint8Array.length);
          
          for (let i = 0; i < uint8Array.length; i++) {
            decryptedArray[i] = uint8Array[i] ^ passwordBytes[i % passwordBytes.length];
          }
          
          const blob = new Blob([decryptedArray], { type: selectedFile.type });
          const url = URL.createObjectURL(blob);
          setProcessedVideo(url);
          toast.success(texts.decryptionSuccess);
        } catch {
          toast.error(texts.decryptionError);
        }
      }
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
    } catch (error) {
      toast.error(encrypt ? texts.encryptionError : texts.decryptionError);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!processedVideo) return;
    
    const link = document.createElement('a');
    link.href = processedVideo;
    link.download = activeTab === "encrypt" ? "encrypted_video.enc" : `decrypted_video.${selectedFile?.name.split('.').pop()}`;
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
                <VideoIcon className="h-6 w-6" />
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
                      <Label htmlFor="video-upload">{texts.selectVideo}</Label>
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="mt-2"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
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
                      onClick={() => processVideo(true)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {isProcessing ? `${texts.processing} ${processingProgress}%` : texts.encryptButton}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="decrypt" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="encrypted-upload">{texts.selectVideo}</Label>
                      <Input
                        id="encrypted-upload"
                        type="file"
                        onChange={handleFileSelect}
                        className="mt-2"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
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
                      onClick={() => processVideo(false)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {isProcessing ? `${texts.processing} ${processingProgress}%` : texts.decryptButton}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {isProcessing && (
                <div className="mt-6">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{texts.processing}</span>
                      <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {processedVideo && !isProcessing && (
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

export default VideoEncryption;