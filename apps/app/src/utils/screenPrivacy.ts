import { AppState, AppStateStatus, Platform } from 'react-native';

export class ScreenPrivacyManager {
  private isScreenShieldActive = false;

  public enableScreenShieldForSensitiveScreen(screenName: string): boolean {
    const sensitiveScreens = ['health', 'marks', 'anonymous-report', 'SupportScreen'];
    if (sensitiveScreens.includes(screenName)) {
      this.isScreenShieldActive = true;
      return true;
    }
    this.isScreenShieldActive = false;
    return false;
  }

  public handleAppStateChange(nextAppState: AppStateStatus): boolean {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Obfuscates app content when sending app to task switcher
      return true;
    }
    return false;
  }

  public isShieldActive(): boolean {
    return this.isScreenShieldActive;
  }
}

export const screenPrivacyManager = new ScreenPrivacyManager();
