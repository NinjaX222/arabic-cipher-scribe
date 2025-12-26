import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Eye, EyeOff, Copy, Trash2, Edit, Key, Globe, User, Lock, Search } from "lucide-react";
import { encryptAES, decryptAES, generateKey } from "@/utils/encryption";
import { useCipher } from "@/contexts/CipherContext";

interface PasswordEntry {
  id: string;
  site_name: string;
  site_url: string | null;
  username: string;
  encrypted_password: string;
  notes: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

const PasswordManager = () => {
  const navigate = useNavigate();
  const { isArabic } = useCipher();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterKey, setMasterKey] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  
  const [formData, setFormData] = useState({
    site_name: "",
    site_url: "",
    username: "",
    password: "",
    notes: "",
    category: "general"
  });

  const categories = [
    { value: "general", label: isArabic ? "عام" : "General" },
    { value: "social", label: isArabic ? "تواصل اجتماعي" : "Social" },
    { value: "work", label: isArabic ? "عمل" : "Work" },
    { value: "finance", label: isArabic ? "مالي" : "Finance" },
    { value: "shopping", label: isArabic ? "تسوق" : "Shopping" },
    { value: "entertainment", label: isArabic ? "ترفيه" : "Entertainment" }
  ];

  useEffect(() => {
    if (isUnlocked) {
      fetchPasswords();
    }
  }, [isUnlocked]);

  const fetchPasswords = async () => {
    try {
      const { data, error } = await supabase
        .from('password_vault')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasswords(data || []);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      toast.error(isArabic ? "فشل في تحميل كلمات المرور" : "Failed to load passwords");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    if (masterKey.length < 8) {
      toast.error(isArabic ? "المفتاح الرئيسي يجب أن يكون 8 أحرف على الأقل" : "Master key must be at least 8 characters");
      return;
    }
    setIsUnlocked(true);
  };

  const handleAddPassword = async () => {
    if (!formData.site_name || !formData.username || !formData.password) {
      toast.error(isArabic ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(isArabic ? "يجب تسجيل الدخول أولاً" : "You must be logged in");
        return;
      }

      const encryptedPassword = encryptAES(formData.password, masterKey);

      const { error } = await supabase.from('password_vault').insert({
        user_id: user.id,
        site_name: formData.site_name,
        site_url: formData.site_url || null,
        username: formData.username,
        encrypted_password: encryptedPassword,
        notes: formData.notes || null,
        category: formData.category
      });

      if (error) throw error;

      toast.success(isArabic ? "تمت إضافة كلمة المرور بنجاح" : "Password added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchPasswords();
    } catch (error) {
      console.error('Error adding password:', error);
      toast.error(isArabic ? "فشل في إضافة كلمة المرور" : "Failed to add password");
    }
  };

  const handleUpdatePassword = async () => {
    if (!editingEntry) return;

    try {
      const encryptedPassword = encryptAES(formData.password, masterKey);

      const { error } = await supabase
        .from('password_vault')
        .update({
          site_name: formData.site_name,
          site_url: formData.site_url || null,
          username: formData.username,
          encrypted_password: encryptedPassword,
          notes: formData.notes || null,
          category: formData.category
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      toast.success(isArabic ? "تم تحديث كلمة المرور" : "Password updated");
      setEditingEntry(null);
      resetForm();
      fetchPasswords();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(isArabic ? "فشل في التحديث" : "Failed to update");
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      const { error } = await supabase
        .from('password_vault')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(isArabic ? "تم حذف كلمة المرور" : "Password deleted");
      fetchPasswords();
    } catch (error) {
      console.error('Error deleting password:', error);
      toast.error(isArabic ? "فشل في الحذف" : "Failed to delete");
    }
  };

  const decryptPassword = (encryptedPassword: string): string => {
    try {
      return decryptAES(encryptedPassword, masterKey);
    } catch {
      return "***";
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isArabic ? `تم نسخ ${label}` : `${label} copied`);
  };

  const resetForm = () => {
    setFormData({
      site_name: "",
      site_url: "",
      username: "",
      password: "",
      notes: "",
      category: "general"
    });
  };

  const startEdit = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setFormData({
      site_name: entry.site_name,
      site_url: entry.site_url || "",
      username: entry.username,
      password: decryptPassword(entry.encrypted_password),
      notes: entry.notes || "",
      category: entry.category
    });
  };

  const generateRandomPassword = () => {
    const newPassword = generateKey(16);
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = p.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background p-4" dir={isArabic ? "rtl" : "ltr"}>
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>{isArabic ? "مدير كلمات المرور" : "Password Manager"}</CardTitle>
              <CardDescription>
                {isArabic ? "أدخل المفتاح الرئيسي لفتح خزنة كلمات المرور" : "Enter your master key to unlock the vault"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isArabic ? "المفتاح الرئيسي" : "Master Key"}</Label>
                <Input
                  type="password"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder={isArabic ? "أدخل المفتاح الرئيسي..." : "Enter master key..."}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />
              </div>
              <Button onClick={handleUnlock} className="w-full">
                <Key className="w-4 h-4 mr-2" />
                {isArabic ? "فتح الخزنة" : "Unlock Vault"}
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isArabic ? "رجوع" : "Back"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isArabic ? "مدير كلمات المرور" : "Password Manager"}</h1>
              <p className="text-muted-foreground">{isArabic ? "خزنة آمنة لكلمات مرورك" : "Secure vault for your passwords"}</p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingEntry(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                {isArabic ? "إضافة كلمة مرور" : "Add Password"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isArabic ? "إضافة كلمة مرور جديدة" : "Add New Password"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "اسم الموقع *" : "Site Name *"}</Label>
                  <Input
                    value={formData.site_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                    placeholder={isArabic ? "مثال: Google" : "e.g. Google"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "رابط الموقع" : "Site URL"}</Label>
                  <Input
                    value={formData.site_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "اسم المستخدم *" : "Username *"}</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "كلمة المرور *" : "Password *"}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <Button type="button" variant="outline" onClick={generateRandomPassword}>
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "الفئة" : "Category"}</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "ملاحظات" : "Notes"}</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPassword}>
                  {isArabic ? "حفظ" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isArabic ? "بحث..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Password List */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredPasswords.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent>
              <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isArabic ? "لا توجد كلمات مرور محفوظة" : "No passwords saved yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPasswords.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.site_name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {entry.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(entry.username, isArabic ? "اسم المستخدم" : "Username")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPasswords(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                      >
                        {showPasswords[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(decryptPassword(entry.encrypted_password), isArabic ? "كلمة المرور" : "Password")}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePassword(entry.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {showPasswords[entry.id] && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm font-mono">
                      {decryptPassword(entry.encrypted_password)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isArabic ? "تعديل كلمة المرور" : "Edit Password"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isArabic ? "اسم الموقع" : "Site Name"}</Label>
                <Input
                  value={formData.site_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "رابط الموقع" : "Site URL"}</Label>
                <Input
                  value={formData.site_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "اسم المستخدم" : "Username"}</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "كلمة المرور" : "Password"}</Label>
                <Input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "الفئة" : "Category"}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "ملاحظات" : "Notes"}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdatePassword}>
                {isArabic ? "تحديث" : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PasswordManager;
