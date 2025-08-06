import { useState, useEffect } from "react";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Key, 
  FileText, 
  Sparkles, 
  Shield, 
  RefreshCw, 
  Download, 
  Upload,
  Clock,
  HardDrive,
  FileType,
  Hash,
  Copy,
  Trash2
} from "lucide-react";
import { geminiService, getGeminiApiKey, setGeminiApiKey } from "@/utils/gemini";
import { encryptFile, decryptFile } from "@/utils/encryption";

interface IntelligentKey {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  key: string;
  timestamp: Date;
  complexity: 'low' | 'medium' | 'high' | 'ultra';
  characteristics: string[];
}

const IntelligentKeyManagement = () => {
  const { isArabic } = useCipher();
  const { toast } = useToast();

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // File handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null);
  
  // Key management
  const [intelligentKeys, setIntelligentKeys] = useState<IntelligentKey[]>([]);
  const [currentKey, setCurrentKey] = useState<IntelligentKey | null>(null);
  
  // Decryption
  const [decryptionKey, setDecryptionKey] = useState("");
  const [encryptedInput, setEncryptedInput] = useState("");
  const [originalFileName, setOriginalFileName] = useState("");

  const text = isArabic ? {
    title: "إدارة المفاتيح الذكية",
    description: "نظام متقدم لتوليد وإدارة مفاتيح التشفير باستخدام الذكاء الاصطناعي",
    apiKeyLabel: "مفتاح Gemini API",
    apiKeyPlaceholder: "أدخل مفتاح Gemini API الخاص بك",
    saveKey: "حفظ المفتاح",
    selectFile: "اختر ملف",
    noFileSelected: "لم يتم اختيار ملف",
    generateKey: "توليد مفتاح ذكي",
    encryptFile: "تشفير الملف",
    keyGenerated: "تم توليد المفتاح",
    fileEncrypted: "تم تشفير الملف",
    download: "تحميل",
    copy: "نسخ",
    delete: "حذف",
    processing: "جاري المعالجة...",
    fileName: "اسم الملف",
    fileSize: "حجم الملف",
    fileType: "نوع الملف",
    complexity: "مستوى التعقيد",
    characteristics: "الخصائص",
    generatedAt: "تاريخ التوليد",
    encryptedData: "البيانات المشفرة",
    decryptionSection: "فك التشفير",
    decryptionKey: "مفتاح فك التشفير",
    encryptedDataInput: "البيانات المشفرة",
    originalFileName: "اسم الملف الأصلي",
    decrypt: "فك التشفير",
    decryptedFile: "الملف المفكوك",
    refreshKey: "تجديد المفتاح",
    keyHistory: "تاريخ المفاتيح",
    noKeys: "لا توجد مفاتيح محفوظة",
    low: "منخفض",
    medium: "متوسط",
    high: "عالي",
    ultra: "فائق",
    success: "نجح",
    error: "خطأ",
    copied: "تم النسخ",
    apiKeyRequired: "مفتاح API مطلوب",
    fileRequired: "ملف مطلوب",
    keyRefreshed: "تم تجديد المفتاح",
    fileDecrypted: "تم فك تشفير الملف",
    invalidData: "بيانات غير صحيحة",
    intelligentFeatures: "الميزات الذكية",
    aiPowered: "مدعوم بالذكاء الاصطناعي",
    secureStorage: "تخزين آمن"
  } : {
    title: "Intelligent Key Management",
    description: "Advanced system for generating and managing encryption keys using AI",
    apiKeyLabel: "Gemini API Key",
    apiKeyPlaceholder: "Enter your Gemini API key",
    saveKey: "Save Key",
    selectFile: "Select File",
    noFileSelected: "No file selected",
    generateKey: "Generate Smart Key",
    encryptFile: "Encrypt File",
    keyGenerated: "Key Generated",
    fileEncrypted: "File Encrypted",
    download: "Download",
    copy: "Copy",
    delete: "Delete",
    processing: "Processing...",
    fileName: "File Name",
    fileSize: "File Size",
    fileType: "File Type",
    complexity: "Complexity Level",
    characteristics: "Characteristics",
    generatedAt: "Generated At",
    encryptedData: "Encrypted Data",
    decryptionSection: "Decryption",
    decryptionKey: "Decryption Key",
    encryptedDataInput: "Encrypted Data",
    originalFileName: "Original File Name",
    decrypt: "Decrypt",
    decryptedFile: "Decrypted File",
    refreshKey: "Refresh Key",
    keyHistory: "Key History",
    noKeys: "No saved keys",
    low: "Low",
    medium: "Medium",
    high: "High",
    ultra: "Ultra",
    success: "Success",
    error: "Error",
    copied: "Copied",
    apiKeyRequired: "API key required",
    fileRequired: "File required",
    keyRefreshed: "Key refreshed",
    fileDecrypted: "File decrypted",
    invalidData: "Invalid data",
    intelligentFeatures: "Intelligent Features",
    aiPowered: "AI Powered",
    secureStorage: "Secure Storage"
  };

  // Load saved keys on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('intelligent_keys');
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys).map((key: any) => ({
          ...key,
          timestamp: new Date(key.timestamp)
        }));
        setIntelligentKeys(keys);
      } catch (error) {
        console.error('Error loading keys:', error);
      }
    }
  }, []);

  // Save keys when they change
  useEffect(() => {
    localStorage.setItem('intelligent_keys', JSON.stringify(intelligentKeys));
  }, [intelligentKeys]);


  const getComplexityLevel = (key: string): 'low' | 'medium' | 'high' | 'ultra' => {
    const hasNumbers = /\d/.test(key);
    const hasLowerCase = /[a-z]/.test(key);
    const hasUpperCase = /[A-Z]/.test(key);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(key);
    
    const complexity = [hasNumbers, hasLowerCase, hasUpperCase, hasSpecialChars].filter(Boolean).length;
    
    if (key.length >= 64 && complexity === 4) return 'ultra';
    if (key.length >= 32 && complexity >= 3) return 'high';
    if (key.length >= 16 && complexity >= 2) return 'medium';
    return 'low';
  };

  const getFileCharacteristics = (file: File): string[] => {
    const characteristics = [];
    
    if (file.size > 10 * 1024 * 1024) characteristics.push("Large File");
    else if (file.size < 1024) characteristics.push("Small File");
    
    if (file.type.startsWith('image/')) characteristics.push("Image");
    else if (file.type.startsWith('video/')) characteristics.push("Video");
    else if (file.type.startsWith('audio/')) characteristics.push("Audio");
    else if (file.type.includes('text')) characteristics.push("Text");
    else characteristics.push("Binary");
    
    if (file.name.includes('.')) {
      const extension = file.name.split('.').pop()?.toUpperCase();
      if (extension) characteristics.push(extension);
    }
    
    return characteristics;
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

    if (!selectedFile) {
      toast({
        title: text.error,
        description: text.fileRequired,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(25);
      
      // Prepare file data for analysis
      const fileData = {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        content: selectedFile.type.startsWith('text/') ? await selectedFile.text() : undefined
      };

      setProgress(50);
      
      // Generate intelligent key using Gemini
      const key = await geminiService.generateIntelligentKey(fileData);
      
      setProgress(75);
      
      // Create intelligent key object
      const intelligentKey: IntelligentKey = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        key,
        timestamp: new Date(),
        complexity: getComplexityLevel(key),
        characteristics: getFileCharacteristics(selectedFile)
      };

      setProgress(90);
      
      // Save to state and localStorage
      setIntelligentKeys(prev => [intelligentKey, ...prev]);
      setCurrentKey(intelligentKey);
      
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

  const handleEncryptFile = async () => {
    if (!currentKey || !selectedFile) {
      toast({
        title: text.error,
        description: text.fileRequired,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      const encrypted = await encryptFile(selectedFile, currentKey.key);
      setEncryptedData(encrypted);
      
      toast({
        title: text.success,
        description: text.fileEncrypted,
      });
    } catch (error) {
      toast({
        title: text.error,
        description: "فشل في تشفير الملف",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = () => {
    if (!decryptionKey || !encryptedInput || !originalFileName) {
      toast({
        title: text.error,
        description: text.invalidData,
        variant: "destructive"
      });
      return;
    }

    try {
      const decrypted = decryptFile(encryptedInput, decryptionKey, originalFileName);
      setDecryptedBlob(decrypted);
      
      toast({
        title: text.success,
        description: text.fileDecrypted,
      });
    } catch (error) {
      toast({
        title: text.error,
        description: text.invalidData,
        variant: "destructive"
      });
    }
  };

  const handleRefreshKey = async (keyId: string) => {
    const key = intelligentKeys.find(k => k.id === keyId);
    if (!key || !getGeminiApiKey()) return;

    try {
      const fileData = {
        name: key.fileName,
        size: key.fileSize,
        type: key.fileType
      };

      const newKey = await geminiService.generateIntelligentKey(fileData);
      
      setIntelligentKeys(prev => prev.map(k => 
        k.id === keyId 
          ? { ...k, key: newKey, timestamp: new Date(), complexity: getComplexityLevel(newKey) }
          : k
      ));

      toast({
        title: text.success,
        description: text.keyRefreshed,
      });
    } catch (error) {
      toast({
        title: text.error,
        description: "فشل في تجديد المفتاح",
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

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'ultra': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full flex items-center justify-center">
                <Key className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {text.title}
              </h1>
              <p className="text-muted-foreground">{text.description}</p>
            </div>
          </div>
          
          {/* Features overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                <h3 className="font-semibold text-sm">{text.intelligentFeatures}</h3>
              </CardContent>
            </Card>
            <Card className="border-teal-200 dark:border-teal-800">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                <h3 className="font-semibold text-sm">{text.aiPowered}</h3>
              </CardContent>
            </Card>
            <Card className="border-cyan-200 dark:border-cyan-800">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-cyan-600" />
                <h3 className="font-semibold text-sm">{text.secureStorage}</h3>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Encryption Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-emerald-600" />
                  {text.generateKey}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Selection */}
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {text.selectFile}
                  </Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-input"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {text.selectFile}
                    </Button>
                    {selectedFile && (
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileType className="h-4 w-4" />
                          <span className="text-sm">{selectedFile.name}</span>
                          <Badge variant="secondary">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 animate-pulse text-emerald-600" />
                      <span className="text-sm">{text.processing}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateKey}
                    disabled={isProcessing || !selectedFile || !getGeminiApiKey()}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {text.generateKey}
                  </Button>
                  <Button
                    onClick={handleEncryptFile}
                    disabled={!currentKey || !selectedFile}
                    variant="outline"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {text.encryptFile}
                  </Button>
                </div>

                {/* Current Key Display */}
                {currentKey && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{text.keyGenerated}</h4>
                      <Badge className={getComplexityColor(currentKey.complexity)}>
                        {text[currentKey.complexity as keyof typeof text]}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{currentKey.fileName}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentKey.characteristics.map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                      <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                        {currentKey.key}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(currentKey.key)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {text.copy}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRefreshKey(currentKey.id)}
                          disabled={!getGeminiApiKey()}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {text.refreshKey}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Encrypted Data Display */}
                {encryptedData && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{text.encryptedData}</h4>
                    <div className="p-2 bg-muted rounded text-xs font-mono break-all max-h-20 overflow-y-auto">
                      {encryptedData}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(encryptedData)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {text.copy}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Decryption Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-cyan-600" />
                  {text.decryptionSection}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="decryption-key">{text.decryptionKey}</Label>
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
                  <textarea
                    id="encrypted-input"
                    placeholder="أدخل البيانات المشفرة..."
                    value={encryptedInput}
                    onChange={(e) => setEncryptedInput(e.target.value)}
                    rows={4}
                    className="mt-2 w-full p-3 border rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="original-filename">{text.originalFileName}</Label>
                  <Input
                    id="original-filename"
                    placeholder="مثال: document.pdf"
                    value={originalFileName}
                    onChange={(e) => setOriginalFileName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleDecrypt}
                  disabled={!decryptionKey || !encryptedInput || !originalFileName}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {text.decrypt}
                </Button>

                {decryptedBlob && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{text.decryptedFile}</h4>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{originalFileName}</span>
                      <Badge variant="secondary">
                        {(decryptedBlob.size / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => downloadBlob(decryptedBlob, originalFileName)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {text.download}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Key History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                {text.keyHistory}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {intelligentKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {text.noKeys}
                </div>
              ) : (
                <div className="space-y-4">
                  {intelligentKeys.map((key) => (
                    <div key={key.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{key.fileName}</span>
                          <Badge className={getComplexityColor(key.complexity)}>
                            {text[key.complexity as keyof typeof text]}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefreshKey(key.id)}
                            disabled={!getGeminiApiKey()}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIntelligentKeys(prev => prev.filter(k => k.id !== key.id))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {(key.fileSize / 1024).toFixed(1)} KB
                        </div>
                        <div className="flex items-center gap-1">
                          <FileType className="h-3 w-3" />
                          {key.fileType.split('/')[1]?.toUpperCase() || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {key.timestamp.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {key.key.length} chars
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {key.characteristics.map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                      <div className="p-2 bg-muted rounded text-xs font-mono break-all max-h-16 overflow-y-auto">
                        {key.key}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntelligentKeyManagement;