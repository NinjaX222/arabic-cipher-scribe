
import Header from "@/components/Header";
import EncryptionForm from "@/components/EncryptionForm";
import KeyManager from "@/components/KeyManager";
import Footer from "@/components/Footer";
import { CipherProvider } from "@/contexts/CipherContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockIcon, KeyRound, Mic } from "lucide-react";
import AudioEncryptor from "@/components/AudioEncryptor";

const Index = () => {
  return (
    <CipherProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8">
          {/* القسمان منفصلان عبر التبويبات */}
          <Tabs defaultValue="text" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <LockIcon className="h-4 w-4" />
                رسائل نصية
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                رسائل صوتية
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-0 animate-fade-in">
              <EncryptionForm />
              <div className="mt-8">
                <KeyManager />
              </div>
            </TabsContent>
            <TabsContent value="audio" className="mt-0 animate-fade-in">
              <AudioEncryptor />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </CipherProvider>
  );
};

export default Index;

