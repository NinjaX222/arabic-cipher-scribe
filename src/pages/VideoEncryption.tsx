import { useState, useRef, useEffect } from "react";
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
import { encryptFile, decryptFile } from "@/utils/encryption";
import { logActivity } from "@/utils/activityLogger";

interface Texts {
  title: string;
  description: string;
  encryptTab: string;
  decryptTab: string;
  selectVideo: string;
  selectEncryptedFile: string;
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
  pasteEncryptedData: string;
  encryptedDataPlaceholder: string;
  fileName: string;
}

const englishTexts: Texts = {
  title: "Video Encryption",
  description: "Encrypt and decrypt your videos securely using AES encryption",
  encryptTab: "Encrypt Video",
  decryptTab: "Decrypt Video",
  selectVideo: "Select Video",
  selectEncryptedFile: "Select Encrypted File or Paste Data",
  password: "Password",
  passwordPlaceholder: "Enter password for encryption/decryption",
  encryptButton: "Encrypt Video",
  decryptButton: "Decrypt Video",
  downloadEncrypted: "Download Encrypted Data",
  downloadDecrypted: "Download Decrypted Video",
  selectVideoFirst: "Please select a video first",
  passwordRequired: "Password is required",
  encryptionSuccess: "Video encrypted successfully!",
  decryptionSuccess: "Video decrypted successfully!",
  encryptionError: "Failed to encrypt video",
  decryptionError: "Failed to decrypt video",
  processing: "Processing...",
  fileSizeWarning: "Large files may take longer to process",
  pasteEncryptedData: "Or paste encrypted data:",
  encryptedDataPlaceholder: "Paste encrypted video data here...",
  fileName: "Original file name:"
};

const arabicTexts: Texts = {
  title: "تشفير الفيديو",
  description: "قم بتشفير وفك تشفير مقاطع الفيديو بأمان باستخدام تشفير AES",
  encryptTab: "تشفير الفيديو",
  decryptTab: "فك التشفير",
  selectVideo: "اختر فيديو",
  selectEncryptedFile: "اختر ملف مشفر أو الصق البيانات",
  password: "كلمة المرور",
  passwordPlaceholder: "أدخل كلمة المرور للتشفير/فك التشفير",
  encryptButton: "تشفير الفيديو",
  decryptButton: "فك تشفير الفيديو",
  downloadEncrypted: "تحميل البيانات المشفرة",
  downloadDecrypted: "تحميل الفيديو المفكوك",
  selectVideoFirst: "يرجى اختيار فيديو أولاً",
  passwordRequired: "كلمة المرور مطلوبة",
  encryptionSuccess: "تم تشفير الفيديو بنجاح!",
  decryptionSuccess: "تم فك تشفير الفيديو بنجاح!",
  encryptionError: "فشل في تشفير الفيديو",
  decryptionError: "فشل في فك تشفير الفيديو",
  processing: "جاري المعالجة...",
  fileSizeWarning: "الملفات الكبيرة قد تستغرق وقتاً أطول للمعالجة",
  pasteEncryptedData: "أو الصق البيانات المشفرة:",
  encryptedDataPlaceholder: "الصق بيانات الفيديو المشفرة هنا...",
  fileName: "اسم الملف الأصلي:"
};

const VideoEncryption = () => {
  const { isArabic } = useCipher();
  const texts = isArabic ? arabicTexts : englishTexts;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [encryptedDataInput, setEncryptedDataInput] = useState("");
  const [decryptedVideoUrl, setDecryptedVideoUrl] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("encrypt");
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const encryptedFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logActivity({
      actionType: 'encrypt',
      resourceType: 'video',
      resourceName: 'Video Encryption Page'
    });
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setOriginalFileName(file.name);
      
      // Show warning for large files
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.warning(texts.fileSizeWarning);
      }
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
    setDecryptedVideoUrl(null);
    setOriginalFileName("");
    setProcessingProgress(0);
  };

  const encryptVideo = async () => {
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

      const encrypted = await encryptFile(selectedFile, password);
      setEncryptedData(encrypted);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      await logActivity({
        actionType: 'encrypt',
        resourceType: 'video',
        resourceName: selectedFile.name,
        status: 'success'
      });
      toast.success(texts.encryptionSuccess);
    } catch (error) {
      console.error('Encryption error:', error);
      await logActivity({
        actionType: 'encrypt',
        resourceType: 'video',
        resourceName: selectedFile?.name || 'Video',
        status: 'failed'
      });
      toast.error(texts.encryptionError);
    } finally {
      setIsProcessing(false);
    }
  };

  const decryptVideo = async () => {
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

      const decryptedBlob = decryptFile(dataToDecrypt, password, originalFileName || "decrypted_video.mp4");
      const url = URL.createObjectURL(decryptedBlob);
      setDecryptedVideoUrl(url);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      await logActivity({
        actionType: 'decrypt',
        resourceType: 'video',
        resourceName: originalFileName || 'Video',
        status: 'success'
      });
      toast.success(texts.decryptionSuccess);
    } catch (error) {
      console.error('Decryption error:', error);
      await logActivity({
        actionType: 'decrypt',
        resourceType: 'video',
        resourceName: originalFileName || 'Video',
        status: 'failed'
      });
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
    link.download = `${originalFileName || 'video'}_encrypted.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadDecryptedVideo = () => {
    if (!decryptedVideoUrl) return;
    
    const link = document.createElement('a');
    link.href = decryptedVideoUrl;
    link.download = originalFileName || 'decrypted_video.mp4';
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
                      onClick={encryptVideo}
                      disabled={isProcessing || !selectedFile || !password}
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {isProcessing ? `${texts.processing} ${processingProgress}%` : texts.encryptButton}
                    </Button>

                    {encryptedData && !isProcessing && (
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
                          value={encryptedData.substring(0, 200) + "..."}
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
                        placeholder="video.mp4"
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
                      onClick={decryptVideo}
                      disabled={isProcessing || !encryptedDataInput || !password}
                      className="w-full"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {isProcessing ? `${texts.processing} ${processingProgress}%` : texts.decryptButton}
                    </Button>

                    {decryptedVideoUrl && !isProcessing && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium">{texts.downloadDecrypted}</span>
                          <Button onClick={downloadDecryptedVideo} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            {isArabic ? "تحميل" : "Download"}
                          </Button>
                        </div>
                        <div className="flex justify-center">
                          <video 
                            src={decryptedVideoUrl} 
                            controls 
                            className="max-w-full max-h-64 rounded-lg border"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}
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
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoEncryption;