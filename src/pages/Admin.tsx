import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Database, Settings, Lock, Loader2 } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
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

  const text = isArabic ? {
    title: "لوحة تحكم المسؤول",
    subtitle: "إدارة النظام والمستخدمين",
    usersTab: "المستخدمون",
    databaseTab: "قاعدة البيانات",
    settingsTab: "الإعدادات",
    securityTab: "الأمان",
    email: "البريد الإلكتروني",
    name: "الاسم",
    role: "الدور",
    createdAt: "تاريخ التسجيل",
    admin: "مسؤول",
    moderator: "مشرف",
    user: "مستخدم",
    changeRole: "تغيير الدور",
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
    uploadError: "فشل رفع الصورة"
  } : {
    title: "Admin Dashboard",
    subtitle: "System and user management",
    usersTab: "Users",
    databaseTab: "Database",
    settingsTab: "Settings",
    securityTab: "Security",
    email: "Email",
    name: "Name",
    role: "Role",
    createdAt: "Created At",
    admin: "Admin",
    moderator: "Moderator",
    user: "User",
    changeRole: "Change Role",
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
    uploadError: "Failed to upload image"
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

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
        switch (item.key) {
          case 'app_name':
            setAppNameAr(item.value.ar || '');
            setAppNameEn(item.value.en || '');
            break;
          case 'app_tagline':
            setTaglineAr(item.value.ar || '');
            setTaglineEn(item.value.en || '');
            break;
          case 'primary_color':
            setPrimaryColor(item.value || '');
            break;
          case 'secondary_color':
            setSecondaryColor(item.value || '');
            break;
          case 'accent_color':
            setAccentColor(item.value || '');
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
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast.success(text.roleUpdated);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
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

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
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
