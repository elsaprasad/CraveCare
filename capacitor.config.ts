import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cravecare.companion',
  appName: 'CraveCare',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
