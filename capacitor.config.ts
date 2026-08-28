import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.sociobot.androidbackupreceipt',
  appName: 'Android Backup Receipt',
  webDir: 'dist',
  backgroundColor: '#F4F0E6',
  android: {
    backgroundColor: '#F4F0E6',
    allowMixedContent: false
  }
};

export default config;
