import { test, expect } from '@playwright/test';

test.describe('Login and Demo Flow - Production', () => {
  
  test('should test Explorador demo button functionality', async ({ page }) => {
    console.log('🔍 Testing Explorador Demo Button');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'login-initial.png', fullPage: true });
    
    // Find and verify demo button
    const explorerDemoButton = page.locator('button:has-text("🔍 Explorador Demo")');
    await expect(explorerDemoButton).toBeVisible();
    
    console.log('✅ Explorador Demo button found');
    
    // Click the button and monitor network requests
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('auth') || 
        response.url().includes('login') || 
        response.url().includes('demo'), { timeout: 10000 }
      ).catch(() => null), // Don't fail if no matching response
      explorerDemoButton.click()
    ]);
    
    if (response) {
      console.log(`Demo button triggered request to: ${response.url()}`);
      console.log(`Response status: ${response.status()}`);
    } else {
      console.log('No network request detected from demo button');
    }
    
    // Wait and check for any changes
    await page.waitForTimeout(3000);
    
    // Take screenshot after click
    await page.screenshot({ path: 'login-after-explorador-demo.png', fullPage: true });
    
    // Check current URL and page state
    const currentUrl = page.url();
    const currentTitle = await page.title();
    console.log(`After demo click: URL=${currentUrl}, Title="${currentTitle}"`);
    
    // Look for any success messages or changes
    const successElements = await page.locator('[class*="success"], [class*="welcome"], [class*="dashboard"]').all();
    console.log(`Found ${successElements.length} potential success elements`);
    
    // Look for user info or profile elements
    const userElements = await page.locator('[class*="user"], [class*="profile"], [data-testid*="user"]').all();
    console.log(`Found ${userElements.length} potential user elements`);
    
    console.log('✅ Explorador demo test completed');
  });

  test('should test AS demo button functionality', async ({ page }) => {
    console.log('🛠️ Testing AS Demo Button');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Find and verify AS demo button
    const asDemoButton = page.locator('button:has-text("🛠️ AS Demo")');
    await expect(asDemoButton).toBeVisible();
    
    console.log('✅ AS Demo button found');
    
    // Click the button and monitor network requests
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('auth') || 
        response.url().includes('login') || 
        response.url().includes('demo'), { timeout: 10000 }
      ).catch(() => null),
      asDemoButton.click()
    ]);
    
    if (response) {
      console.log(`AS Demo button triggered request to: ${response.url()}`);
      console.log(`Response status: ${response.status()}`);
    } else {
      console.log('No network request detected from AS demo button');
    }
    
    // Wait and check for changes
    await page.waitForTimeout(3000);
    
    // Take screenshot after click
    await page.screenshot({ path: 'login-after-as-demo.png', fullPage: true });
    
    // Check current state
    const currentUrl = page.url();
    const currentTitle = await page.title();
    console.log(`After AS demo click: URL=${currentUrl}, Title="${currentTitle}"`);
    
    console.log('✅ AS demo test completed');
  });

  test('should test manual login with real credentials', async ({ page }) => {
    console.log('📝 Testing Manual Login');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Get form elements
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('button:has-text("Iniciar Sesión")');
    
    // Verify elements
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Fill with test credentials
    await emailInput.fill('test@fixia.com');
    await passwordInput.fill('testpassword123');
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'login-manual-filled.png', fullPage: true });
    
    // Submit and monitor the response
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('auth') || 
        response.url().includes('login'), { timeout: 10000 }
      ).catch(() => null),
      loginButton.click()
    ]);
    
    if (response) {
      console.log(`Login form triggered request to: ${response.url()}`);
      console.log(`Response status: ${response.status()}`);
      
      // Try to get response body
      try {
        const responseText = await response.text();
        console.log(`Response preview: ${responseText.substring(0, 200)}...`);
      } catch (e) {
        console.log('Could not read response body');
      }
    }
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'login-manual-result.png', fullPage: true });
    
    // Check for error messages
    const errorElements = await page.locator('[class*="error"], [class*="invalid"], .text-red-500').all();
    console.log(`Found ${errorElements.length} error elements`);
    
    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      if (errorText && errorText.trim()) {
        console.log(`Error ${i + 1}: "${errorText}"`);
      }
    }
    
    // Check current state
    const finalUrl = page.url();
    const finalTitle = await page.title();
    console.log(`After login attempt: URL=${finalUrl}, Title="${finalTitle}"`);
    
    console.log('✅ Manual login test completed');
  });

  test('should test form validation on login', async ({ page }) => {
    console.log('🔍 Testing Login Form Validation');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('button:has-text("Iniciar Sesión")');
    
    // Test 1: Empty form submission
    console.log('Testing empty form submission...');
    await loginButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login-validation-empty.png', fullPage: true });
    
    // Test 2: Invalid email format
    console.log('Testing invalid email format...');
    await emailInput.fill('invalid-email');
    await passwordInput.fill('somepassword');
    await loginButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login-validation-invalid-email.png', fullPage: true });
    
    // Test 3: Valid email but short password
    console.log('Testing short password...');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('123');
    await loginButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login-validation-short-password.png', fullPage: true });
    
    // Look for validation messages after each test
    const validationElements = await page.locator('[class*="error"], [class*="invalid"], [class*="required"]').all();
    console.log(`Found ${validationElements.length} validation elements`);
    
    for (let i = 0; i < validationElements.length; i++) {
      const validationText = await validationElements[i].textContent();
      if (validationText && validationText.trim()) {
        console.log(`Validation ${i + 1}: "${validationText}"`);
      }
    }
    
    console.log('✅ Login validation test completed');
  });

  test('should test navigation between login and registration', async ({ page }) => {
    console.log('🔄 Testing Navigation Between Auth Pages');
    
    // Start at login
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'nav-login-page.png', fullPage: true });
    
    // Look for registration link
    const registerLinks = await page.locator('a[href*="registro"], a:has-text("Registr")').all();
    console.log(`Found ${registerLinks.length} registration links on login page`);
    
    if (registerLinks.length > 0) {
      const registerLink = registerLinks[0];
      const linkText = await registerLink.textContent();
      const linkHref = await registerLink.getAttribute('href');
      
      console.log(`Clicking registration link: "${linkText}" (${linkHref})`);
      await registerLink.click();
      
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'nav-register-page.png', fullPage: true });
      
      // Check we're on registration page
      const regTitle = await page.title();
      console.log(`Registration page title: "${regTitle}"`);
      
      // Look for login link on registration page
      const loginLinks = await page.locator('a[href*="login"], a:has-text("Iniciar")').all();
      console.log(`Found ${loginLinks.length} login links on registration page`);
      
      if (loginLinks.length > 0) {
        const loginLink = loginLinks[0];
        const loginLinkText = await loginLink.textContent();
        console.log(`Clicking login link: "${loginLinkText}"`);
        
        await loginLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'nav-back-to-login.png', fullPage: true });
        
        // Verify we're back on login
        const backTitle = await page.title();
        console.log(`Back to login page title: "${backTitle}"`);
      }
    }
    
    console.log('✅ Navigation test completed');
  });

  test('should test password visibility toggle', async ({ page }) => {
    console.log('👁️ Testing Password Visibility Toggle');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('testpassword123');
    
    // Look for password visibility toggle button
    const toggleButtons = await page.locator('button[type="button"]').all();
    const eyeButtons = await page.locator('[class*="eye"], [class*="show"], [class*="visible"]').all();
    
    console.log(`Found ${toggleButtons.length} toggle buttons`);
    console.log(`Found ${eyeButtons.length} eye/visibility elements`);
    
    // Take screenshot with password hidden
    await page.screenshot({ path: 'password-hidden.png', fullPage: true });
    
    // Check initial password field type
    const initialType = await passwordInput.getAttribute('type');
    console.log(`Initial password field type: "${initialType}"`);
    
    // Try to find and click visibility toggle
    if (eyeButtons.length > 0) {
      console.log('Clicking visibility toggle...');
      await eyeButtons[0].click();
      await page.waitForTimeout(500);
      
      // Check if type changed
      const newType = await passwordInput.getAttribute('type');
      console.log(`Password field type after toggle: "${newType}"`);
      
      await page.screenshot({ path: 'password-visible.png', fullPage: true });
      
      // Click again to hide
      await eyeButtons[0].click();
      await page.waitForTimeout(500);
      
      const finalType = await passwordInput.getAttribute('type');
      console.log(`Final password field type: "${finalType}"`);
      
      await page.screenshot({ path: 'password-hidden-again.png', fullPage: true });
    } else {
      console.log('No password visibility toggle found');
    }
    
    console.log('✅ Password visibility test completed');
  });
});