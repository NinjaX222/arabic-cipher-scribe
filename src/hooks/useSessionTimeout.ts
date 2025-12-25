import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  isArabic?: boolean;
  onTimeout?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  isArabic = false,
  onTimeout
}: UseSessionTimeoutOptions = {}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeoutMinutes * 60);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(async () => {
    setIsActive(false);
    await supabase.auth.signOut();
    toast.error(
      isArabic 
        ? "تم تسجيل خروجك بسبب عدم النشاط" 
        : "You have been logged out due to inactivity"
    );
    onTimeout?.();
  }, [isArabic, onTimeout]);

  const resetTimer = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setRemainingTime(timeoutMinutes * 60);

    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const timeoutTime = timeoutMinutes * 60 * 1000;

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      toast.warning(
        isArabic 
          ? `سيتم تسجيل خروجك خلال ${warningMinutes} دقائق بسبب عدم النشاط` 
          : `You will be logged out in ${warningMinutes} minutes due to inactivity`,
        { duration: 10000 }
      );
    }, warningTime);

    timeoutRef.current = setTimeout(handleTimeout, timeoutTime);
  }, [timeoutMinutes, warningMinutes, isArabic, clearTimers, handleTimeout]);

  const signOutAllDevices = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success(
        isArabic 
          ? "تم تسجيل الخروج من جميع الأجهزة" 
          : "Signed out from all devices"
      );
      return true;
    } catch (error) {
      toast.error(
        isArabic 
          ? "حدث خطأ أثناء تسجيل الخروج" 
          : "Error signing out"
      );
      return false;
    }
  }, [isArabic]);

  const extendSession = useCallback(() => {
    resetTimer();
    toast.success(
      isArabic 
        ? "تم تمديد الجلسة" 
        : "Session extended"
    );
  }, [resetTimer, isArabic]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (isActive) {
        resetTimer();
      }
    };

    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        resetTimer();
        events.forEach(event => {
          document.addEventListener(event, handleActivity, { passive: true });
        });
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsActive(true);
        resetTimer();
      } else {
        clearTimers();
        setIsActive(false);
      }
    });

    return () => {
      clearTimers();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      subscription.unsubscribe();
    };
  }, [resetTimer, clearTimers, isActive]);

  // Countdown timer for warning
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  return {
    isActive,
    showWarning,
    remainingTime,
    resetTimer,
    extendSession,
    signOutAllDevices
  };
};
