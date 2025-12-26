import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Shield, Lock, Key, FileText, Activity, TrendingUp, TrendingDown, RefreshCw, Calendar } from "lucide-react";
import { useCipher } from "@/contexts/CipherContext";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface SecurityReport {
  totalLogins: number;
  totalEncryptions: number;
  totalDecryptions: number;
  totalShares: number;
  activeShares: number;
  expiredShares: number;
  passwordsStored: number;
  twoFactorEnabled: boolean;
  securityScore: number;
  recentActivity: { action: string; date: string; status: string }[];
}

const SecurityReports = () => {
  const navigate = useNavigate();
  const { isArabic } = useCipher();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    generateReport();
  }, [selectedMonth]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);

      // Fetch statistics
      const { data: stats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch activity logs for the month
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch shared files
      const { data: shares } = await supabase
        .from('shared_files')
        .select('*')
        .eq('user_id', user.id);

      // Fetch password vault count
      const { count: passwordCount } = await supabase
        .from('password_vault')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Check 2FA status
      const { data: twoFactor } = await supabase
        .from('two_factor_auth')
        .select('is_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      // Calculate security score
      let securityScore = 0;
      if (twoFactor?.is_enabled) securityScore += 30;
      if ((passwordCount || 0) > 0) securityScore += 20;
      if ((stats?.total_encryptions || 0) > 0) securityScore += 15;
      if ((shares?.length || 0) > 0) securityScore += 10;
      if ((activityLogs?.length || 0) > 5) securityScore += 10;
      securityScore = Math.min(securityScore + 15, 100); // Base score

      const activeShares = shares?.filter(s => s.is_active && new Date(s.expires_at) > new Date()).length || 0;
      const expiredShares = (shares?.length || 0) - activeShares;

      const recentActivity = (activityLogs || []).map(log => ({
        action: log.action_type,
        date: log.created_at,
        status: log.status
      }));

      setReport({
        totalLogins: activityLogs?.filter(l => l.action_type === 'login').length || 0,
        totalEncryptions: stats?.total_encryptions || 0,
        totalDecryptions: stats?.total_decryptions || 0,
        totalShares: shares?.length || 0,
        activeShares,
        expiredShares,
        passwordsStored: passwordCount || 0,
        twoFactorEnabled: twoFactor?.is_enabled || false,
        securityScore,
        recentActivity
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(isArabic ? "فشل في إنشاء التقرير" : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return isArabic ? "ممتاز" : "Excellent";
    if (score >= 60) return isArabic ? "جيد" : "Good";
    if (score >= 40) return isArabic ? "متوسط" : "Fair";
    return isArabic ? "يحتاج تحسين" : "Needs Improvement";
  };

  const formatAction = (action: string) => {
    const actions: Record<string, { ar: string; en: string }> = {
      encrypt: { ar: "تشفير", en: "Encrypt" },
      decrypt: { ar: "فك تشفير", en: "Decrypt" },
      generate: { ar: "إنشاء مفتاح", en: "Generate Key" },
      login: { ar: "تسجيل دخول", en: "Login" },
      share: { ar: "مشاركة", en: "Share" }
    };
    return actions[action]?.[isArabic ? 'ar' : 'en'] || action;
  };

  const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i));

  return (
    <div className="min-h-screen bg-background p-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                {isArabic ? "التقارير الأمنية" : "Security Reports"}
              </h1>
              <p className="text-muted-foreground">
                {isArabic ? "ملخص شهري لنشاط حسابك الأمني" : "Monthly summary of your security activity"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={generateReport} disabled={generating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {isArabic ? "تحديث" : "Refresh"}
          </Button>
        </div>

        {/* Month Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {months.map((month) => (
            <Button
              key={month.toISOString()}
              variant={selectedMonth.getMonth() === month.getMonth() ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMonth(month)}
              className="whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {format(month, "MMMM yyyy", { locale: isArabic ? ar : enUS })}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Security Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {isArabic ? "درجة الأمان" : "Security Score"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={`${(report.securityScore / 100) * 352} 352`}
                        className={getScoreColor(report.securityScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(report.securityScore)}`}>
                        {report.securityScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${getScoreColor(report.securityScore)}`}>
                      {getScoreLabel(report.securityScore)}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {isArabic
                        ? "يتم حساب درجة الأمان بناءً على نشاطك وإعدادات الأمان"
                        : "Security score is calculated based on your activity and security settings"}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className={`w-4 h-4 ${report.twoFactorEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm">
                          {isArabic ? "المصادقة الثنائية:" : "Two-Factor Auth:"}
                          <Badge variant={report.twoFactorEnabled ? "default" : "secondary"} className="ml-2">
                            {report.twoFactorEnabled ? (isArabic ? "مفعّل" : "Enabled") : (isArabic ? "معطّل" : "Disabled")}
                          </Badge>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "التشفيرات" : "Encryptions"}
                      </p>
                      <p className="text-2xl font-bold">{report.totalEncryptions}</p>
                    </div>
                    <Lock className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "فك التشفير" : "Decryptions"}
                      </p>
                      <p className="text-2xl font-bold">{report.totalDecryptions}</p>
                    </div>
                    <Key className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "المشاركات" : "Shares"}
                      </p>
                      <p className="text-2xl font-bold">{report.totalShares}</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "كلمات المرور" : "Passwords"}
                      </p>
                      <p className="text-2xl font-bold">{report.passwordsStored}</p>
                    </div>
                    <Shield className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shares Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "حالة المشاركات" : "Shares Status"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{isArabic ? "نشطة" : "Active"}</span>
                      <span className="text-sm font-medium">{report.activeShares}</span>
                    </div>
                    <Progress value={(report.activeShares / Math.max(report.totalShares, 1)) * 100} className="h-2" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{isArabic ? "منتهية" : "Expired"}</span>
                      <span className="text-sm font-medium">{report.expiredShares}</span>
                    </div>
                    <Progress value={(report.expiredShares / Math.max(report.totalShares, 1)) * 100} className="h-2 [&>div]:bg-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {isArabic ? "النشاط الأخير" : "Recent Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    {isArabic ? "لا يوجد نشاط هذا الشهر" : "No activity this month"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {report.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>{formatAction(activity.action)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(activity.date), "dd/MM HH:mm", { locale: isArabic ? ar : enUS })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "توصيات الأمان" : "Security Recommendations"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {!report.twoFactorEnabled && (
                    <li className="flex items-start gap-3 text-sm">
                      <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span>
                        {isArabic
                          ? "قم بتفعيل المصادقة الثنائية لحماية إضافية"
                          : "Enable two-factor authentication for extra protection"}
                      </span>
                    </li>
                  )}
                  {report.passwordsStored === 0 && (
                    <li className="flex items-start gap-3 text-sm">
                      <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span>
                        {isArabic
                          ? "استخدم مدير كلمات المرور لتخزين كلمات المرور بأمان"
                          : "Use the password manager to securely store passwords"}
                      </span>
                    </li>
                  )}
                  {report.securityScore >= 80 && (
                    <li className="flex items-start gap-3 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>
                        {isArabic
                          ? "ممتاز! حسابك آمن بشكل جيد"
                          : "Excellent! Your account is well secured"}
                      </span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SecurityReports;
