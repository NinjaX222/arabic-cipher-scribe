
import Header from "@/components/Header";
import EncryptionForm from "@/components/EncryptionForm";
import KeyManager from "@/components/KeyManager";
import Footer from "@/components/Footer";
import { CipherProvider } from "@/contexts/CipherContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockIcon, KeyRound } from "lucide-react";
import AudioEncryptor from "@/components/AudioEncryptor";

const Index = () => {
  return (
    <CipherProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <AudioEncryptor />
          <Tabs defaultValue="encrypt" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="encrypt" className="flex items-center gap-2">
                <LockIcon className="h-4 w-4" />
                Encrypt/Decrypt
              </TabsTrigger>
              <TabsTrigger value="keys" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Key Management
              </TabsTrigger>
            </TabsList>
            <TabsContent value="encrypt" className="mt-0 space-y-4 animate-fade-in">
              <EncryptionForm />
            </TabsContent>
            <TabsContent value="keys" className="mt-0 animate-fade-in">
              <KeyManager />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </CipherProvider>
  );
};

export default Index;
