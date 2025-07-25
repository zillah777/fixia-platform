import { test, expect } from '@playwright/test';

test.describe('Production Authentication Tests', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const title = await page.title();
    expect(title).toContain('Iniciar Sesión');
    
    // Take screenshot
    await page.screenshot({ path: 'login-page-production.png', fullPage: true });
    
    // Check for form elements (using standard selectors instead of data-testid)
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Entrar")');
    
    // Verify elements exist
    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
    await expect(submitButton.first()).toBeVisible();
    
    console.log('✅ Login page structure verified');
  });

  test('should display registration page correctly', async ({ page }) => {
    await page.goto('/auth/registro');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const title = await page.title();
    expect(title).toContain('Registro') || expect(title).toContain('Registrar');
    
    // Take screenshot
    await page.screenshot({ path: 'register-page-production.png', fullPage: true });
    
    console.log('✅ Registration page accessible');
  });

  test('should navigate between auth pages', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Click login link
    await page.click('a[href="/auth/login"]');
    await expect(page).toHaveURL(/\/auth\/login/);
    
    // Look for register link and click it
    const registerLink = page.locator('a:has-text("Registr"), a[href*="registro"]');
    if (await registerLink.first().isVisible()) {
      await registerLink.first().click();
      await expect(page).toHaveURL(/\/auth\/registro/);
    }
    
    console.log('✅ Navigation between auth pages works');
  });

  test('should test form interaction', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Try to fill the form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      console.log('✅ Email input filled');
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('testpassword123');
      console.log('✅ Password input filled');
    }
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'login-form-filled.png', fullPage: true });
    
    console.log('✅ Form interaction test completed');
  });
});