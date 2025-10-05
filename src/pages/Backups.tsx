import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Database, Download, Trash2, Plus, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/Header";
import { useCipher } from "@/contexts/CipherContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Backup {
  id: string;
  backup_name: string;
  backup_type: string;
  size_bytes: number;
  created_at: string;
  expires_at: string | null;
}

const Backups = () => {
  const navigate = useNavigate();
  const { isArabic, keys } = useCipher();
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const text = isArabic ? {
    title: "النسخ الاحتياطية",
    description: "إدارة النسخ الاحتياطية للمفاتيح والإعدادات",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    noBackups: "لا توجد نسخ احتياطية",
    createBackup: "إنشاء نسخة احتياطية",
    backupName: "اسم النسخة",
    backupNamePlaceholder: "النسخة الاحتياطية 1",
    create: "إنشاء",
    cancel: "إلغاء",
    download: "تحميل",
    delete: "حذف",
    created: "تم الإنشاء",
    size: "الحجم",
    type: "النوع",
    keys: "مفاتيح",
    settings: "إعدادات",
    deleteConfirm: "هل أنت متأكد من حذف هذه النسخة؟",
    backupCreated: "تم إنشاء النسخة الاحتياطية",
    backupDeleted: "تم حذف النسخة الاحتياطية",
    enterName: "الرجاء إدخال اسم للنسخة"
  } : {
    title: "Backups",
    description: "Manage your encryption keys and settings backups",
    loading: "Loading...",
    error: "An error occurred",
    noBackups: "No backups yet",
    createBackup: "Create Backup",
    backupName: "Backup Name",
    backupNamePlaceholder: "Backup 1",
    create: "Create",
    cancel: "Cancel",
    download: "Download",
    delete: "Delete",
    created: "Created",
    size: "Size",
    type: "Type",
    keys: "Keys",
    settings: "Settings",
    deleteConfirm: "Are you sure you want to delete this backup?",
    backupCreated: "Backup created successfully",
    backupDeleted: "Backup deleted successfully",
    enterName: "Please enter a backup name"
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('secure_backups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBackups(data || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!backupName.trim()) {
      toast.error(text.enterName);
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create backup data
      const backupData = {
        keys: keys,
        settings: {
          darkMode: localStorage.getItem('cipher-dark-mode'),
          language: localStorage.getItem('cipher-language'),
        },
        timestamp: new Date().toISOString()
      };

      const backupString = JSON.stringify(backupData);
      const sizeBytes = new Blob([backupString]).size;

      const { error } = await supabase
        .from('secure_backups')
        .insert({
          user_id: user.id,
          backup_name: backupName,
          backup_type: 'keys',
          encrypted_data: backupString,
          size_bytes: sizeBytes
        });

      if (error) throw error;

      toast.success(text.backupCreated);
      setBackupName("");
      setDialogOpen(false);
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(text.error);
    } finally {
      setIsCreating(false);
    }
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      const { data, error } = await supabase
        .from('secure_backups')
        .select('encrypted_data')
        .eq('id', backup.id)
        .single();

      if (error) throw error;

      const blob = new Blob([data.encrypted_data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.backup_name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error(text.error);
    }
  };

  const deleteBackup = async (id: string) => {
    if (!confirm(text.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('secure_backups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(text.backupDeleted);
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error(text.error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container px-4 py-8">
        <div className={`mb-8 flex items-center justify-between ${isArabic ? "rtl font-arabic" : ""}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">{text.title}</h1>
            </div>
            <p className="text-muted-foreground">{text.description}</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {text.createBackup}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className={isArabic ? "rtl font-arabic" : ""}>
                  {text.createBackup}
                </DialogTitle>
                <DialogDescription className={isArabic ? "rtl font-arabic" : ""}>
                  {isArabic 
                    ? "إنشاء نسخة احتياطية من مفاتيح التشفير والإعدادات الخاصة بك"
                    : "Create a backup of your encryption keys and settings"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="backup-name" className={isArabic ? "rtl font-arabic" : ""}>
                    {text.backupName}
                  </Label>
                  <Input
                    id="backup-name"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder={text.backupNamePlaceholder}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {text.cancel}
                  </Button>
                  <Button onClick={createBackup} disabled={isCreating}>
                    {isCreating ? text.loading : text.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{text.loading}</p>
          </div>
        ) : backups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className={`text-muted-foreground ${isArabic ? "rtl font-arabic" : ""}`}>
                {text.noBackups}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {backups.map((backup) => (
              <Card key={backup.id}>
                <CardHeader>
                  <CardTitle className={`text-base ${isArabic ? "rtl font-arabic" : ""}`}>
                    {backup.backup_name}
                  </CardTitle>
                  <CardDescription className={isArabic ? "rtl font-arabic" : ""}>
                    {text.type}: {backup.backup_type === 'keys' ? text.keys : text.settings}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{text.size}:</span>
                      <span>{formatSize(backup.size_bytes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{text.created}:</span>
                      <span>
                        {format(new Date(backup.created_at), "PP", { 
                          locale: isArabic ? ar : undefined 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => downloadBackup(backup)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {text.download}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteBackup(backup.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Backups;