import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useCipher } from "@/contexts/CipherContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ActivityLog {
  id: string;
  action_type: string;
  resource_type: string;
  resource_name: string | null;
  status: string;
  created_at: string;
}

const ActivityLog = () => {
  const navigate = useNavigate();
  const { isArabic } = useCipher();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const text = isArabic ? {
    title: "سجل الأنشطة",
    description: "تتبع جميع عمليات التشفير وفك التشفير",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    noActivities: "لا توجد أنشطة حتى الآن",
    filter: "تصفية حسب النوع",
    all: "الكل",
    encrypt: "تشفير",
    decrypt: "فك التشفير",
    generate: "توليد مفتاح",
    success: "نجح",
    failed: "فشل",
    text: "نص",
    file: "ملف",
    image: "صورة",
    audio: "صوت",
    video: "فيديو"
  } : {
    title: "Activity Log",
    description: "Track all your encryption and decryption operations",
    loading: "Loading...",
    error: "An error occurred",
    noActivities: "No activities yet",
    filter: "Filter by type",
    all: "All",
    encrypt: "Encrypt",
    decrypt: "Decrypt",
    generate: "Generate Key",
    success: "Success",
    failed: "Failed",
    text: "Text",
    file: "File",
    image: "Image",
    audio: "Audio",
    video: "Video"
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const actions: Record<string, string> = {
      encrypt: text.encrypt,
      decrypt: text.decrypt,
      generate: text.generate
    };
    return actions[action] || action;
  };

  const getResourceLabel = (resource: string) => {
    const resources: Record<string, string> = {
      text: text.text,
      file: text.file,
      image: text.image,
      audio: text.audio,
      video: text.video
    };
    return resources[resource] || resource;
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" => {
    return status === "success" ? "default" : "destructive";
  };

  const filteredActivities = filterType === "all" 
    ? activities 
    : activities.filter(activity => activity.action_type === filterType);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{text.title}</h1>
          </div>
          <p className="text-muted-foreground">{text.description}</p>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className={isArabic ? "rtl font-arabic" : ""}>
                {text.filter}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.all}</SelectItem>
                <SelectItem value="encrypt">{text.encrypt}</SelectItem>
                <SelectItem value="decrypt">{text.decrypt}</SelectItem>
                <SelectItem value="generate">{text.generate}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{text.loading}</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className={`text-muted-foreground ${isArabic ? "rtl font-arabic" : ""}`}>
                {text.noActivities}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="pt-6">
                  <div className={`flex items-start justify-between ${isArabic ? "rtl font-arabic" : ""}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getStatusVariant(activity.status)}>
                          {activity.status === "success" ? text.success : text.failed}
                        </Badge>
                        <span className="font-medium">
                          {getActionLabel(activity.action_type)}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {getResourceLabel(activity.resource_type)}
                        </span>
                      </div>
                      {activity.resource_name && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.resource_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(activity.created_at), "PPp", { 
                            locale: isArabic ? ar : undefined 
                          })}
                        </span>
                      </div>
                    </div>
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

export default ActivityLog;