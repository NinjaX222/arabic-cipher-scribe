import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const { isArabic } = useCipher();

  const content = isArabic ? {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث:",
    sections: [
      {
        title: "جمع المعلومات",
        content: "نحن نجمع المعلومات التي تقدمها لنا بشكل مباشر عند استخدام خدماتنا، مثل عند إنشاء حساب أو الاتصال بنا."
      },
      {
        title: "استخدام المعلومات",
        content: "نستخدم المعلومات التي نجمعها لتقديم وتحسين خدماتنا، والتواصل معك، وضمان أمان منصتنا."
      },
      {
        title: "مشاركة المعلومات",
        content: "لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات المحددة في هذه السياسة."
      },
      {
        title: "أمان البيانات",
        content: "نطبق تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير."
      },
      {
        title: "حقوقك",
        content: "لك الحق في الوصول إلى معلوماتك الشخصية وتصحيحها أو حذفها. يمكنك أيضاً الاعتراض على معالجة بياناتك في ظروف معينة."
      },
      {
        title: "الاتصال بنا",
        content: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا عبر البريد الإلكتروني أو من خلال معلومات الاتصال المتوفرة على موقعنا."
      }
    ]
  } : {
    title: "Privacy Policy",
    lastUpdated: "Last updated:",
    sections: [
      {
        title: "Information Collection",
        content: "We collect information you provide directly to us when using our services, such as when creating an account or contacting us."
      },
      {
        title: "Information Usage",
        content: "We use the information we collect to provide and improve our services, communicate with you, and ensure the security of our platform."
      },
      {
        title: "Information Sharing",
        content: "We do not sell, rent, or share your personal information with third parties except in specific cases outlined in this policy."
      },
      {
        title: "Data Security",
        content: "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction."
      },
      {
        title: "Your Rights",
        content: "You have the right to access, correct, or delete your personal information. You may also object to the processing of your data under certain circumstances."
      },
      {
        title: "Contact Us",
        content: "If you have any questions about this Privacy Policy, please contact us via email or through the contact information available on our website."
      }
    ]
  };

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            {content.title}
          </h1>
          
          <p className="text-muted-foreground text-center mb-8">
            {content.lastUpdated} {new Date().toLocaleDateString(isArabic ? 'ar' : 'en')}
          </p>
          
          <div className="space-y-8">
            {content.sections.map((section, index) => (
              <div key={index} className="border-l-4 border-primary pl-6">
                <h2 className="text-xl font-semibold mb-3 text-primary">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;