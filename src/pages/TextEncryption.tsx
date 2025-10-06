import { useEffect } from "react";
import EncryptionForm from "@/components/EncryptionForm";
import KeyManager from "@/components/KeyManager";
import { useCipher } from "@/contexts/CipherContext";
import Header from "@/components/Header";
import { logActivity } from "@/utils/activityLogger";

const TextEncryption = () => {
  const { isArabic } = useCipher();
  
  useEffect(() => {
    logActivity({
      actionType: 'encrypt',
      resourceType: 'text',
      resourceName: 'Text Encryption Page'
    });
  }, []);
  
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? "تشفير النصوص" : "Text Encryption"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic 
              ? "قم بتشفير وفك تشفير الرسائل النصية بأمان" 
              : "Encrypt and decrypt text messages securely"
            }
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <EncryptionForm />
          <div className="mt-8">
            <KeyManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEncryption;