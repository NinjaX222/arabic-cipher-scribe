import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const { isArabic } = useCipher();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const text = isArabic ? {
    title: "نسيت كلمة المرور",
    description: "أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور",
    email: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    sendButton: "إرسال رابط الاستعادة",
    backToLogin: "العودة لتسجيل الدخول",
    successTitle: "تم إرسال البريد الإلكتروني",
    successDescription: "تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور",
    checkSpam: "إذا لم تجد البريد، تحقق من مجلد الرسائل غير المرغوب فيها",
    error: "حدث خطأ أثناء إرسال البريد الإلكتروني",
    invalidEmail: "الرجاء إدخال بريد إلكتروني صالح"
  } : {
    title: "Forgot Password",
    description: "Enter your email and we'll send you a link to reset your password",
    email: "Email",
    emailPlaceholder: "Enter your email",
    sendButton: "Send Reset Link",
    backToLogin: "Back to Login",
    successTitle: "Email Sent",
    successDescription: "Check your email for a password reset link",
    checkSpam: "If you don't see the email, check your spam folder",
    error: "Error sending email",
    invalidEmail: "Please enter a valid email"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error(text.invalidEmail);
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsEmailSent(true);
    } catch (error) {
      toast.error(text.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          {isEmailSent ? (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">{text.successTitle}</CardTitle>
                <CardDescription>{text.successDescription}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-6">{text.checkSpam}</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {text.backToLogin}
                  </Button>
                </Link>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">{text.title}</CardTitle>
                <CardDescription>{text.description}</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{text.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={text.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (isArabic ? "جاري الإرسال..." : "Sending...") : text.sendButton}
                  </Button>
                  
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {text.backToLogin}
                    </Button>
                  </Link>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </main>
    </div>
  );
};

export default ForgotPassword;
