import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Database, Settings, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    securityMsg: "مراقبة الأمان والتحكم بالصلاحيات"
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
    securityMsg: "Security monitoring and access control"
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
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error(text.error);
      navigate("/");
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
            <Card>
              <CardHeader>
                <CardTitle>{text.settingsTab}</CardTitle>
                <CardDescription>{text.settingsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{text.settingsMsg}</p>
              </CardContent>
            </Card>
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
