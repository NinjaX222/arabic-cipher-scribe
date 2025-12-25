import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCipher } from "@/contexts/CipherContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME_MS = 5 * 60 * 1000; // Show warning 5 minutes before

export const SessionTimeoutProvider = ({ children }: { children: React.ReactNode }) => {
  const { isArabic } = useCipher();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [warningTimeoutId, setWarningTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const text = isArabic ? {
    warningTitle: "تنبيه انتهاء الجلسة",
    warningDesc: "سيتم تسجيل خروجك بسبب عدم النشاط خلال",
    seconds: "ثانية",
    extendSession: "تمديد الجلسة",
    loggedOut: "تم تسجيل خروجك بسبب عدم النشاط"
  } : {
    warningTitle: "Session Timeout Warning",
    warningDesc: "You will be logged out due to inactivity in",
    seconds: "seconds",
    extendSession: "Extend Session",
    loggedOut: "You have been logged out due to inactivity"
  };

  const clearAllTimers = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    if (warningTimeoutId) {
      clearTimeout(warningTimeoutId);
      setWarningTimeoutId(null);
    }
  }, [timeoutId, warningTimeoutId]);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    await supabase.auth.signOut();
    toast.error(text.loggedOut);
    navigate('/login');
  }, [clearAllTimers, navigate, text.loggedOut]);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setRemainingSeconds(300);

    if (!isAuthenticated) return;

    // Set warning timer
    const newWarningTimeoutId = setTimeout(() => {
      setShowWarning(true);
    }, SESSION_TIMEOUT_MS - WARNING_TIME_MS);

    // Set logout timer
    const newTimeoutId = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT_MS);

    setWarningTimeoutId(newWarningTimeoutId);
    setTimeoutId(newTimeoutId);
  }, [clearAllTimers, isAuthenticated, handleLogout]);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    resetTimer();
    toast.success(isArabic ? "تم تمديد الجلسة" : "Session extended");
  }, [resetTimer, isArabic]);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        clearAllTimers();
        setShowWarning(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [clearAllTimers]);

  // Start/reset timer on auth change or activity
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      return;
    }

    resetTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimer, showWarning]);

  // Countdown timer for warning
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  return (
    <>
      {children}
      <AlertDialog open={showWarning && isAuthenticated}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <AlertDialogTitle>{text.warningTitle}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-center py-4">
              <span className="text-lg">{text.warningDesc}</span>
              <br />
              <span className="text-3xl font-bold text-foreground">{remainingSeconds}</span>
              <span className="text-lg"> {text.seconds}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button onClick={extendSession} className="w-full">
                {text.extendSession}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
