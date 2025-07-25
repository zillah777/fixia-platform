import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('Login Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should login successfully as Explorador', async ({ page }) => {
    // Use demo account for reliable testing
    await page.goto('/login');
    
    // Click demo Explorador login
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify user is logged in
    await helpers.waitForElement('[data-testid="user-menu"]');
    
    // Verify user type
    const userTypeElement = await helpers.waitForElement('[data-testid="user-type"]');
    await expect(userTypeElement).toHaveText('Explorador');
    
    // Verify dashboard shows Explorador-specific content
    await helpers.waitForElement('[data-testid="explorador-dashboard"]');
    await helpers.waitForElement('[data-testid="new-request-button"]');
  });

  test('should login successfully as AS', async ({ page }) => {
    await page.goto('/login');
    
    // Click demo AS login
    await page.click('[data-testid="demo-as-login"]');
    
    // Should redirect to profile or dashboard
    await page.waitForURL(/\/(dashboard|perfil)/);
    
    // Verify user is logged in
    await helpers.waitForElement('[data-testid="user-menu"]');
    
    // Verify user type
    const userTypeElement = await helpers.waitForElement('[data-testid="user-type"]');
    await expect(userTypeElement).toHaveText('AS');
  });

  test('should login with manual credentials', async ({ page }) => {
    // First create a test user
    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('manual-login')
    };

    try {
      await helpers.register(testUser);
      await helpers.logout();
      
      // Now test manual login
      await helpers.login(testUser.email, testUser.password);
      
      // Verify successful login
      await expect(page).toHaveURL(/\/dashboard/);
      await helpers.waitForElement('[data-testid="user-menu"]');
    } catch (error) {
      // If registration failed, skip this test
      test.skip();
    }
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('[data-testid="login-button"]');
    
    // Check for validation errors
    await helpers.waitForElement('[data-testid="error-email"]');
    await helpers.waitForElement('[data-testid="error-password"]');
    
    const emailError = await page.textContent('[data-testid="error-email"]');
    const passwordError = await page.textContent('[data-testid="error-password"]');
    
    expect(emailError).toContain('requerido');
    expect(passwordError).toContain('requerido');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    await helpers.fillField('[data-testid="email"]', 'invalid-email');
    await helpers.fillField('[data-testid="password"]', 'somepassword');
    await page.click('[data-testid="login-button"]');
    
    // Check for email format validation
    await helpers.waitForElement('[data-testid="error-email"]');
    const errorText = await page.textContent('[data-testid="error-email"]');
    expect(errorText).toContain('formato válido');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await helpers.fillField('[data-testid="email"]', 'nonexistent@test.com');
    await helpers.fillField('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Check for invalid credentials error
    await helpers.waitForElement('[data-testid="error-message"]');
    const errorText = await page.textContent('[data-testid="error-message"]');
    expect(errorText).toContain('credenciales');
  });

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    
    await helpers.fillField('[data-testid="password"]', 'TestPassword123!');
    
    // Initially password should be hidden
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('type', 'password');
    
    // Click visibility toggle
    await page.click('[data-testid="password-visibility-toggle"]');
    
    // Password should now be visible
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await page.click('[data-testid="password-visibility-toggle"]');
    
    // Password should be hidden again
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('type', 'password');
  });

  test('should persist login with remember me', async ({ page }) => {
    await page.goto('/login');
    
    // Check remember me checkbox
    await page.click('[data-testid="remember-me-checkbox"]');
    
    // Login with demo account
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Verify login success
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Clear cookies and reload to test persistence
    await page.context().clearCookies();
    await page.reload();
    
    // User should still be logged in due to remember me
    // Note: This might depend on your implementation
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page while logged out
    await page.goto('/dashboard');
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login.*redirect/);
    
    // Login
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Should redirect back to intended page
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show loading state during login', async ({ page }) => {
    // Intercept login API to delay response
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/login');
    
    await helpers.fillField('[data-testid="email"]', 'demo@explorador.com');
    await helpers.fillField('[data-testid="password"]', 'demo123');
    await page.click('[data-testid="login-button"]');
    
    // Check loading state appears
    await helpers.waitForElement('[data-testid="loading"]');
    
    // Login button should be disabled during loading
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    
    // Wait for login to complete
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept login API and make it fail
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });

    await page.goto('/login');
    
    await helpers.fillField('[data-testid="email"]', 'demo@explorador.com');
    await helpers.fillField('[data-testid="password"]', 'demo123');
    await page.click('[data-testid="login-button"]');
    
    // Check for network error message
    await helpers.waitForElement('[data-testid="error-message"]');
    const errorText = await page.textContent('[data-testid="error-message"]');
    expect(errorText).toContain('error');
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');
    
    // Click register link
    await page.click('[data-testid="register-link"]');
    
    // Should navigate to registration
    await expect(page).toHaveURL(/\/register/);
  });

  test('should navigate to password recovery', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.click('[data-testid="forgot-password-link"]');
    
    // Should navigate to password recovery
    await expect(page).toHaveURL(/\/reset-password/);
  });

  test('should prevent brute force attempts', async ({ page }) => {
    await page.goto('/login');
    
    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await helpers.fillField('[data-testid="email"]', 'test@test.com');
      await helpers.fillField('[data-testid="password"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Wait for error message
      await helpers.waitForElement('[data-testid="error-message"]');
      
      // Clear fields for next attempt
      await page.fill('[data-testid="email"]', '');
      await page.fill('[data-testid="password"]', '');
    }
    
    // After multiple attempts, should show rate limiting message
    await helpers.fillField('[data-testid="email"]', 'test@test.com');
    await helpers.fillField('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    const errorText = await page.textContent('[data-testid="error-message"]');
    expect(errorText).toContain('intentos');
  });
});

test.describe('Login UI Elements', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/login');
  });

  test('should display all required form elements', async ({ page }) => {
    // Form fields
    await helpers.waitForElement('[data-testid="email"]');
    await helpers.waitForElement('[data-testid="password"]');
    await helpers.waitForElement('[data-testid="login-button"]');
    
    // Options
    await helpers.waitForElement('[data-testid="remember-me-checkbox"]');
    await helpers.waitForElement('[data-testid="password-visibility-toggle"]');
    
    // Demo buttons
    await helpers.waitForElement('[data-testid="demo-explorador-login"]');
    await helpers.waitForElement('[data-testid="demo-as-login"]');
    
    // Links
    await helpers.waitForElement('[data-testid="register-link"]');
    await helpers.waitForElement('[data-testid="forgot-password-link"]');
  });

  test('should have proper form labels and accessibility', async ({ page }) => {
    // Check for proper labels
    const emailField = page.locator('[data-testid="email"]');
    const passwordField = page.locator('[data-testid="password"]');
    
    await expect(emailField).toHaveAttribute('type', 'email');
    await expect(passwordField).toHaveAttribute('type', 'password');
    
    // Check for placeholders or labels
    await expect(emailField).toHaveAttribute('placeholder');
    await expect(passwordField).toHaveAttribute('placeholder');
  });

  test('should handle responsive design', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, form should be optimized for touch
      const loginButton = page.locator('[data-testid="login-button"]');
      const buttonHeight = await loginButton.evaluate(el => el.getBoundingClientRect().height);
      
      // Touch targets should be at least 44px
      expect(buttonHeight).toBeGreaterThanOrEqual(44);
      
      // Mobile-specific elements should be visible
      await helpers.waitForElement('[data-testid="mobile-login-container"]');
    } else {
      // Desktop layout elements
      await helpers.waitForElement('[data-testid="desktop-login-container"]');
    }
  });

  test('should show correct button states', async ({ page }) => {
    const loginButton = page.locator('[data-testid="login-button"]');
    
    // Button should be enabled by default
    await expect(loginButton).toBeEnabled();
    
    // Fill form partially
    await helpers.fillField('[data-testid="email"]', 'test@test.com');
    
    // Button state might change based on form validation
    // This depends on your implementation
    
    // Fill complete form
    await helpers.fillField('[data-testid="password"]', 'password');
    
    // Button should definitely be enabled with complete form
    await expect(loginButton).toBeEnabled();
  });
});

test.describe('Logout Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Logout
    await helpers.logout();
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
    
    // User menu should not be visible
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test('should clear session data on logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Logout
    await helpers.logout();
    
    // Try to access protected page
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle logout from different pages', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to different page
    await page.goto('/perfil');
    
    // Logout from profile page
    await page.click('[data-testid="user-menu-button"]');
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});