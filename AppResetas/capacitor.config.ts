import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gt.com.appresetas',
  appName: 'AppResetas',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;