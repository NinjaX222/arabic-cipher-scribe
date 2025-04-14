
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
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const addKey = (id: string, key: string, expirationHours = 24) => {
    try {
      storeKey(id, key, expirationHours);
      setKeys(listStoredKeys());
      toast.success("مفتاح جديد تم إضافته بنجاح", {
        description: `تم إضافة المفتاح بمعرف: ${id}`
      });
    } catch (error) {
      console.error('Error adding key:', error);
      toast.error("فشل في إضافة المفتاح", { 
        description: "حدث خطأ أثناء تخزين المفتاح"
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
      toast.success("تم حذف المفتاح", { 
        description: `تم حذف المفتاح بمعرف: ${id}`
      });
    } catch (error) {
      console.error('Error removing key:', error);
      toast.error("فشل في حذف المفتاح", { 
        description: "حدث خطأ أثناء حذف المفتاح"
      });
    }
  };

  const generateNewKey = (id: string, expirationHours = 24) => {
    const newKey = generateKey();
    addKey(id, newKey, expirationHours);
    return newKey;
  };

  const toggleLanguage = () => {
    setIsArabic(prev => !prev);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
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
