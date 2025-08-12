import { useState, useCallback } from "react";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Image, Mic, Video, Download, Upload, Sparkles, Shield, Lock } from "lucide-react";
import { geminiService, getGeminiApiKey, setGeminiApiKey } from "@/utils/gemini";
import { encryptAES, decryptAES } from "@/utils/encryption";

const MultimodalEncryption = () => {
  const { isArabic } = useCipher();
  const { toast } = useToast();

  // State management
  const [apiKey, setApiKeyState] = useState(getGeminiApiKey() || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Input data
  const [textData, setTextData] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Results
  const [generatedKey, setGeneratedKey] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState("");
  
  // Decryption inputs
  const [decryptionKey, setDecryptionKey] = useState("");
  const [encryptedInput, setEncryptedInput] = useState("");

  const text = isArabic ? {
    title: "التشفير متعدد الأنماط",
    description: "استخدم بيانات مختلطة لإنشاء تشفير فائق الأمان بواسطة الذكاء الاصطناعي",
    apiKeyLabel: "مفتاح Gemini API",
    apiKeyPlaceholder: "أدخل مفتاح Gemini API الخاص بك",
    saveKey: "حفظ المفتاح",
    encryptTab: "التشفير",
    decryptTab: "فك التشفير",
    textInput: "النص",
    textPlaceholder: "أدخل النص المراد تشفيره...",
    imageInput: "الصورة",
    audioInput: "الصوت", 
    videoInput: "الفيديو",
    generateKey: "توليد مفتاح ذكي",
    encrypt: "تشفير البيانات",
    generatedKeyLabel: "المفتاح المولد",
    encryptedDataLabel: "البيانات المشفرة",
    decryptionKeyLabel: "مفتاح فك التشفير",
    encryptedDataInput: "البيانات المشفرة",
    decrypt: "فك التشفير",
    decryptedResult: "النتيجة المفكوكة",
    selectFile: "اختر ملف",
    noFileSelected: "لم يتم اختيار ملف",
    processing: "جاري المعالجة...",
    copy: "نسخ",
    download: "تحميل",
    clear: "مسح",
    success: "تم بنجاح",
    error: "خطأ",
    apiKeyRequired: "مفتاح API مطلوب",
    dataRequired: "البيانات مطلوبة",
    keyGenerated: "تم توليد المفتاح بنجاح",
    encryptionComplete: "تم التشفير بنجاح",
    decryptionComplete: "تم فك التشفير بنجاح",
    copied: "تم النسخ",
    invalidKey: "مفتاح غير صحيح",
    multimodalPower: "قوة التشفير متعددة الأنماط",
    aiSecurity: "الأمان بالذكاء الاصطناعي",
    dataTypes: "أنواع البيانات المدعومة"
  } : {
    title: "Multimodal Encryption",
    description: "Use mixed data types to create ultra-secure encryption powered by AI",
    apiKeyLabel: "Gemini API Key",
    apiKeyPlaceholder: "Enter your Gemini API key",
    saveKey: "Save Key",
    encryptTab: "Encrypt",
    decryptTab: "Decrypt",
    textInput: "Text",
    textPlaceholder: "Enter text to encrypt...",
    imageInput: "Image",
    audioInput: "Audio",
    videoInput: "Video",
    generateKey: "Generate Smart Key",
    encrypt: "Encrypt Data",
    generatedKeyLabel: "Generated Key",
    encryptedDataLabel: "Encrypted Data",
    decryptionKeyLabel: "Decryption Key",
    encryptedDataInput: "Encrypted Data",
    decrypt: "Decrypt",
    decryptedResult: "Decrypted Result",
    selectFile: "Select File",
    noFileSelected: "No file selected",
    processing: "Processing...",
    copy: "Copy",
    download: "Download",
    clear: "Clear",
    success: "Success",
    error: "Error",
    apiKeyRequired: "API key required",
    dataRequired: "Data required",
    keyGenerated: "Key generated successfully",
    encryptionComplete: "Encryption completed successfully",
    decryptionComplete: "Decryption completed successfully",
    copied: "Copied to clipboard",
    invalidKey: "Invalid key",
    multimodalPower: "Multimodal Encryption Power",
    aiSecurity: "AI-Powered Security",
    dataTypes: "Supported Data Types"
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: text.error,
        description: text.apiKeyRequired,
        variant: "destructive"
      });
      return;
    }
    
    setGeminiApiKey(apiKey);
    toast({
      title: text.success,
      description: text.apiKeyRequired,
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/... prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateKey = async () => {
    if (!getGeminiApiKey()) {
      toast({
        title: text.error,
        description: text.apiKeyRequired,
        variant: "destructive"
      });
      return;
    }

    if (!textData && !imageFile && !audioFile && !videoFile) {
      toast({
        title: text.error,
        description: text.dataRequired,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(25);
      
      const data: any = {};
      
      if (textData) data.text = textData;
      
      if (imageFile) {
        setProgress(40);
        data.imageBase64 = await convertFileToBase64(imageFile);
      }
      
      if (audioFile) {
        setProgress(60);
        data.audioData = await convertFileToBase64(audioFile);
      }
      
      if (videoFile) {
        setProgress(80);
        data.videoData = await convertFileToBase64(videoFile);
      }

      setProgress(90);
      const key = await geminiService.generateMultimodalKey(data);
      setGeneratedKey(key);
      setProgress(100);

      toast({
        title: text.success,
        description: text.keyGenerated,
      });
    } catch (error) {
      console.error('Error generating key:', error);
      toast({
        title: text.error,
        description: error instanceof Error ? error.message : "فشل في توليد المفتاح",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleEncrypt = () => {
    if (!generatedKey || !textData) {
      toast({
        title: text.error,
        description: text.dataRequired,
        variant: "destructive"
      });
      return;
    }

    try {
      const encrypted = encryptAES(textData, generatedKey);
      setEncryptedData(encrypted);
      toast({
        title: text.success,
        description: text.encryptionComplete,
      });
    } catch (error) {
      toast({
        title: text.error,
        description: "فشل في التشفير",
        variant: "destructive"
      });
    }
  };

  const handleDecrypt = () => {
    if (!decryptionKey || !encryptedInput) {
      toast({
        title: text.error,
        description: text.dataRequired,
        variant: "destructive"
      });
      return;
    }

    try {
      const decrypted = decryptAES(encryptedInput, decryptionKey);
      setDecryptedData(decrypted);
      toast({
        title: text.success,
        description: text.decryptionComplete,
      });
    } catch (error) {
      toast({
        title: text.error,
        description: text.invalidKey,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: text.copied,
        description: "تم النسخ إلى الحافظة",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                <Shield className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                {text.title}
              </h1>
              <p className="text-muted-foreground">{text.description}</p>
            </div>
          </div>
          
          {/* Features overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4 text-center">
                <Lock className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                <h3 className="font-semibold text-sm">{text.multimodalPower}</h3>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-sm">{text.aiSecurity}</h3>
              </CardContent>
            </Card>
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center gap-1 mb-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <Image className="h-4 w-4 text-purple-600" />
                  <Mic className="h-4 w-4 text-purple-600" />
                  <Video className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-sm">{text.dataTypes}</h3>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* API Key Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                {text.apiKeyLabel}
              </CardTitle>
              <CardDescription>
                {isArabic ? "أدخل مفتاح Gemini API لتفعيل الميزات الذكية" : "Enter your Gemini API key to enable AI features"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder={text.apiKeyPlaceholder}
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                  {text.saveKey}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Encryption Interface */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="encrypt" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="encrypt">{text.encryptTab}</TabsTrigger>
                  <TabsTrigger value="decrypt">{text.decryptTab}</TabsTrigger>
                </TabsList>

                <TabsContent value="encrypt" className="space-y-6">
                  {/* Data Inputs */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="text-input" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {text.textInput}
                      </Label>
                      <Textarea
                        id="text-input"
                        placeholder={text.textPlaceholder}
                        value={textData}
                        onChange={(e) => setTextData(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          {text.imageInput}
                        </Label>
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="image-input"
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('image-input')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {text.selectFile}
                          </Button>
                          {imageFile && (
                            <Badge variant="secondary" className="mt-2">
                              {imageFile.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          {text.audioInput}
                        </Label>
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="audio-input"
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('audio-input')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {text.selectFile}
                          </Button>
                          {audioFile && (
                            <Badge variant="secondary" className="mt-2">
                              {audioFile.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          {text.videoInput}
                        </Label>
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="video-input"
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('video-input')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {text.selectFile}
                          </Button>
                          {videoFile && (
                            <Badge variant="secondary" className="mt-2">
                              {videoFile.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin text-violet-600" />
                        <span className="text-sm">{text.processing}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerateKey}
                      disabled={isProcessing || !getGeminiApiKey()}
                      className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {text.generateKey}
                    </Button>
                    <Button
                      onClick={handleEncrypt}
                      disabled={!generatedKey || !textData}
                      variant="outline"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {text.encrypt}
                    </Button>
                  </div>

                  {/* Results */}
                  {generatedKey && (
                    <div className="space-y-4">
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium">{text.generatedKeyLabel}</Label>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <code className="text-sm break-all">{generatedKey}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(generatedKey)}
                            >
                              {text.copy}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {encryptedData && (
                    <div>
                      <Label className="text-sm font-medium">{text.encryptedDataLabel}</Label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <code className="text-sm break-all">{encryptedData}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(encryptedData)}
                          >
                            {text.copy}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="decrypt" className="space-y-4">
                  <div>
                    <Label htmlFor="decryption-key">{text.decryptionKeyLabel}</Label>
                    <Input
                      id="decryption-key"
                      placeholder="أدخل مفتاح فك التشفير..."
                      value={decryptionKey}
                      onChange={(e) => setDecryptionKey(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="encrypted-input">{text.encryptedDataInput}</Label>
                    <Textarea
                      id="encrypted-input"
                      placeholder="أدخل البيانات المشفرة..."
                      value={encryptedInput}
                      onChange={(e) => setEncryptedInput(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleDecrypt}
                    disabled={!decryptionKey || !encryptedInput}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {text.decrypt}
                  </Button>

                  {decryptedData && (
                    <div>
                      <Label className="text-sm font-medium">{text.decryptedResult}</Label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">{decryptedData}</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(decryptedData)}
                          >
                            {text.copy}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MultimodalEncryption;