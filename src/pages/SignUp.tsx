import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";

const SignUp = () => {
  const { isArabic } = useCipher();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });

  const text = isArabic ? {
    title: "إنشاء حساب جديد",
    subtitle: "أنشئ حسابك للبدء في استخدام الخدمة",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني", 
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    acceptTerms: "أوافق على",
    termsLink: "الشروط والأحكام",
    and: "و",
    privacyLink: "سياسة الخصوصية",
    signUpButton: "إنشاء الحساب",
    hasAccount: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    namePlaceholder: "أدخل اسمك الكامل",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    passwordPlaceholder: "أدخل كلمة المرور",
    confirmPasswordPlaceholder: "أكد كلمة المرور"
  } : {
    title: "Create Account",
    subtitle: "Create your account to get started",
    name: "Full Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password", 
    acceptTerms: "I agree to the",
    termsLink: "Terms and Conditions",
    and: "and",
    privacyLink: "Privacy Policy",
    signUpButton: "Create Account",
    hasAccount: "Already have an account?",
    login: "Login",
    namePlaceholder: "Enter your full name",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    confirmPasswordPlaceholder: "Confirm your password"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend implementation will be added here
    console.log("Sign up attempt:", formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                <Label htmlFor="name">{text.name}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={text.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{text.confirmPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={text.confirmPasswordPlaceholder}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                  }
                />
                <div className="text-sm leading-relaxed">
                  <span className="text-muted-foreground">{text.acceptTerms} </span>
                  <Link to="/terms" className="text-primary hover:underline">
                    {text.termsLink}
                  </Link>
                  <span className="text-muted-foreground"> {text.and} </span>
                  <Link to="/privacy" className="text-primary hover:underline">
                    {text.privacyLink}
                  </Link>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={!formData.acceptTerms}
              >
                {text.signUpButton}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">{text.hasAccount} </span>
                <Link to="/login" className="text-primary hover:underline">
                  {text.login}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default SignUp;