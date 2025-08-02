
import { Link } from "react-router-dom";
import { useCipher } from "@/contexts/CipherContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LockIcon, KeyRound, Mic, ImageIcon, VideoIcon, Share2 } from "lucide-react";

const Index = () => {
  const { isArabic } = useCipher();
  
  const text = isArabic ? {
    title: "مشفر النصوص",
    subtitle: "منصة شاملة لتشفير وحماية بياناتك بأمان",
    textEncryption: "تشفير النصوص",
    textDescription: "قم بتشفير وفك تشفير الرسائل النصية بأمان",
    audioEncryption: "تشفير الصوت", 
    audioDescription: "قم بتشفير وفك تشفير الرسائل الصوتية بأمان",
    imageEncryption: "تشفير الصور",
    imageDescription: "حماية صورك بتشفير متقدم",
    videoEncryption: "تشفير الفيديو",
    videoDescription: "تشفير ملفات الفيديو الخاصة بك",
    passwordGenerator: "مولد كلمات المرور",
    passwordDescription: "إنشاء كلمات مرور قوية وآمنة",
    shareApp: "مشاركة التطبيق",
    shareDescription: "شارك التطبيق مع الأصدقاء والعائلة"
  } : {
    title: "Cipher Scribe",
    subtitle: "Complete platform for encrypting and securing your data safely",
    textEncryption: "Text Encryption",
    textDescription: "Encrypt and decrypt text messages securely",
    audioEncryption: "Audio Encryption",
    audioDescription: "Encrypt and decrypt audio messages securely", 
    imageEncryption: "Image Encryption",
    imageDescription: "Protect your images with advanced encryption",
    videoEncryption: "Video Encryption", 
    videoDescription: "Encrypt your video files securely",
    passwordGenerator: "Password Generator",
    passwordDescription: "Generate strong and secure passwords",
    shareApp: "Share App",
    shareDescription: "Share the app with friends and family"
  };

  const encryptionTools = [
    {
      title: text.textEncryption,
      description: text.textDescription,
      icon: LockIcon,
      link: "/text-encryption",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: text.audioEncryption,
      description: text.audioDescription,
      icon: Mic,
      link: "/audio-encryption", 
      gradient: "from-green-500 to-blue-500"
    },
    {
      title: text.imageEncryption,
      description: text.imageDescription,
      icon: ImageIcon,
      link: "/image-encryption",
      gradient: "from-pink-500 to-red-500"
    },
    {
      title: text.videoEncryption,
      description: text.videoDescription,
      icon: VideoIcon,
      link: "/video-encryption",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: text.passwordGenerator,
      description: text.passwordDescription,
      icon: KeyRound,
      link: "/password-generator",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: text.shareApp,
      description: text.shareDescription,
      icon: Share2,
      link: "/share",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8">
        {/* Hero Section */}
        <div className={`text-center mb-12 ${isArabic ? "rtl font-arabic" : ""}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {text.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        {/* Encryption Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {encryptionTools.map((tool, index) => (
            <Link key={index} to={tool.link} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-lg`}>
                    <tool.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className={`text-xl ${isArabic ? "font-arabic" : ""}`}>
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-center ${isArabic ? "font-arabic" : ""}`}>
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;

