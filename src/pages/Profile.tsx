import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Camera, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

const Profile = () => {
  const { isArabic } = useCipher();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar_url: ""
  });

  const text = isArabic ? {
    title: "الملف الشخصي",
    description: "إدارة معلومات حسابك الشخصية",
    name: "الاسم",
    namePlaceholder: "أدخل اسمك",
    email: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    avatarUrl: "رابط الصورة الشخصية",
    avatarPlaceholder: "أدخل رابط صورتك",
    save: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    back: "رجوع",
    loadingProfile: "جاري تحميل البيانات...",
    updateSuccess: "تم تحديث الملف الشخصي بنجاح",
    updateError: "فشل تحديث الملف الشخصي",
    loginRequired: "يجب تسجيل الدخول أولاً"
  } : {
    title: "Profile",
    description: "Manage your account information",
    name: "Name",
    namePlaceholder: "Enter your name",
    email: "Email",
    emailPlaceholder: "Enter your email",
    avatarUrl: "Avatar URL",
    avatarPlaceholder: "Enter avatar URL",
    save: "Save Changes",
    saving: "Saving...",
    back: "Back",
    loadingProfile: "Loading profile...",
    updateSuccess: "Profile updated successfully",
    updateError: "Failed to update profile",
    loginRequired: "Please login first"
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(text.loginRequired);
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          avatar_url: data.avatar_url || ""
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error(text.updateError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          avatar_url: formData.avatar_url
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success(text.updateSuccess);
      loadProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(text.updateError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-background ${isArabic ? "rtl font-arabic" : ""}`}>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{text.loadingProfile}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className={`h-4 w-4 ${isArabic ? "rotate-180" : ""}`} />
          <span className={isArabic ? "mr-2" : "ml-2"}>{text.back}</span>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar_url} alt={formData.name} />
                  <AvatarFallback className="text-2xl">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl">{text.title}</CardTitle>
            <CardDescription>{text.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{text.name}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={text.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{text.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={text.emailPlaceholder}
                    value={formData.email}
                    disabled
                    className="pl-10 bg-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">{text.avatarUrl}</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder={text.avatarPlaceholder}
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {text.saving}
                  </>
                ) : (
                  text.save
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;