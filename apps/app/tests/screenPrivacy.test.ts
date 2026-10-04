import { screenPrivacyManager } from '../src/utils/screenPrivacy';

describe('Screen Privacy & Screenshot Blocking (Item 11)', () => {
  it('enables screen shield flag for health, marks, and anonymous report screens', () => {
    expect(screenPrivacyManager.enableScreenShieldForSensitiveScreen('health')).toBe(true);
    expect(screenPrivacyManager.enableScreenShieldForSensitiveScreen('marks')).toBe(true);
    expect(screenPrivacyManager.enableScreenShieldForSensitiveScreen('anonymous-report')).toBe(true);
  });

  it('does NOT enable screen shield for regular non-sensitive screens', () => {
    expect(screenPrivacyManager.enableScreenShieldForSensitiveScreen('home')).toBe(false);
    expect(screenPrivacyManager.enableScreenShieldForSensitiveScreen('settings')).toBe(false);
  });

  it('hides sensitive values when app state transitions to background or inactive', () => {
    expect(screenPrivacyManager.handleAppStateChange('background')).toBe(true);
    expect(screenPrivacyManager.handleAppStateChange('inactive')).toBe(true);
    expect(screenPrivacyManager.handleAppStateChange('active')).toBe(false);
  });
});
