import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Activity, FileText, Image, Mic, Video, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { useCipher } from "@/contexts/CipherContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Statistics = () => {
  const navigate = useNavigate();
  const { isArabic } = useCipher();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_encryptions: 0,
    total_decryptions: 0,
    total_files_encrypted: 0,
    total_images_encrypted: 0,
    total_audio_encrypted: 0,
    total_video_encrypted: 0,
    total_keys_generated: 0,
  });

  const text = isArabic ? {
    title: "الإحصائيات",
    description: "تتبع نشاطك في التشفير",
    totalEncryptions: "إجمالي عمليات التشفير",
    totalDecryptions: "إجمالي عمليات فك التشفير",
    filesEncrypted: "الملفات المشفرة",
    imagesEncrypted: "الصور المشفرة",
    audioEncrypted: "الملفات الصوتية المشفرة",
    videoEncrypted: "الفيديوهات المشفرة",
    keysGenerated: "المفاتيح المولدة",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    noData: "لا توجد بيانات حتى الآن"
  } : {
    title: "Statistics",
    description: "Track your encryption activity",
    totalEncryptions: "Total Encryptions",
    totalDecryptions: "Total Decryptions",
    filesEncrypted: "Files Encrypted",
    imagesEncrypted: "Images Encrypted",
    audioEncrypted: "Audio Encrypted",
    videoEncrypted: "Videos Encrypted",
    keysGenerated: "Keys Generated",
    loading: "Loading...",
    error: "An error occurred",
    noData: "No data yet"
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStats(data);
      } else {
        // Create initial statistics record
        const { error: insertError } = await supabase
          .from('user_statistics')
          .insert({ user_id: user.id });
        
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: text.totalEncryptions,
      value: stats.total_encryptions,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: text.totalDecryptions,
      value: stats.total_decryptions,
      icon: Activity,
      color: "text-blue-600"
    },
    {
      title: text.filesEncrypted,
      value: stats.total_files_encrypted,
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: text.imagesEncrypted,
      value: stats.total_images_encrypted,
      icon: Image,
      color: "text-pink-600"
    },
    {
      title: text.audioEncrypted,
      value: stats.total_audio_encrypted,
      icon: Mic,
      color: "text-orange-600"
    },
    {
      title: text.videoEncrypted,
      value: stats.total_video_encrypted,
      icon: Video,
      color: "text-red-600"
    },
    {
      title: text.keysGenerated,
      value: stats.total_keys_generated,
      icon: Key,
      color: "text-yellow-600"
    },
  ];

  const totalOperations = stats.total_encryptions + stats.total_decryptions;
  const encryptionPercentage = totalOperations > 0 
    ? (stats.total_encryptions / totalOperations) * 100 
    : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{text.title}</h1>
          </div>
          <p className="text-muted-foreground">{text.description}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{text.loading}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className={isArabic ? "rtl font-arabic" : ""}>
                  {isArabic ? "نظرة عامة" : "Overview"}
                </CardTitle>
                <CardDescription className={isArabic ? "rtl font-arabic" : ""}>
                  {isArabic 
                    ? "نسبة عمليات التشفير إلى فك التشفير" 
                    : "Encryption vs Decryption ratio"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{text.totalEncryptions}</span>
                    <span className="font-medium">{stats.total_encryptions}</span>
                  </div>
                  <Progress value={encryptionPercentage} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>{text.totalDecryptions}</span>
                    <span className="font-medium">{stats.total_decryptions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${isArabic ? "rtl font-arabic" : ""}`}>
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            {totalOperations > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className={isArabic ? "rtl font-arabic" : ""}>
                      {isArabic ? "نشاط التشفير" : "Encryption Activity"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: isArabic ? "ملفات" : "Files", value: stats.total_files_encrypted },
                        { name: isArabic ? "صور" : "Images", value: stats.total_images_encrypted },
                        { name: isArabic ? "صوت" : "Audio", value: stats.total_audio_encrypted },
                        { name: isArabic ? "فيديو" : "Video", value: stats.total_video_encrypted },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className={isArabic ? "rtl font-arabic" : ""}>
                      {isArabic ? "توزيع العمليات" : "Operations Distribution"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: text.totalEncryptions, value: stats.total_encryptions },
                            { name: text.totalDecryptions, value: stats.total_decryptions },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          <Cell fill="hsl(var(--primary))" />
                          <Cell fill="hsl(var(--secondary))" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {totalOperations === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className={`text-muted-foreground ${isArabic ? "rtl font-arabic" : ""}`}>
                    {text.noData}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;