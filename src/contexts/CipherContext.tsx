
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { listStoredKeys, storeKey, retrieveKey, deleteKey, generateKey } from '@/utils/encryption';

interface KeyInfo {
  id: string;
  expiration: Date;
}

interface CipherContextType {
  keys: KeyInfo[];
  activeKeyId: string | null;
  isArabic: boolean;
  isDarkMode: boolean;
  addKey: (id: string, key: string, expirationHours?: number) => void;
  removeKey: (id: string) => void;
  setActiveKeyId: (id: string | null) => void;
  generateNewKey: (id: string, expirationHours?: number) => string;
  toggleLanguage: () => void;
  toggleDarkMode: () => void;
}

const CipherContext = createContext<CipherContextType | undefined>(undefined);

export const CipherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isArabic, setIsArabic] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Load stored keys on mount
    setKeys(listStoredKeys());
    
    // Check for user's preferred color scheme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedDarkMode = localStorage.getItem('cipher-dark-mode');
    const darkModeEnabled = savedDarkMode !== null ? savedDarkMode === 'true' : prefersDark;
    
    setIsDarkMode(darkModeEnabled);
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check saved language preference
    const savedLanguage = localStorage.getItem('cipher-language');
    if (savedLanguage === 'ar') {
      setIsArabic(true);
    }
  }, []);

  const addKey = (id: string, key: string, expirationHours = 24) => {
    try {
      storeKey(id, key, expirationHours);
      setKeys(listStoredKeys());
      toast.success(isArabic ? "مفتاح جديد تم إضافته بنجاح" : "New key added successfully", {
        description: isArabic 
          ? `تم إضافة المفتاح بمعرف: ${id}`
          : `Key added with ID: ${id}`
      });
    } catch (error) {
      console.error('Error adding key:', error);
      toast.error(isArabic ? "فشل في إضافة المفتاح" : "Failed to add key", { 
        description: isArabic 
          ? "حدث خطأ أثناء تخزين المفتاح"
          : "An error occurred while storing the key"
      });
    }
  };

  const removeKey = (id: string) => {
    try {
      deleteKey(id);
      setKeys(listStoredKeys());
      if (activeKeyId === id) {
        setActiveKeyId(null);
      }
      toast.success(isArabic ? "تم حذف المفتاح" : "Key deleted", { 
        description: isArabic 
          ? `تم حذف المفتاح بمعرف: ${id}`
          : `Key with ID ${id} has been deleted`
      });
    } catch (error) {
      console.error('Error removing key:', error);
      toast.error(isArabic ? "فشل في حذف المفتاح" : "Failed to delete key", { 
        description: isArabic 
          ? "حدث خطأ أثناء حذف المفتاح"
          : "An error occurred while deleting the key"
      });
    }
  };

  const generateNewKey = (id: string, expirationHours = 24) => {
    const newKey = generateKey();
    addKey(id, newKey, expirationHours);
    return newKey;
  };

  const toggleLanguage = () => {
    setIsArabic(prev => {
      const newValue = !prev;
      localStorage.setItem('cipher-language', newValue ? 'ar' : 'en');
      return newValue;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('cipher-dark-mode', String(newMode));
      
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  return (
    <CipherContext.Provider
      value={{
        keys,
        activeKeyId,
        isArabic,
        isDarkMode,
        addKey,
        removeKey,
        setActiveKeyId,
        generateNewKey,
        toggleLanguage,
        toggleDarkMode
      }}
    >
      {children}
    </CipherContext.Provider>
  );
};

export const useCipher = (): CipherContextType => {
  const context = useContext(CipherContext);
  if (context === undefined) {
    throw new Error('useCipher must be used within a CipherProvider');
  }
  return context;
};
