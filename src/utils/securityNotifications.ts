import { supabase } from "@/integrations/supabase/client";

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
}

const getDeviceFingerprint = (): DeviceInfo => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`
  };
};

const hashDeviceInfo = (info: DeviceInfo): string => {
  const str = JSON.stringify(info);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const checkAndNotifyNewDevice = async (userId: string, isArabic: boolean): Promise<boolean> => {
  try {
    const deviceInfo = getDeviceFingerprint();
    const deviceHash = hashDeviceInfo(deviceInfo);
    const storageKey = `known_devices_${userId}`;
    
    // Get known devices from localStorage
    const knownDevicesStr = localStorage.getItem(storageKey);
    const knownDevices: string[] = knownDevicesStr ? JSON.parse(knownDevicesStr) : [];
    
    const isNewDevice = !knownDevices.includes(deviceHash);
    
    if (isNewDevice) {
      // Add device to known devices
      knownDevices.push(deviceHash);
      localStorage.setItem(storageKey, JSON.stringify(knownDevices));
      
      // Create notification for new device login
      await supabase.from('notifications').insert({
        user_id: userId,
        title: isArabic ? "تسجيل دخول من جهاز جديد" : "Login from new device",
        message: isArabic 
          ? `تم تسجيل الدخول إلى حسابك من جهاز جديد. المتصفح: ${deviceInfo.userAgent.substring(0, 50)}...`
          : `Your account was accessed from a new device. Browser: ${deviceInfo.userAgent.substring(0, 50)}...`,
        type: 'security'
      });
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action_type: 'login',
        resource_type: 'text',
        resource_name: 'new_device_login',
        status: 'success',
        details: {
          device_hash: deviceHash,
          platform: deviceInfo.platform,
          is_new_device: true
        },
        user_agent: deviceInfo.userAgent
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking device:', error);
    return false;
  }
};

export const detectSuspiciousActivity = async (userId: string, isArabic: boolean): Promise<void> => {
  try {
    // Check for multiple failed attempts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false });
    
    if (!recentLogs) return;
    
    // Check for suspicious patterns
    const failedAttempts = recentLogs.filter(log => log.status === 'failed').length;
    const rapidActions = recentLogs.length > 50; // More than 50 actions in an hour
    
    if (failedAttempts >= 5) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: isArabic ? "نشاط مشبوه مكتشف" : "Suspicious Activity Detected",
        message: isArabic 
          ? `تم اكتشاف ${failedAttempts} محاولات فاشلة في الساعة الأخيرة. يرجى التحقق من أمان حسابك.`
          : `${failedAttempts} failed attempts detected in the last hour. Please verify your account security.`,
        type: 'warning'
      });
    }
    
    if (rapidActions) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: isArabic ? "نشاط غير عادي" : "Unusual Activity",
        message: isArabic 
          ? "تم اكتشاف نشاط مكثف غير عادي على حسابك. إذا لم تكن أنت، قم بتغيير كلمة المرور فوراً."
          : "Unusually high activity detected on your account. If this wasn't you, change your password immediately.",
        type: 'warning'
      });
    }
    
    // Check for activity from multiple locations (different user agents)
    const uniqueAgents = new Set(recentLogs.map(log => log.user_agent?.substring(0, 30))).size;
    if (uniqueAgents > 3) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: isArabic ? "تسجيل دخول من عدة أجهزة" : "Multiple Device Access",
        message: isArabic 
          ? "تم الوصول إلى حسابك من عدة أجهزة مختلفة. تأكد من أن جميع الجلسات مصرح بها."
          : "Your account was accessed from multiple different devices. Ensure all sessions are authorized.",
        type: 'info'
      });
    }
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
  }
};

export const logLoginAttempt = async (
  userId: string, 
  success: boolean, 
  isArabic: boolean
): Promise<void> => {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: 'login',
      resource_type: 'text',
      resource_name: 'user_login',
      status: success ? 'success' : 'failed',
      user_agent: navigator.userAgent
    });
    
    if (success) {
      // Check for new device and suspicious activity
      await checkAndNotifyNewDevice(userId, isArabic);
      await detectSuspiciousActivity(userId, isArabic);
    }
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};
