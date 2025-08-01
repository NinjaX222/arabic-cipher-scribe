
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CipherProvider } from "./contexts/CipherContext";
import Index from "./pages/Index";
import Help from "./pages/Help";
import ImageEncryption from "./pages/ImageEncryption";
import VideoEncryption from "./pages/VideoEncryption";
import PasswordGenerator from "./pages/PasswordGenerator";
import ShareApp from "./pages/ShareApp";
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/help" element={<Help />} />
            <Route path="/image-encryption" element={<ImageEncryption />} />
            <Route path="/video-encryption" element={<VideoEncryption />} />
            <Route path="/password-generator" element={<PasswordGenerator />} />
            <Route path="/share" element={<ShareApp />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CipherProvider>
  </QueryClientProvider>
);

export default App;
