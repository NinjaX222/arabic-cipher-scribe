import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";

const Login = () => {
  const { isArabic } = useCipher();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend implementation will be added here
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
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
              <Button type="submit" className="w-full">
                {text.loginButton}
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
      </main>
    </div>
  );
};

export default Login;