import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X, AlertTriangle } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  isArabic?: boolean;
}

interface PasswordCheck {
  label: string;
  passed: boolean;
}

export const PasswordStrengthMeter = ({ password, isArabic = false }: PasswordStrengthMeterProps) => {
  const analysis = useMemo(() => {
    const checks: PasswordCheck[] = [
      {
        label: isArabic ? "8 أحرف على الأقل" : "At least 8 characters",
        passed: password.length >= 8
      },
      {
        label: isArabic ? "حرف كبير" : "Uppercase letter",
        passed: /[A-Z]/.test(password)
      },
      {
        label: isArabic ? "حرف صغير" : "Lowercase letter",
        passed: /[a-z]/.test(password)
      },
      {
        label: isArabic ? "رقم" : "Number",
        passed: /[0-9]/.test(password)
      },
      {
        label: isArabic ? "رمز خاص (!@#$%)" : "Special character (!@#$%)",
        passed: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    ];

    const passedCount = checks.filter(c => c.passed).length;
    const strength = passedCount === 0 ? 0 : (passedCount / checks.length) * 100;

    let strengthLabel = "";
    let strengthColor = "";

    if (strength === 0) {
      strengthLabel = "";
      strengthColor = "";
    } else if (strength <= 40) {
      strengthLabel = isArabic ? "ضعيفة" : "Weak";
      strengthColor = "text-destructive";
    } else if (strength <= 60) {
      strengthLabel = isArabic ? "متوسطة" : "Fair";
      strengthColor = "text-yellow-500";
    } else if (strength <= 80) {
      strengthLabel = isArabic ? "جيدة" : "Good";
      strengthColor = "text-blue-500";
    } else {
      strengthLabel = isArabic ? "قوية جداً" : "Strong";
      strengthColor = "text-green-500";
    }

    return { checks, strength, strengthLabel, strengthColor, passedCount };
  }, [password, isArabic]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {isArabic ? "قوة كلمة المرور" : "Password strength"}
        </span>
        <span className={`text-sm font-medium ${analysis.strengthColor}`}>
          {analysis.strengthLabel}
        </span>
      </div>
      
      <Progress 
        value={analysis.strength} 
        className="h-2"
      />
      
      <div className="grid grid-cols-1 gap-1 text-sm">
        {analysis.checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2">
            {check.passed ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {analysis.strength > 0 && analysis.strength < 60 && (
        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-md text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">
            {isArabic 
              ? "كلمة المرور ضعيفة، جرب إضافة المزيد من التنوع"
              : "Weak password, try adding more variety"}
          </span>
        </div>
      )}
    </div>
  );
};
