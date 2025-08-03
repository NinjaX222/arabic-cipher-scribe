import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1d0a2caa6d4e43bcbb660a0320ddf046',
  appName: 'arabic-cipher-scribe',
  webDir: 'dist',
  server: {
    url: "https://1d0a2caa-6d4e-43bc-bb66-0a0320ddf046.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#6366f1",
      showSpinner: false
    }
  }
};

export default config;