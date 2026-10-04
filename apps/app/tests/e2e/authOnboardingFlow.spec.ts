import { test, expect } from '@playwright/test';

test.describe('E2E Auth & Onboarding Flow', () => {
  test('opens web build and sees login screen', async ({ page }) => {
    await page.goto('http://localhost:8081/(auth)/login');
    // Verify login title / input controls render
    const title = page.locator('text=Login');
    await expect(title).toBeVisible();
  });

  test('full flow: register, OTP, onboarding, role request, see pending status', async ({ page }) => {
    // 1. Register page
    await page.goto('http://localhost:8081/(auth)/register');
    await page.fill('[data-testid="input-identity"]', 'newuser@campus.edu');
    await page.fill('[data-testid="input-password"]', 'Password123!');
    await page.click('[data-testid="btn-register-submit"]');

    // 2. OTP verification step
    await page.fill('[data-testid="input-otp"]', '123456');
    await page.click('[data-testid="btn-verify-otp"]');

    // 3. Onboarding screen & Role Request form
    await page.click('[data-testid="tab-role-request"]');
    await page.fill('[data-testid="input-claimed-code"]', 'STU999');
    await page.fill('[data-testid="input-dept-hostel"]', 'Computer Science');
    await page.click('[data-testid="btn-submit-role-request"]');

    // 4. Request status screen (Pending)
    const timeline = page.locator('[data-testid="status-timeline"]');
    await expect(timeline).toBeVisible();
    await expect(page.locator('text=Submitted')).toBeVisible();
  });
});
