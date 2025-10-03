import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCipher } from "@/contexts/CipherContext";
import { useUserRole } from "@/hooks/useUserRole";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Shield, Users, Settings, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

const Admin = () => {
  const { isArabic } = useCipher();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const text = isArabic ? {
    title: "لوحة تحكم المشرف",
    subtitle: "إدارة المستخدمين والأدوار",
    unauthorized: "غير مصرح لك بالوصول إلى هذه الصفحة",
    users: "المستخدمون",
    settings: "الإعدادات",
    database: "قاعدة البيانات",
    userManagement: "إدارة المستخدمين",
    email: "البريد الإلكتروني",
    name: "الاسم",
    role: "الدور",
    createdAt: "تاريخ الإنشاء",
    actions: "الإجراءات",
    changeRole: "تغيير الدور",
    selectUser: "اختر مستخدم",
    selectRole: "اختر دور",
    admin: "مشرف",
    moderator: "مراقب",
    user: "مستخدم",
    save: "حفظ",
    roleUpdated: "تم تحديث الدور بنجاح",
    error: "حدث خطأ",
    loading: "جاري التحميل...",
  } : {
    title: "Admin Dashboard",
    subtitle: "Manage users and roles",
    unauthorized: "You are not authorized to access this page",
    users: "Users",
    settings: "Settings",
    database: "Database",
    userManagement: "User Management",
    email: "Email",
    name: "Name",
    role: "Role",
    createdAt: "Created At",
    actions: "Actions",
    changeRole: "Change Role",
    selectUser: "Select User",
    selectRole: "Select Role",
    admin: "Admin",
    moderator: "Moderator",
    user: "User",
    save: "Save",
    roleUpdated: "Role updated successfully",
    error: "An error occurred",
    loading: "Loading...",
  };

  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      toast.error(text.unauthorized);
      navigate("/");
    }
  }, [role, roleLoading, navigate, text.unauthorized]);

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const rolesMap = new Map(rolesData.map(r => [r.user_id, r.role]));

      const usersWithRoles = profilesData.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name || '',
        role: rolesMap.get(profile.id) || 'user',
        created_at: profile.created_at,
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error(isArabic ? "الرجاء اختيار مستخدم ودور" : "Please select a user and role");
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUserId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUserId, role: selectedRole });

      if (insertError) throw insertError;

      toast.success(text.roleUpdated);
      fetchUsers();
      setSelectedUserId("");
      setSelectedRole("");
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(text.error);
    }
  };

  if (roleLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            {text.title}
          </h1>
          <p className="text-muted-foreground mt-2">{text.subtitle}</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{text.users}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{text.settings}</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">{text.database}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{text.changeRole}</CardTitle>
                <CardDescription>
                  {isArabic ? "قم بتعيين أو تغيير أدوار المستخدمين" : "Assign or change user roles"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{text.selectUser}</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder={text.selectUser} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email} ({user.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{text.selectRole}</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder={text.selectRole} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{text.admin}</SelectItem>
                        <SelectItem value="moderator">{text.moderator}</SelectItem>
                        <SelectItem value="user">{text.user}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleRoleChange} className="w-full md:w-auto">
                  {text.save}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{text.userManagement}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{text.email}</TableHead>
                          <TableHead className="hidden md:table-cell">{text.name}</TableHead>
                          <TableHead>{text.role}</TableHead>
                          <TableHead className="hidden lg:table-cell">{text.createdAt}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{user.name}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {new Date(user.created_at).toLocaleDateString()}
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

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{text.settings}</CardTitle>
                <CardDescription>
                  {isArabic ? "إعدادات التطبيق العامة" : "General application settings"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isArabic ? "قريباً..." : "Coming soon..."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>{text.database}</CardTitle>
                <CardDescription>
                  {isArabic ? "إدارة قاعدة البيانات" : "Database management"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isArabic ? "قريباً..." : "Coming soon..."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
