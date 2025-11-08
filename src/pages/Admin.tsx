import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Database, Settings, Lock, Loader2, Trash2, BarChart3, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

const Admin = () => {
  const { isArabic } = useCipher();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Settings state
  const [appNameAr, setAppNameAr] = useState("");
  const [appNameEn, setAppNameEn] = useState("");
  const [taglineAr, setTaglineAr] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOperations: 0,
    totalEncryptions: 0,
    totalDecryptions: 0,
    featureUsage: [] as { feature: string; count: number }[],
    userGrowth: [] as { date: string; users: number }[]
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const text = isArabic ? {
    title: "لوحة تحكم المسؤول",
    subtitle: "إدارة النظام والمستخدمين",
    usersTab: "المستخدمون",
    analyticsTab: "الإحصائيات",
    databaseTab: "قاعدة البيانات",
    settingsTab: "الإعدادات",
    securityTab: "الأمان",
    email: "البريد الإلكتروني",
    name: "الاسم",
    role: "الدور",
    createdAt: "تاريخ التسجيل",
    actions: "الإجراءات",
    admin: "مسؤول",
    moderator: "مشرف",
    user: "مستخدم",
    changeRole: "تغيير الدور",
    deleteUser: "حذف",
    unauthorized: "غير مصرح لك بالوصول",
    loading: "جاري التحميل...",
    noUsers: "لا يوجد مستخدمون",
    roleUpdated: "تم تحديث الدور بنجاح",
    error: "حدث خطأ",
    databaseDesc: "إدارة قاعدة البيانات",
    databaseMsg: "يمكنك إدارة قاعدة البيانات من خلال لوحة تحكم Backend",
    settingsDesc: "إعدادات النظام",
    settingsMsg: "إعدادات النظام العامة",
    securityDesc: "إعدادات الأمان",
    securityMsg: "مراقبة الأمان والتحكم بالصلاحيات",
    appName: "اسم التطبيق",
    appNameAr: "اسم التطبيق (عربي)",
    appNameEn: "اسم التطبيق (English)",
    tagline: "الشعار",
    taglineAr: "الشعار (عربي)",
    taglineEn: "الشعار (English)",
    colors: "الألوان",
    primaryColor: "اللون الأساسي",
    secondaryColor: "اللون الثانوي",
    accentColor: "لون التمييز",
    images: "الصور",
    logo: "الشعار",
    heroImage: "صورة البانر",
    save: "حفظ التغييرات",
    colorHelper: "استخدم صيغة HSL (مثال: 221.2 83.2% 53.3%)",
    appNameDesc: "اسم التطبيق الذي يظهر في الصفحة الرئيسية",
    taglineDesc: "الشعار الذي يظهر تحت اسم التطبيق",
    imagesDesc: "رفع الشعار وصورة البانر",
    settingsSaved: "تم حفظ الإعدادات بنجاح",
    uploadSuccess: "تم رفع الصورة بنجاح",
    uploadError: "فشل رفع الصورة",
    totalUsers: "إجمالي المستخدمين",
    activeUsers: "المستخدمون النشطون",
    totalOperations: "إجمالي العمليات",
    totalEncryptions: "عمليات التشفير",
    totalDecryptions: "عمليات فك التشفير",
    featureUsage: "استخدام الميزات",
    userGrowth: "نمو المستخدمين",
    last30Days: "آخر 30 يوم",
    analyticsOverview: "نظرة عامة على الإحصائيات",
    analyticsDesc: "تحليل شامل لاستخدام التطبيق",
    mostUsedFeatures: "أكثر الميزات استخداماً",
    operationsBreakdown: "توزيع العمليات",
    files: "ملفات",
    imagesFeature: "صور",
    audio: "صوت",
    video: "فيديو",
    textFeature: "نص",
    noData: "لا توجد بيانات"
  } : {
    title: "Admin Dashboard",
    subtitle: "System and user management",
    usersTab: "Users",
    analyticsTab: "Analytics",
    databaseTab: "Database",
    settingsTab: "Settings",
    securityTab: "Security",
    email: "Email",
    name: "Name",
    role: "Role",
    createdAt: "Created At",
    actions: "Actions",
    admin: "Admin",
    moderator: "Moderator",
    user: "User",
    changeRole: "Change Role",
    deleteUser: "Delete",
    unauthorized: "Unauthorized access",
    loading: "Loading...",
    noUsers: "No users found",
    roleUpdated: "Role updated successfully",
    error: "An error occurred",
    databaseDesc: "Database management",
    databaseMsg: "You can manage the database through the Backend dashboard",
    settingsDesc: "System settings",
    settingsMsg: "General system settings",
    securityDesc: "Security settings",
    securityMsg: "Security monitoring and access control",
    appName: "App Name",
    appNameAr: "App Name (Arabic)",
    appNameEn: "App Name (English)",
    tagline: "Tagline",
    taglineAr: "Tagline (Arabic)",
    taglineEn: "Tagline (English)",
    colors: "Colors",
    primaryColor: "Primary Color",
    secondaryColor: "Secondary Color",
    accentColor: "Accent Color",
    images: "Images",
    logo: "Logo",
    heroImage: "Hero Image",
    save: "Save Changes",
    colorHelper: "Use HSL format (example: 221.2 83.2% 53.3%)",
    appNameDesc: "App name shown on the homepage",
    taglineDesc: "Tagline shown under the app name",
    imagesDesc: "Upload logo and hero image",
    settingsSaved: "Settings saved successfully",
    uploadSuccess: "Image uploaded successfully",
    uploadError: "Failed to upload image",
    totalUsers: "Total Users",
    activeUsers: "Active Users",
    totalOperations: "Total Operations",
    totalEncryptions: "Encryptions",
    totalDecryptions: "Decryptions",
    featureUsage: "Feature Usage",
    userGrowth: "User Growth",
    last30Days: "Last 30 Days",
    analyticsOverview: "Analytics Overview",
    analyticsDesc: "Comprehensive app usage analysis",
    mostUsedFeatures: "Most Used Features",
    operationsBreakdown: "Operations Breakdown",
    files: "Files",
    imagesFeature: "Images",
    audio: "Audio",
    video: "Video",
    textFeature: "Text",
    noData: "No data available"
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);

      // Get total users count
      const { count: totalUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeUsersData } = await supabase
        .from('activity_logs')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const uniqueActiveUsers = new Set(activeUsersData?.map(a => a.user_id) || []);

      // Get all statistics
      const { data: allStats } = await supabase
        .from('user_statistics')
        .select('*');

      const totalEncryptions = allStats?.reduce((sum, stat) => sum + (stat.total_encryptions || 0), 0) || 0;
      const totalDecryptions = allStats?.reduce((sum, stat) => sum + (stat.total_decryptions || 0), 0) || 0;
      const totalFiles = allStats?.reduce((sum, stat) => sum + (stat.total_files_encrypted || 0), 0) || 0;
      const totalImages = allStats?.reduce((sum, stat) => sum + (stat.total_images_encrypted || 0), 0) || 0;
      const totalAudio = allStats?.reduce((sum, stat) => sum + (stat.total_audio_encrypted || 0), 0) || 0;
      const totalVideo = allStats?.reduce((sum, stat) => sum + (stat.total_video_encrypted || 0), 0) || 0;

      // Feature usage breakdown
      const featureUsage = [
        { feature: text.files, count: totalFiles },
        { feature: text.imagesFeature, count: totalImages },
        { feature: text.audio, count: totalAudio },
        { feature: text.video, count: totalVideo },
        { feature: text.textFeature, count: totalEncryptions - (totalFiles + totalImages + totalAudio + totalVideo) }
      ].filter(f => f.count > 0);

      // User growth over last 30 days
      const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      const growthByDay: { [key: string]: number } = {};
      userGrowthData?.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString();
        growthByDay[date] = (growthByDay[date] || 0) + 1;
      });

      const userGrowth = Object.entries(growthByDay).map(([date, users]) => ({
        date,
        users
      }));

      setAnalyticsData({
        totalUsers: totalUsersCount || 0,
        activeUsers: uniqueActiveUsers.size,
        totalOperations: totalEncryptions + totalDecryptions,
        totalEncryptions,
        totalDecryptions,
        featureUsage,
        userGrowth
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(text.error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(text.unauthorized);
        navigate("/login");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        toast.error(text.unauthorized);
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchUsers();
      fetchSettings();
      fetchAnalytics();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error(text.error);
      navigate("/");
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) throw error;

      data?.forEach(item => {
        const val = item.value as any;
        switch (item.key) {
          case 'app_name':
            setAppNameAr(val?.ar || '');
            setAppNameEn(val?.en || '');
            break;
          case 'app_tagline':
            setTaglineAr(val?.ar || '');
            setTaglineEn(val?.en || '');
            break;
          case 'primary_color':
            setPrimaryColor(String(val || ''));
            break;
          case 'secondary_color':
            setSecondaryColor(String(val || ''));
            break;
          case 'accent_color':
            setAccentColor(String(val || ''));
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name || '',
          role: (userRole?.role as 'admin' | 'moderator' | 'user') || 'user',
          created_at: profile.created_at
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(text.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert the new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as 'admin' | 'moderator' | 'user' }]);

      if (error) throw error;

      toast.success(text.roleUpdated);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(text.error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
      return;
    }

    try {
      // Delete user role first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Delete user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success(isArabic ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(text.error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const updates = [
        { key: 'app_name', value: { ar: appNameAr, en: appNameEn } },
        { key: 'app_tagline', value: { ar: taglineAr, en: taglineEn } },
        { key: 'primary_color', value: primaryColor },
        { key: 'secondary_color', value: secondaryColor },
        { key: 'accent_color', value: accentColor }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .update({ value: update.value })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast.success(text.settingsSaved);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(text.error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'hero') => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('app-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('app-assets')
        .getPublicUrl(fileName);

      const key = type === 'logo' ? 'logo_url' : 'hero_image_url';
      
      const { error: settingsError } = await supabase
        .from('app_settings')
        .upsert({ key, value: publicUrl });

      if (settingsError) throw settingsError;

      toast.success(text.uploadSuccess);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(text.uploadError);
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{text.unauthorized}</CardTitle>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{text.title}</h1>
          </div>
          <p className="text-muted-foreground">{text.subtitle}</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              {text.analyticsTab}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              {text.usersTab}
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              {text.databaseTab}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {text.settingsTab}
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              {text.securityTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{text.totalUsers}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">{text.last30Days}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{text.activeUsers}</CardTitle>
                    <Activity className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
                    <p className="text-xs text-muted-foreground">{text.last30Days}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{text.totalOperations}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalOperations}</div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData.totalEncryptions} / {analyticsData.totalDecryptions}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{text.totalEncryptions}</CardTitle>
                    <Shield className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalEncryptions}</div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData.totalOperations > 0 
                        ? `${((analyticsData.totalEncryptions / analyticsData.totalOperations) * 100).toFixed(1)}%` 
                        : '0%'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Feature Usage Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>{text.mostUsedFeatures}</CardTitle>
                    <CardDescription>{text.featureUsage}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingAnalytics ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : analyticsData.featureUsage.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.featureUsage}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="feature" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        {text.noData}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Operations Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>{text.operationsBreakdown}</CardTitle>
                    <CardDescription>{text.analyticsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingAnalytics ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : analyticsData.totalOperations > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: text.totalEncryptions, value: analyticsData.totalEncryptions },
                              { name: text.totalDecryptions, value: analyticsData.totalDecryptions }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            <Cell fill="hsl(var(--primary))" />
                            <Cell fill="hsl(var(--secondary))" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        {text.noData}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* User Growth Chart */}
                {analyticsData.userGrowth.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>{text.userGrowth}</CardTitle>
                      <CardDescription>{text.last30Days}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name={text.totalUsers}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{text.usersTab}</CardTitle>
                <CardDescription>
                  {users.length} {text.usersTab.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">{text.loading}</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">{text.noUsers}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{text.name}</TableHead>
                          <TableHead>{text.email}</TableHead>
                          <TableHead>{text.role}</TableHead>
                          <TableHead>{text.createdAt}</TableHead>
                          <TableHead>{text.changeRole}</TableHead>
                          <TableHead>{text.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || '-'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                                {user.role === 'admin' ? text.admin : user.role === 'moderator' ? text.moderator : text.user}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">{text.admin}</SelectItem>
                                  <SelectItem value="moderator">{text.moderator}</SelectItem>
                                  <SelectItem value="user">{text.user}</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                {text.deleteUser}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{text.databaseTab}</CardTitle>
                <CardDescription>{text.databaseDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{text.databaseMsg}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.appName}</CardTitle>
                  <CardDescription>{text.appNameDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{text.appNameAr}</Label>
                    <Input
                      value={appNameAr}
                      onChange={(e) => setAppNameAr(e.target.value)}
                      className={isArabic ? "font-arabic text-right" : ""}
                    />
                  </div>
                  <div>
                    <Label>{text.appNameEn}</Label>
                    <Input
                      value={appNameEn}
                      onChange={(e) => setAppNameEn(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{text.tagline}</CardTitle>
                  <CardDescription>{text.taglineDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{text.taglineAr}</Label>
                    <Input
                      value={taglineAr}
                      onChange={(e) => setTaglineAr(e.target.value)}
                      className={isArabic ? "font-arabic text-right" : ""}
                    />
                  </div>
                  <div>
                    <Label>{text.taglineEn}</Label>
                    <Input
                      value={taglineEn}
                      onChange={(e) => setTaglineEn(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{text.colors}</CardTitle>
                  <CardDescription>{text.colorHelper}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{text.primaryColor}</Label>
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="221.2 83.2% 53.3%"
                    />
                  </div>
                  <div>
                    <Label>{text.secondaryColor}</Label>
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="217.2 91.2% 59.8%"
                    />
                  </div>
                  <div>
                    <Label>{text.accentColor}</Label>
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="210 40% 96.1%"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{text.images}</CardTitle>
                  <CardDescription>{text.imagesDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{text.logo}</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'logo');
                      }}
                      disabled={uploading}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>{text.heroImage}</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'hero');
                      }}
                      disabled={uploading}
                      className="mt-2"
                    />
                  </div>
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isArabic ? "جاري الرفع..." : "Uploading..."}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full"
              >
                {savingSettings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {text.save}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{text.securityTab}</CardTitle>
                <CardDescription>{text.securityDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{text.securityMsg}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
