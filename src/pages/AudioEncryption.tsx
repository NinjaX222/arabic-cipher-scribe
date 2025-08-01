import AudioEncryptor from "@/components/AudioEncryptor";
import { useCipher } from "@/contexts/CipherContext";

const AudioEncryption = () => {
  const { isArabic } = useCipher();
  
  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8">
        <div className={`mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? "تشفير الصوت" : "Audio Encryption"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic 
              ? "قم بتشفير وفك تشفير الرسائل الصوتية بأمان" 
              : "Encrypt and decrypt audio messages securely"
            }
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <AudioEncryptor />
        </div>
      </div>
    </div>
  );
};

export default AudioEncryption;