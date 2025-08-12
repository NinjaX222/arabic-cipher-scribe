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
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Zap, 
  Clock, 
  BarChart3, 
  TrendingUp,
  RefreshCw,
  Sparkles,
  Target,
  Activity,
  AlertCircle
} from "lucide-react";
import { geminiService, getGeminiApiKey, setGeminiApiKey } from "@/utils/gemini";

interface SecurityMetrics {
  encryptionTimes: number[];
  keySizes: number[];
  algorithms: string[];
  failures: number;
  totalOperations: number;
  averageTime: number;
  successRate: number;
}

interface ThreatAnalysis {
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  recommendations: string[];
  shouldChangeAlgorithm: boolean;
  newAlgorithm?: string;
}

interface PatternAnalysis {
  suspiciousActivity: boolean;
  patterns: string[];
  riskLevel: 'low' | 'medium' | 'high';
  actions: string[];
}

const SecurityAnalysis = () => {
  const { isArabic } = useCipher();
  const { toast } = useToast();

  // State management
  const [apiKey, setApiKeyState] = useState(getGeminiApiKey() || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false);
  
  // Security data
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    encryptionTimes: [120, 145, 132, 156, 128, 139, 142],
    keySizes: [256, 256, 512, 256, 1024, 256, 512],
    algorithms: ['AES', 'AES', 'RSA', 'AES', 'RSA', 'AES', 'AES'],
    failures: 2,
    totalOperations: 25,
    averageTime: 138,
    successRate: 92
  });
  
  const [threatAnalysis, setThreatAnalysis] = useState<ThreatAnalysis | null>(null);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  
  // Manual input for testing
  const [customAlgorithm, setCustomAlgorithm] = useState("AES-256");
  const [customKeyLength, setCustomKeyLength] = useState("256");
  const [customDataSize, setCustomDataSize] = useState("1024");
  const [customEncryptionTime, setCustomEncryptionTime] = useState("145");

  const text = isArabic ? {
    title: "تحليل الأمان واكتشاف التهديدات",
    description: "نظام مراقبة ذكي لاكتشاف نقاط الضعف والتهديدات في عمليات التشفير",
    apiKeyLabel: "مفتاح Gemini API",
    apiKeyPlaceholder: "أدخل مفتاح Gemini API الخاص بك",
    saveKey: "حفظ المفتاح",
    realTimeMonitoring: "المراقبة المباشرة",
    startMonitoring: "بدء المراقبة",
    stopMonitoring: "إيقاف المراقبة",
    analyzeSecurity: "تحليل الأمان",
    analyzePatterns: "تحليل الأنماط",
    securityMetrics: "مقاييس الأمان",
    threatAnalysis: "تحليل التهديدات",
    patternAnalysis: "تحليل الأنماط",
    customTest: "اختبار مخصص",
    algorithm: "الخوارزمية",
    keyLength: "طول المفتاح (بت)",
    dataSize: "حجم البيانات (بايت)",
    encryptionTime: "وقت التشفير (مللي ثانية)",
    runCustomTest: "تشغيل الاختبار",
    totalOperations: "إجمالي العمليات",
    successRate: "معدل النجاح",
    averageTime: "متوسط الوقت",
    failures: "الإخفاقات",
    securityLevel: "مستوى الأمان",
    threats: "التهديدات",
    recommendations: "التوصيات",
    shouldChangeAlgorithm: "يجب تغيير الخوارزمية",
    newAlgorithm: "خوارزمية مقترحة",
    suspiciousActivity: "نشاط مشبوه",
    patterns: "الأنماط المكتشفة",
    riskLevel: "مستوى الخطر",
    actions: "الإجراءات المطلوبة",
    analyzing: "جاري التحليل...",
    success: "نجح",
    error: "خطأ",
    apiKeyRequired: "مفتاح API مطلوب",
    analysisComplete: "اكتمل التحليل",
    noThreats: "لم يتم اكتشاف تهديدات",
    noPatterns: "لم يتم اكتشاف أنماط مشبوهة",
    low: "منخفض",
    medium: "متوسط",
    high: "عالي",
    critical: "حرج",
    yes: "نعم",
    no: "لا",
    monitoring: "مراقب",
    active: "نشط",
    inactive: "غير نشط",
    securityStatus: "حالة الأمان",
    lastUpdate: "آخر تحديث",
    refresh: "تحديث"
  } : {
    title: "Security Analysis & Threat Detection",
    description: "Intelligent monitoring system to detect vulnerabilities and threats in encryption operations",
    apiKeyLabel: "Gemini API Key",
    apiKeyPlaceholder: "Enter your Gemini API key",
    saveKey: "Save Key",
    realTimeMonitoring: "Real-time Monitoring",
    startMonitoring: "Start Monitoring",
    stopMonitoring: "Stop Monitoring",
    analyzeSecurity: "Analyze Security",
    analyzePatterns: "Analyze Patterns",
    securityMetrics: "Security Metrics",
    threatAnalysis: "Threat Analysis",
    patternAnalysis: "Pattern Analysis",
    customTest: "Custom Test",
    algorithm: "Algorithm",
    keyLength: "Key Length (bits)",
    dataSize: "Data Size (bytes)",
    encryptionTime: "Encryption Time (ms)",
    runCustomTest: "Run Custom Test",
    totalOperations: "Total Operations",
    successRate: "Success Rate",
    averageTime: "Average Time",
    failures: "Failures",
    securityLevel: "Security Level",
    threats: "Threats",
    recommendations: "Recommendations",
    shouldChangeAlgorithm: "Should Change Algorithm",
    newAlgorithm: "Suggested Algorithm",
    suspiciousActivity: "Suspicious Activity",
    patterns: "Detected Patterns",
    riskLevel: "Risk Level",
    actions: "Required Actions",
    analyzing: "Analyzing...",
    success: "Success",
    error: "Error",
    apiKeyRequired: "API key required",
    analysisComplete: "Analysis complete",
    noThreats: "No threats detected",
    noPatterns: "No suspicious patterns detected",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    yes: "Yes",
    no: "No",
    monitoring: "Monitoring",
    active: "Active",
    inactive: "Inactive",
    securityStatus: "Security Status",
    lastUpdate: "Last Update",
    refresh: "Refresh"
  };

  // Simulate real-time monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (realTimeMonitoring) {
      interval = setInterval(() => {
        // Simulate new encryption operation
        setSecurityMetrics(prev => ({
          ...prev,
          encryptionTimes: [...prev.encryptionTimes.slice(-6), Math.floor(Math.random() * 50) + 120],
          totalOperations: prev.totalOperations + 1,
          failures: Math.random() > 0.9 ? prev.failures + 1 : prev.failures,
          averageTime: Math.floor(Math.random() * 50) + 120,
          successRate: Math.floor(((prev.totalOperations - prev.failures) / prev.totalOperations) * 100)
        }));
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeMonitoring]);

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

  const handleAnalyzeSecurity = async () => {
    if (!getGeminiApiKey()) {
      toast({
        title: text.error,
        description: text.apiKeyRequired,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const encryptionData = {
        algorithm: customAlgorithm,
        keyLength: parseInt(customKeyLength),
        dataSize: parseInt(customDataSize),
        encryptionTime: parseInt(customEncryptionTime),
        patterns: securityMetrics.algorithms.slice(-5) // Last 5 patterns
      };

      const analysis = await geminiService.analyzeSecurity(encryptionData);
      setThreatAnalysis(analysis);

      toast({
        title: text.success,
        description: text.analysisComplete,
      });
    } catch (error) {
      console.error('Error analyzing security:', error);
      toast({
        title: text.error,
        description: error instanceof Error ? error.message : "فشل في تحليل الأمان",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzePatterns = async () => {
    if (!getGeminiApiKey()) {
      toast({
        title: text.error,
        description: text.apiKeyRequired,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await geminiService.detectPatterns(securityMetrics);
      setPatternAnalysis(analysis);

      toast({
        title: text.success,
        description: text.analysisComplete,
      });
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: text.error,
        description: error instanceof Error ? error.message : "فشل في تحليل الأنماط",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 flex items-center justify-center text-white shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                <Eye className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                {text.title}
              </h1>
              <p className="text-muted-foreground">{text.description}</p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold text-sm">{text.securityStatus}</h3>
                <Badge className={getSecurityLevelColor(threatAnalysis?.securityLevel || 'medium')}>
                  {text[threatAnalysis?.securityLevel || 'medium' as keyof typeof text]}
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold text-sm">{text.monitoring}</h3>
                <Badge variant={realTimeMonitoring ? "default" : "secondary"}>
                  {realTimeMonitoring ? text.active : text.inactive}
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <h3 className="font-semibold text-sm">{text.successRate}</h3>
                <span className="text-2xl font-bold">{securityMetrics.successRate}%</span>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-sm">{text.lastUpdate}</h3>
                <span className="text-sm">{new Date().toLocaleTimeString()}</span>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* API Key Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-red-600" />
                {text.apiKeyLabel}
              </CardTitle>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    {text.securityMetrics}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}
                  >
                    {realTimeMonitoring ? text.stopMonitoring : text.startMonitoring}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{text.totalOperations}</div>
                    <div className="text-2xl font-bold">{securityMetrics.totalOperations}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{text.successRate}</div>
                    <div className="text-2xl font-bold text-green-600">{securityMetrics.successRate}%</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{text.averageTime}</div>
                    <div className="text-2xl font-bold">{securityMetrics.averageTime}ms</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{text.failures}</div>
                    <div className="text-2xl font-bold text-red-600">{securityMetrics.failures}</div>
                  </div>
                </div>

                {/* Encryption Times Chart */}
                <div>
                  <Label className="text-sm font-medium">Encryption Times (Last 7 operations)</Label>
                  <div className="mt-2 flex items-end gap-1 h-20">
                    {securityMetrics.encryptionTimes.map((time, index) => (
                      <div
                        key={index}
                        className="bg-red-200 dark:bg-red-800 rounded-t"
                        style={{
                          height: `${(time / Math.max(...securityMetrics.encryptionTimes)) * 100}%`,
                          width: `${100 / securityMetrics.encryptionTimes.length}%`
                        }}
                        title={`${time}ms`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyzeSecurity}
                    disabled={isAnalyzing || !getGeminiApiKey()}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {text.analyzeSecurity}
                  </Button>
                  <Button
                    onClick={handleAnalyzePatterns}
                    disabled={isAnalyzing || !getGeminiApiKey()}
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {text.analyzePatterns}
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                    <span className="text-sm">{text.analyzing}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  {text.customTest}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="algorithm">{text.algorithm}</Label>
                    <Input
                      id="algorithm"
                      value={customAlgorithm}
                      onChange={(e) => setCustomAlgorithm(e.target.value)}
                      placeholder="AES-256"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key-length">{text.keyLength}</Label>
                    <Input
                      id="key-length"
                      type="number"
                      value={customKeyLength}
                      onChange={(e) => setCustomKeyLength(e.target.value)}
                      placeholder="256"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-size">{text.dataSize}</Label>
                    <Input
                      id="data-size"
                      type="number"
                      value={customDataSize}
                      onChange={(e) => setCustomDataSize(e.target.value)}
                      placeholder="1024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="encryption-time">{text.encryptionTime}</Label>
                    <Input
                      id="encryption-time"
                      type="number"
                      value={customEncryptionTime}
                      onChange={(e) => setCustomEncryptionTime(e.target.value)}
                      placeholder="145"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalyzeSecurity}
                  disabled={isAnalyzing || !getGeminiApiKey()}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {text.runCustomTest}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {text.threatAnalysis}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {threatAnalysis ? (
                  <div className="space-y-4">
                    {/* Security Level */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{text.securityLevel}:</span>
                      <Badge className={getSecurityLevelColor(threatAnalysis.securityLevel)}>
                        <div className="flex items-center gap-1">
                          {getSecurityIcon(threatAnalysis.securityLevel)}
                          {text[threatAnalysis.securityLevel as keyof typeof text]}
                        </div>
                      </Badge>
                    </div>

                    {/* Algorithm Change Recommendation */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{text.shouldChangeAlgorithm}:</span>
                      <Badge variant={threatAnalysis.shouldChangeAlgorithm ? "destructive" : "secondary"}>
                        {threatAnalysis.shouldChangeAlgorithm ? text.yes : text.no}
                      </Badge>
                    </div>

                    {threatAnalysis.newAlgorithm && (
                      <div>
                        <span className="font-medium">{text.newAlgorithm}:</span>
                        <Badge variant="outline" className="ml-2">
                          {threatAnalysis.newAlgorithm}
                        </Badge>
                      </div>
                    )}

                    <Separator />

                    {/* Threats */}
                    <div>
                      <h4 className="font-medium mb-2">{text.threats}:</h4>
                      {threatAnalysis.threats.length > 0 ? (
                        <div className="space-y-2">
                          {threatAnalysis.threats.map((threat, index) => (
                            <Alert key={index} variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{threat}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">{text.noThreats}</p>
                      )}
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium mb-2">{text.recommendations}:</h4>
                      <div className="space-y-2">
                        {threatAnalysis.recommendations.map((rec, index) => (
                          <Alert key={index}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Analyze Security" to start threat analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pattern Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  {text.patternAnalysis}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patternAnalysis ? (
                  <div className="space-y-4">
                    {/* Suspicious Activity */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{text.suspiciousActivity}:</span>
                      <Badge variant={patternAnalysis.suspiciousActivity ? "destructive" : "secondary"}>
                        {patternAnalysis.suspiciousActivity ? text.yes : text.no}
                      </Badge>
                    </div>

                    {/* Risk Level */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{text.riskLevel}:</span>
                      <Badge className={getSecurityLevelColor(patternAnalysis.riskLevel)}>
                        <div className="flex items-center gap-1">
                          {getSecurityIcon(patternAnalysis.riskLevel)}
                          {text[patternAnalysis.riskLevel as keyof typeof text]}
                        </div>
                      </Badge>
                    </div>

                    <Separator />

                    {/* Detected Patterns */}
                    <div>
                      <h4 className="font-medium mb-2">{text.patterns}:</h4>
                      {patternAnalysis.patterns.length > 0 ? (
                        <div className="space-y-2">
                          {patternAnalysis.patterns.map((pattern, index) => (
                            <Alert key={index} variant="default">
                              <Eye className="h-4 w-4" />
                              <AlertDescription>{pattern}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">{text.noPatterns}</p>
                      )}
                    </div>

                    {/* Required Actions */}
                    <div>
                      <h4 className="font-medium mb-2">{text.actions}:</h4>
                      <div className="space-y-2">
                        {patternAnalysis.actions.map((action, index) => (
                          <Alert key={index}>
                            <Target className="h-4 w-4" />
                            <AlertDescription>{action}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Analyze Patterns" to start pattern analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAnalysis;