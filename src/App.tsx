
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CipherProvider } from "./contexts/CipherContext";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import TextEncryption from "./pages/TextEncryption";
import AudioEncryption from "./pages/AudioEncryption";
import Help from "./pages/Help";
import ImageEncryption from "./pages/ImageEncryption";
import VideoEncryption from "./pages/VideoEncryption";
import PasswordGenerator from "./pages/PasswordGenerator";
import ShareApp from "./pages/ShareApp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Add support for crypto-js
declare global {
  interface Window {
    crypto: {
      getRandomValues: (array: Uint8Array) => Uint8Array;
    };
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CipherProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/text-encryption" element={<TextEncryption />} />
                  <Route path="/audio-encryption" element={<AudioEncryption />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/image-encryption" element={<ImageEncryption />} />
                  <Route path="/video-encryption" element={<VideoEncryption />} />
                  <Route path="/password-generator" element={<PasswordGenerator />} />
                  <Route path="/share" element={<ShareApp />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </CipherProvider>
  </QueryClientProvider>
);

export default App;
