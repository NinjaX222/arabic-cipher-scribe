import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Trash2, Plus, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useCipher } from "@/contexts/CipherContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  template_name: string;
  description: string | null;
  settings: any;
  is_default: boolean;
  created_at: string;
}

const Templates = () => {
  const navigate = useNavigate();
  const { isArabic } = useCipher();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    encryptionType: "simple" as "simple" | "double",
    expirationHours: 24,
  });

  const text = isArabic ? {
    title: "قوالب التشفير",
    description: "أنشئ وأدر قوالب إعدادات التشفير المحفوظة",
    createNew: "إنشاء قالب جديد",
    name: "اسم القالب",
    descriptionLabel: "الوصف",
    encryptionType: "نوع التشفير",
    simple: "بسيط",
    double: "مزدوج",
    expiration: "انتهاء الصلاحية (ساعات)",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    default: "افتراضي",
    noTemplates: "لا توجد قوالب محفوظة",
    templateSaved: "تم حفظ القالب بنجاح",
    templateDeleted: "تم حذف القالب",
    loading: "جاري التحميل..."
  } : {
    title: "Encryption Templates",
    description: "Create and manage saved encryption settings templates",
    createNew: "Create New Template",
    name: "Template Name",
    descriptionLabel: "Description",
    encryptionType: "Encryption Type",
    simple: "Simple",
    double: "Double",
    expiration: "Expiration (hours)",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    default: "Default",
    noTemplates: "No saved templates",
    templateSaved: "Template saved successfully",
    templateDeleted: "Template deleted",
    loading: "Loading..."
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('encryption_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error(isArabic ? "خطأ في تحميل القوالب" : "Error loading templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      if (!newTemplate.name.trim()) {
        toast.error(isArabic ? "الرجاء إدخال اسم القالب" : "Please enter template name");
        return;
      }

      const { error } = await supabase
        .from('encryption_templates')
        .insert({
          user_id: user.id,
          template_name: newTemplate.name,
          description: newTemplate.description || null,
          settings: {
            encryption_type: newTemplate.encryptionType,
            expiration_hours: newTemplate.expirationHours
          },
          is_default: templates.length === 0
        });

      if (error) throw error;

      toast.success(text.templateSaved);
      setShowNewTemplate(false);
      setNewTemplate({
        name: "",
        description: "",
        encryptionType: "simple",
        expirationHours: 24,
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(isArabic ? "خطأ في حفظ القالب" : "Error saving template");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('encryption_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(text.templateDeleted);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(isArabic ? "خطأ في حذف القالب" : "Error deleting template");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{text.title}</h1>
          </div>
          <p className="text-muted-foreground">{text.description}</p>
        </div>

        <div className="mb-6">
          <Button onClick={() => setShowNewTemplate(!showNewTemplate)}>
            <Plus className="h-4 w-4 mr-2" />
            {text.createNew}
          </Button>
        </div>

        {showNewTemplate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className={isArabic ? "rtl font-arabic" : ""}>
                {text.createNew}
              </CardTitle>
            </CardHeader>
            <CardContent className={`space-y-4 ${isArabic ? "rtl font-arabic" : ""}`}>
              <div className="space-y-2">
                <Label htmlFor="name">{text.name}</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder={text.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{text.descriptionLabel}</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder={text.descriptionLabel}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="encryptionType">{text.encryptionType}</Label>
                <Select
                  value={newTemplate.encryptionType}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, encryptionType: value as "simple" | "double" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">{text.simple}</SelectItem>
                    <SelectItem value="double">{text.double}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration">{text.expiration}</Label>
                <Input
                  id="expiration"
                  type="number"
                  value={newTemplate.expirationHours}
                  onChange={(e) => setNewTemplate({ ...newTemplate, expirationHours: parseInt(e.target.value) })}
                  min="1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  {text.save}
                </Button>
                <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                  {text.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{text.loading}</p>
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className={`text-muted-foreground ${isArabic ? "rtl font-arabic" : ""}`}>
                {text.noTemplates}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${isArabic ? "rtl font-arabic" : ""}`}>
                        {template.template_name}
                      </CardTitle>
                      {template.description && (
                        <CardDescription className={isArabic ? "rtl font-arabic" : ""}>
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    {template.is_default && (
                      <Badge variant="secondary">{text.default}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={isArabic ? "rtl font-arabic" : ""}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{text.encryptionType}:</span>
                      <span>{template.settings.encryption_type === "simple" ? text.simple : text.double}</span>
                    </div>
                    {template.settings.expiration_hours && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{text.expiration}:</span>
                        <span>{template.settings.expiration_hours}h</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {text.delete}
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

export default Templates;