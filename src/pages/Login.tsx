import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TwoFactorVerification } from "@/components/TwoFactorVerification";
import { use2FA } from "@/hooks/use2FA";
import { logLoginAttempt } from "@/utils/securityNotifications";

const Login = () => {
  const { isArabic } = useCipher();
  const navigate = useNavigate();
  const { fetch2FA, twoFactorAuth } = use2FA();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const text = isArabic ? {
    title: "تسجيل الدخول",
    subtitle: "أدخل بياناتك للوصول إلى حسابك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    loginButton: "تسجيل الدخول",
    noAccount: "ليس لديك حساب؟",
    signUp: "إنشاء حساب جديد",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    passwordPlaceholder: "أدخل كلمة المرور"
  } : {
    title: "Login",
    subtitle: "Enter your credentials to access your account",
    email: "Email",
    password: "Password", 
    forgotPassword: "Forgot password?",
    loginButton: "Login",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password"
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(isArabic ? "الرجاء إدخال البريد الإلكتروني وكلمة المرور" : "Please enter email and password");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Check if user has 2FA enabled
        const { data: twoFactorData } = await supabase
          .from('two_factor_auth')
          .select('is_enabled')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (twoFactorData?.is_enabled) {
          // Log out immediately and require 2FA
          await supabase.auth.signOut();
          setTempUserId(data.user.id);
          setShow2FA(true);
          await fetch2FA();
        } else {
          // Log successful login and check for new device
          await logLoginAttempt(data.user.id, true, isArabic);
          toast.success(isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful");
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = async () => {
    // Re-authenticate after 2FA verification
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Get user and log login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logLoginAttempt(user.id, true, isArabic);
      }

      toast.success(isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful");
      navigate("/");
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during login");
    }
  };

  const handle2FACancel = () => {
    setShow2FA(false);
    setTempUserId(null);
    setPassword('');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        {show2FA ? (
          <TwoFactorVerification
            isArabic={isArabic}
            onSuccess={handle2FASuccess}
            onCancel={handle2FACancel}
          />
        ) : (
          <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{text.title}</CardTitle>
            <CardDescription>{text.subtitle}</CardDescription>
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
              
              <div className="space-y-2">
                <Label htmlFor="password">{text.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={text.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {text.forgotPassword}
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isArabic ? "جاري تسجيل الدخول..." : "Signing in...") : text.loginButton}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">{text.noAccount} </span>
                <Link to="/signup" className="text-primary hover:underline">
                  {text.signUp}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        )}
      </main>
    </div>
  );
};

export default Login;