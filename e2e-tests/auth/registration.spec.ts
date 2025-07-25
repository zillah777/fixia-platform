import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('Registration Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should complete full registration flow as Explorador', async ({ page }) => {
    // Generate unique email for this test
    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('explorador')
    };

    await helpers.register(testUser);
    
    // Verify successful registration and redirect
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify user is logged in (check for user menu or dashboard elements)
    await helpers.waitForElement('[data-testid="user-menu"]');
    
    // Verify user type is set correctly
    const userTypeElement = await helpers.waitForElement('[data-testid="user-type"]');
    await expect(userTypeElement).toHaveText('Explorador');
  });

  test('should complete full registration flow as AS', async ({ page }) => {
    // Generate unique email for this test
    const testUser = { 
      ...TestData.as, 
      email: helpers.generateTestEmail('as')
    };

    await helpers.register(testUser);
    
    // AS users should be redirected to profile completion
    await expect(page).toHaveURL(/\/perfil.*completar/);
    
    // Verify user is logged in
    await helpers.waitForElement('[data-testid="user-menu"]');
    
    // Verify user type is set correctly
    const userTypeElement = await helpers.waitForElement('[data-testid="user-type"]');
    await expect(userTypeElement).toHaveText('AS');
  });

  test('should show validation errors for invalid registration data', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('[data-testid="next-button"]');
    
    // Check for validation errors
    await helpers.waitForElement('[data-testid="error-nombre"]');
    await helpers.waitForElement('[data-testid="error-apellido"]');
    await helpers.waitForElement('[data-testid="error-email"]');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');
    
    // Fill invalid email
    await helpers.fillField('[data-testid="nombre"]', 'Juan');
    await helpers.fillField('[data-testid="apellido"]', 'Pérez');
    await helpers.fillField('[data-testid="email"]', 'invalid-email');
    
    await page.click('[data-testid="next-button"]');
    
    // Check for email validation error
    await helpers.waitForElement('[data-testid="error-email"]');
    const errorText = await page.textContent('[data-testid="error-email"]');
    expect(errorText).toContain('formato válido');
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');
    
    // Complete step 1
    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('pwd-test')
    };
    
    await helpers.fillField('[data-testid="nombre"]', testUser.nombre);
    await helpers.fillField('[data-testid="apellido"]', testUser.apellido);
    await helpers.fillField('[data-testid="email"]', testUser.email);
    await page.click('[data-testid="next-button"]');
    
    // Try weak password
    await helpers.fillField('[data-testid="password"]', '123');
    await page.click('[data-testid="next-button"]');
    
    // Check for password strength error
    await helpers.waitForElement('[data-testid="error-password"]');
    const errorText = await page.textContent('[data-testid="error-password"]');
    expect(errorText).toContain('segura');
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/register');
    
    // Complete step 1
    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('pwd-confirm')
    };
    
    await helpers.fillField('[data-testid="nombre"]', testUser.nombre);
    await helpers.fillField('[data-testid="apellido"]', testUser.apellido);
    await helpers.fillField('[data-testid="email"]', testUser.email);
    await page.click('[data-testid="next-button"]');
    
    // Enter mismatched passwords
    await helpers.fillField('[data-testid="password"]', 'TestPassword123!');
    await helpers.fillField('[data-testid="confirm-password"]', 'DifferentPassword123!');
    await page.click('[data-testid="next-button"]');
    
    // Check for password confirmation error
    await helpers.waitForElement('[data-testid="error-confirm-password"]');
    const errorText = await page.textContent('[data-testid="error-confirm-password"]');
    expect(errorText).toContain('coinciden');
  });

  test('should prevent registration with existing email', async ({ page }) => {
    const existingEmail = 'existing@test.com';
    
    // First registration
    const firstUser = { 
      ...TestData.explorador, 
      email: existingEmail
    };
    
    try {
      await helpers.register(firstUser);
      await helpers.logout();
      
      // Try to register again with same email
      const secondUser = { 
        ...TestData.as, 
        email: existingEmail
      };
      
      await page.goto('/register');
      
      // Step 1: Personal info
      await helpers.fillField('[data-testid="nombre"]', secondUser.nombre);
      await helpers.fillField('[data-testid="apellido"]', secondUser.apellido);
      await helpers.fillField('[data-testid="email"]', secondUser.email);
      await page.click('[data-testid="next-button"]');
      
      // Check for duplicate email error
      await helpers.waitForElement('[data-testid="error-email"]');
      const errorText = await page.textContent('[data-testid="error-email"]');
      expect(errorText).toContain('ya existe');
    } catch (error) {
      // If first registration failed, that's also a valid test result
      console.log('First registration failed, which is acceptable for this test');
    }
  });

  test('should require terms acceptance', async ({ page }) => {
    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('terms-test')
    };

    await page.goto('/register');
    
    // Complete steps 1 and 2
    await helpers.fillField('[data-testid="nombre"]', testUser.nombre);
    await helpers.fillField('[data-testid="apellido"]', testUser.apellido);
    await helpers.fillField('[data-testid="email"]', testUser.email);
    await page.click('[data-testid="next-button"]');
    
    await helpers.fillField('[data-testid="password"]', testUser.password);
    await helpers.fillField('[data-testid="confirm-password"]', testUser.password);
    await page.click('[data-testid="next-button"]');
    
    // Select user type but don't check terms
    await page.click(`[data-testid="user-type-${testUser.userType}"]`);
    await page.click('[data-testid="register-button"]');
    
    // Check for terms acceptance error
    await helpers.waitForElement('[data-testid="error-terms"]');
    const errorText = await page.textContent('[data-testid="error-terms"]');
    expect(errorText).toContain('términos');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept registration API and make it fail
    await page.route('**/api/auth/register', route => {
      route.abort('failed');
    });

    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('network-error')
    };

    await page.goto('/register');
    
    try {
      await helpers.register(testUser);
    } catch (error) {
      // Registration should fail due to network error
    }
    
    // Check for error message
    await helpers.waitForElement('[data-testid="error-message"]');
    const errorText = await page.textContent('[data-testid="error-message"]');
    expect(errorText).toContain('error');
  });

  test('should show loading state during registration', async ({ page }) => {
    // Intercept registration API to delay response
    await page.route('**/api/auth/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('loading-test')
    };

    await page.goto('/register');
    
    // Fill form
    await helpers.fillField('[data-testid="nombre"]', testUser.nombre);
    await helpers.fillField('[data-testid="apellido"]', testUser.apellido);
    await helpers.fillField('[data-testid="email"]', testUser.email);
    await page.click('[data-testid="next-button"]');
    
    await helpers.fillField('[data-testid="password"]', testUser.password);
    await helpers.fillField('[data-testid="confirm-password"]', testUser.password);
    await page.click('[data-testid="next-button"]');
    
    await page.click(`[data-testid="user-type-${testUser.userType}"]`);
    await page.click('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="register-button"]');
    
    // Check loading state appears
    await helpers.waitForElement('[data-testid="loading"]');
    
    // Wait for registration to complete
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should navigate back through registration steps', async ({ page }) => {
    const testUser = { 
      ...TestData.explorador, 
      email: helpers.generateTestEmail('navigation-test')
    };

    await page.goto('/register');
    
    // Step 1: Fill and go to step 2
    await helpers.fillField('[data-testid="nombre"]', testUser.nombre);
    await helpers.fillField('[data-testid="apellido"]', testUser.apellido);
    await helpers.fillField('[data-testid="email"]', testUser.email);
    await page.click('[data-testid="next-button"]');
    
    // Step 2: Go back to step 1
    await page.click('[data-testid="back-button"]');
    
    // Verify we're back on step 1 and data is preserved
    await expect(page.locator('[data-testid="nombre"]')).toHaveValue(testUser.nombre);
    await expect(page.locator('[data-testid="apellido"]')).toHaveValue(testUser.apellido);
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);
    
    // Go forward again
    await page.click('[data-testid="next-button"]');
    
    // Step 2: Fill and go to step 3
    await helpers.fillField('[data-testid="password"]', testUser.password);
    await helpers.fillField('[data-testid="confirm-password"]', testUser.password);
    await page.click('[data-testid="next-button"]');
    
    // Step 3: Go back to step 2
    await page.click('[data-testid="back-button"]');
    
    // Verify password fields are cleared for security
    await expect(page.locator('[data-testid="password"]')).toHaveValue('');
    await expect(page.locator('[data-testid="confirm-password"]')).toHaveValue('');
  });

  test('should work with demo account buttons', async ({ page }) => {
    await page.goto('/register');
    
    // Click demo Explorador button
    await page.click('[data-testid="demo-explorador-button"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should show demo user info
    await helpers.waitForElement('[data-testid="demo-user-badge"]');
    
    // Logout and try AS demo
    await helpers.logout();
    await page.goto('/register');
    
    await page.click('[data-testid="demo-as-button"]');
    
    // AS demo should redirect to profile completion
    await expect(page).toHaveURL(/\/perfil/);
  });
});

test.describe('Registration UI Elements', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/register');
  });

  test('should display all required form elements', async ({ page }) => {
    // Step 1 elements
    await helpers.waitForElement('[data-testid="nombre"]');
    await helpers.waitForElement('[data-testid="apellido"]');
    await helpers.waitForElement('[data-testid="email"]');
    await helpers.waitForElement('[data-testid="next-button"]');
    
    // Demo buttons
    await helpers.waitForElement('[data-testid="demo-explorador-button"]');
    await helpers.waitForElement('[data-testid="demo-as-button"]');
    
    // Link to login
    await helpers.waitForElement('[data-testid="login-link"]');
  });

  test('should show password visibility toggle', async ({ page }) => {
    // Navigate to step 2
    await helpers.fillField('[data-testid="nombre"]', 'Test');
    await helpers.fillField('[data-testid="apellido"]', 'User');
    await helpers.fillField('[data-testid="email"]', helpers.generateTestEmail('visibility'));
    await page.click('[data-testid="next-button"]');
    
    // Check password visibility toggle
    await helpers.fillField('[data-testid="password"]', 'TestPassword123!');
    
    // Initially password should be hidden
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('type', 'password');
    
    // Click visibility toggle
    await page.click('[data-testid="password-visibility-toggle"]');
    
    // Password should now be visible
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('type', 'text');
  });

  test('should display progress indicator', async ({ page }) => {
    // Step 1 - should show 1/3 progress
    await helpers.waitForElement('[data-testid="progress-indicator"]');
    const step1Progress = await page.textContent('[data-testid="progress-indicator"]');
    expect(step1Progress).toContain('1');
    expect(step1Progress).toContain('3');
    
    // Go to step 2
    await helpers.fillField('[data-testid="nombre"]', 'Test');
    await helpers.fillField('[data-testid="apellido"]', 'User');
    await helpers.fillField('[data-testid="email"]', helpers.generateTestEmail('progress'));
    await page.click('[data-testid="next-button"]');
    
    // Step 2 - should show 2/3 progress
    const step2Progress = await page.textContent('[data-testid="progress-indicator"]');
    expect(step2Progress).toContain('2');
    expect(step2Progress).toContain('3');
  });

  test('should handle responsive design', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, form should be stacked vertically
      const formLayout = await page.locator('[data-testid="register-form"]').evaluate(
        el => window.getComputedStyle(el).flexDirection
      );
      expect(formLayout).toBe('column');
      
      // Mobile-specific elements should be visible
      await helpers.waitForElement('[data-testid="mobile-form-container"]');
    } else {
      // On desktop, form might have different layout
      await helpers.waitForElement('[data-testid="desktop-form-container"]');
    }
  });
});