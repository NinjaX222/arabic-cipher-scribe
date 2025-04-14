
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCipher } from "@/contexts/CipherContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockIcon, KeyRound, ShieldAlert, BookOpen, Info } from "lucide-react";

interface HelpTexts {
  title: string;
  description: string;
  basicsSection: string;
  typesSection: string;
  securitySection: string;
  faqSection: string;
  encryptionBasics: {
    title: string;
    content: string;
  };
  decryptionBasics: {
    title: string;
    content: string;
  };
  keysBasics: {
    title: string;
    content: string;
  };
  aesType: {
    title: string;
    content: string;
  };
  doubleType: {
    title: string;
    content: string;
  };
  passwordSafety: {
    title: string;
    content: string;
  };
  keySafety: {
    title: string;
    content: string;
  };
  faq: {
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
  };
}

const englishText: HelpTexts = {
  title: "Help & Guide",
  description: "Learn how to use the Arabic Cipher Scribe application and understand different encryption methods",
  basicsSection: "Basic Concepts",
  typesSection: "Encryption Types",
  securitySection: "Security Tips",
  faqSection: "Frequently Asked Questions",
  encryptionBasics: {
    title: "What is Encryption?",
    content: "Encryption is the process of converting readable text (plaintext) into an unreadable format (ciphertext) using mathematical algorithms. This ensures that only authorized parties with the correct key can access the original information. In this application, you can encrypt any text message to protect its contents from unauthorized access."
  },
  decryptionBasics: {
    title: "What is Decryption?",
    content: "Decryption is the reverse process of encryption, converting encrypted text (ciphertext) back to its original readable form (plaintext). This requires the correct encryption key or password that was used during the encryption process. Without the proper key, the encrypted message remains unreadable and secure."
  },
  keysBasics: {
    title: "Understanding Encryption Keys",
    content: "Encryption keys are secure strings of data that act like digital passwords for locking and unlocking your encrypted messages. A strong key significantly improves security. In this application, you can create, manage, and store encryption keys securely for future use. Keys can have expiration dates to enhance security."
  },
  aesType: {
    title: "AES-256 Encryption",
    content: "AES (Advanced Encryption Standard) with 256-bit key length is one of the most secure encryption algorithms available today. It's a symmetric encryption method, meaning the same key is used for both encryption and decryption. AES-256 is widely used by governments and organizations worldwide for securing sensitive data."
  },
  doubleType: {
    title: "Double Encryption",
    content: "Double encryption applies two layers of encryption using different keys, significantly enhancing security. This technique makes it extremely difficult for attackers to decode your message, as they would need to break through two separate encryption layers. In our application, you can use two different passwords to apply double encryption to your messages."
  },
  passwordSafety: {
    title: "Creating Strong Passwords",
    content: "A strong password should be at least 12 characters long, include a mix of uppercase and lowercase letters, numbers, and special characters. Avoid using personal information, common words, or sequential characters. Consider using a passphrase - a sequence of random words that's easy for you to remember but hard for others to guess."
  },
  keySafety: {
    title: "Keeping Your Keys Secure",
    content: "Never share your encryption keys or passwords with unauthorized individuals. Consider using different keys for different types of messages. Regularly generate new keys for sensitive communications. If you suspect a key has been compromised, immediately generate a new one and re-encrypt any sensitive information."
  },
  faq: {
    q1: "Is my data stored on any server?",
    a1: "No. Arabic Cipher Scribe works entirely on your device. Your original messages and encryption keys are never sent to any external server.",
    q2: "Can I recover my message if I forget my password or lose my key?",
    a2: "No. For security reasons, there is no way to recover encrypted data without the correct key or password. This ensures that no one, including us, can access your encrypted data without authorization.",
    q3: "How secure is this encryption?",
    a3: "The application uses industry-standard AES-256 encryption, which is extremely secure and widely used by governments and financial institutions. Double encryption adds another layer of protection.",
    q4: "Can I use this for sensitive or confidential information?",
    a4: "Yes, but always follow your organization's security policies. While our encryption is strong, no system can guarantee absolute security against all possible threats."
  }
};

const arabicText: HelpTexts = {
  title: "المساعدة والدليل",
  description: "تعرّف على كيفية استخدام تطبيق مشفر النصوص العربي وفهم طرق التشفير المختلفة",
  basicsSection: "المفاهيم الأساسية",
  typesSection: "أنواع التشفير",
  securitySection: "نصائح الأمان",
  faqSection: "الأسئلة الشائعة",
  encryptionBasics: {
    title: "ما هو التشفير؟",
    content: "التشفير هو عملية تحويل النص المقروء (النص العادي) إلى تنسيق غير مقروء (النص المشفر) باستخدام خوارزميات رياضية. هذا يضمن أن الأطراف المصرح لها فقط ولديها المفتاح الصحيح يمكنها الوصول إلى المعلومات الأصلية. في هذا التطبيق، يمكنك تشفير أي رسالة نصية لحماية محتوياتها من الوصول غير المصرح به."
  },
  decryptionBasics: {
    title: "ما هو فك التشفير؟",
    content: "فك التشفير هو العملية العكسية للتشفير، حيث يتم تحويل النص المشفر إلى شكله الأصلي المقروء. يتطلب ذلك مفتاح التشفير أو كلمة المرور الصحيحة التي تم استخدامها أثناء عملية التشفير. بدون المفتاح المناسب، تظل الرسالة المشفرة غير مقروءة وآمنة."
  },
  keysBasics: {
    title: "فهم مفاتيح التشفير",
    content: "مفاتيح التشفير هي سلاسل آمنة من البيانات تعمل مثل كلمات المرور الرقمية لقفل وفتح رسائلك المشفرة. المفتاح القوي يحسن الأمان بشكل كبير. في هذا التطبيق، يمكنك إنشاء وإدارة وتخزين مفاتيح التشفير بشكل آمن للاستخدام في المستقبل. يمكن أن يكون للمفاتيح تواريخ انتهاء صلاحية لتعزيز الأمان."
  },
  aesType: {
    title: "تشفير AES-256",
    content: "يعد معيار التشفير المتقدم (AES) بطول مفتاح 256 بت أحد أكثر خوارزميات التشفير أمانًا المتاحة اليوم. إنها طريقة تشفير متماثلة، مما يعني أن نفس المفتاح يستخدم للتشفير وفك التشفير. يستخدم AES-256 على نطاق واسع من قبل الحكومات والمؤسسات في جميع أنحاء العالم لتأمين البيانات الحساسة."
  },
  doubleType: {
    title: "التشفير المزدوج",
    content: "يطبق التشفير المزدوج طبقتين من التشفير باستخدام مفاتيح مختلفة، مما يعزز الأمان بشكل كبير. تجعل هذه التقنية من الصعب للغاية على المهاجمين فك شفرة رسالتك، لأنهم سيحتاجون إلى اختراق طبقتي تشفير منفصلتين. في تطبيقنا، يمكنك استخدام كلمتي مرور مختلفتين لتطبيق التشفير المزدوج على رسائلك."
  },
  passwordSafety: {
    title: "إنشاء كلمات مرور قوية",
    content: "يجب أن تتكون كلمة المرور القوية من 12 حرفًا على الأقل، وتتضمن مزيجًا من الأحرف الكبيرة والصغيرة والأرقام والرموز الخاصة. تجنب استخدام المعلومات الشخصية أو الكلمات الشائعة أو الأحرف المتسلسلة. فكر في استخدام عبارة مرور - تسلسل من الكلمات العشوائية يسهل عليك تذكرها ويصعب على الآخرين تخمينها."
  },
  keySafety: {
    title: "الحفاظ على أمان مفاتيحك",
    content: "لا تشارك أبدًا مفاتيح التشفير أو كلمات المرور الخاصة بك مع أشخاص غير مصرح لهم. فكر في استخدام مفاتيح مختلفة لأنواع مختلفة من الرسائل. قم بإنشاء مفاتيح جديدة بانتظام للاتصالات الحساسة. إذا كنت تشك في أن المفتاح قد تم اختراقه، فقم على الفور بإنشاء مفتاح جديد وإعادة تشفير أي معلومات حساسة."
  },
  faq: {
    q1: "هل يتم تخزين بياناتي على أي خادم؟",
    a1: "لا. يعمل مشفر النصوص العربي بالكامل على جهازك. لا يتم إرسال رسائلك الأصلية ومفاتيح التشفير إلى أي خادم خارجي أبدًا.",
    q2: "هل يمكنني استرداد رسالتي إذا نسيت كلمة المرور أو فقدت المفتاح؟",
    a2: "لا. لأسباب أمنية، لا توجد طريقة لاسترداد البيانات المشفرة بدون المفتاح أو كلمة المرور الصحيحة. هذا يضمن أن لا أحد، بما في ذلك نحن، يمكنه الوصول إلى بياناتك المشفرة دون إذن.",
    q3: "ما مدى أمان هذا التشفير؟",
    a3: "يستخدم التطبيق تشفير AES-256 القياسي في الصناعة، وهو آمن للغاية ويستخدم على نطاق واسع من قبل الحكومات والمؤسسات المالية. يضيف التشفير المزدوج طبقة أخرى من الحماية.",
    q4: "هل يمكنني استخدام هذا للمعلومات الحساسة أو السرية؟",
    a4: "نعم، ولكن اتبع دائمًا سياسات الأمان الخاصة بمؤسستك. على الرغم من أن التشفير لدينا قوي، لا يمكن لأي نظام ضمان الأمان المطلق ضد جميع التهديدات المحتملة."
  }
};

const Help: React.FC = () => {
  const { isArabic } = useCipher();
  const text = isArabic ? arabicText : englishText;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 container px-4 py-8 ${isArabic ? "rtl font-arabic" : ""}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <BookOpen className="h-8 w-8 text-cipher-purple" />
              {text.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {text.description}
            </p>
          </div>
          
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">{text.basicsSection}</TabsTrigger>
              <TabsTrigger value="types">{text.typesSection}</TabsTrigger>
              <TabsTrigger value="security">{text.securitySection}</TabsTrigger>
              <TabsTrigger value="faq">{text.faqSection}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-cipher-purple" />
                    {text.encryptionBasics.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{text.encryptionBasics.content}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockIcon className="h-5 w-5 text-cipher-purple" />
                    {text.decryptionBasics.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{text.decryptionBasics.content}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-cipher-purple" />
                    {text.keysBasics.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{text.keysBasics.content}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="types" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockIcon className="h-5 w-5 text-cipher-purple" />
                    {text.aesType.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{text.aesType.content}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-cipher-purple" />
                    {text.doubleType.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{text.doubleType.content}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-cipher-purple" />
                    {text.passwordSafety.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{text.passwordSafety.content}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-cipher-purple" />
                    {text.keySafety.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{text.keySafety.content}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {text.faqSection}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? "الأسئلة الشائعة حول استخدام التطبيق وميزات الأمان" : "Common questions about using the application and its security features"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>{text.faq.q1}</AccordionTrigger>
                      <AccordionContent>{text.faq.a1}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>{text.faq.q2}</AccordionTrigger>
                      <AccordionContent>{text.faq.a2}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>{text.faq.q3}</AccordionTrigger>
                      <AccordionContent>{text.faq.a3}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>{text.faq.q4}</AccordionTrigger>
                      <AccordionContent>{text.faq.a4}</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Help;
