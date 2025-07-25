import { test, expect } from '@playwright/test';

test.describe('Production Real Tests - Fixia.com.ar', () => {
  
  test('should complete Explorador demo flow', async ({ page }) => {
    console.log('🔍 Testing Explorador Demo Flow');
    
    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Verify login page structure
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const explorerDemoButton = page.locator('button:has-text("🔍 Explorador Demo")');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(explorerDemoButton).toBeVisible();
    
    // Click Explorador Demo button
    console.log('✅ Clicking Explorador Demo button');
    await explorerDemoButton.click();
    
    // Wait for navigation or response
    await page.waitForTimeout(3000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'explorador-demo-result.png', fullPage: true });
    
    // Check if we're redirected or if dashboard appears
    const currentUrl = page.url();
    console.log(`Current URL after demo: ${currentUrl}`);
    
    // Look for dashboard elements or user info
    const userElements = await page.locator('[class*="user"], [class*="dashboard"], [class*="profile"]').all();
    console.log(`Found ${userElements.length} potential user/dashboard elements`);
    
    console.log('✅ Explorador demo flow completed');
  });

  test('should complete AS demo flow', async ({ page }) => {
    console.log('🛠️ Testing AS Demo Flow');
    
    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Click AS Demo button
    const asDemoButton = page.locator('button:has-text("🛠️ AS Demo")');
    await expect(asDemoButton).toBeVisible();
    
    console.log('✅ Clicking AS Demo button');
    await asDemoButton.click();
    
    // Wait for navigation or response
    await page.waitForTimeout(3000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'as-demo-result.png', fullPage: true });
    
    // Check current state
    const currentUrl = page.url();
    console.log(`Current URL after AS demo: ${currentUrl}`);
    
    console.log('✅ AS demo flow completed');
  });

  test('should test manual login form', async ({ page }) => {
    console.log('📝 Testing Manual Login Form');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Fill the form with test credentials
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('button:has-text("Iniciar Sesión")');
    
    await emailInput.fill('test@fixia.com');
    await passwordInput.fill('testpassword123');
    
    // Take screenshot of filled form
    await page.screenshot({ path: 'login-form-manual.png', fullPage: true });
    
    // Try to submit (this might fail but we can see the response)
    console.log('✅ Submitting login form');
    await loginButton.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'login-submit-result.png', fullPage: true });
    
    // Check for error messages or redirects
    const errorElements = await page.locator('[class*="error"], [class*="alert"], .text-red-500').all();
    console.log(`Found ${errorElements.length} potential error elements`);
    
    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      if (errorText && errorText.trim()) {
        console.log(`Error ${i + 1}: "${errorText}"`);
      }
    }
    
    console.log('✅ Manual login test completed');
  });

  test('should test registration form', async ({ page }) => {
    console.log('📋 Testing Registration Form');
    
    await page.goto('/auth/registro');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of registration page
    await page.screenshot({ path: 'registration-page-full.png', fullPage: true });
    
    // Find all input fields
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields in registration`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      
      console.log(`Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
    }
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons in registration`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      console.log(`Button ${i + 1}: "${text?.trim()}"`);
    }
    
    console.log('✅ Registration form analysis completed');
  });

  test('should test customer-specific registration', async ({ page }) => {
    console.log('👤 Testing Customer Registration');
    
    await page.goto('/auth/registro?type=customer');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'customer-registration-full.png', fullPage: true });
    
    // Compare with regular registration
    const customerTitle = await page.title();
    console.log(`Customer registration title: "${customerTitle}"`);
    
    // Check for customer-specific elements
    const customerElements = await page.locator('[class*="customer"], [class*="explorador"], [class*="client"]').all();
    console.log(`Found ${customerElements.length} customer-specific elements`);
    
    console.log('✅ Customer registration test completed');
  });

  test('should explore homepage interactive elements', async ({ page }) => {
    console.log('🏠 Testing Homepage Interactions');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test navigation to auth pages
    const loginLinks = await page.locator('a[href="/auth/login"]').all();
    const registerLinks = await page.locator('a[href="/auth/registro"]').all();
    
    console.log(`Found ${loginLinks.length} login links`);
    console.log(`Found ${registerLinks.length} registration links`);
    
    // Test section navigation
    const sections = ['#como-funciona', '#servicios', '#profesionales', '#contacto'];
    
    for (const section of sections) {
      console.log(`Testing navigation to ${section}`);
      
      // Click on section link
      const sectionLink = page.locator(`a[href="${section}"]`).first();
      if (await sectionLink.isVisible()) {
        await sectionLink.click();
        await page.waitForTimeout(1000);
        
        // Check if we scrolled to the section
        const sectionElement = page.locator(section);
        const isInView = await sectionElement.isInViewport();
        console.log(`Section ${section} in viewport: ${isInView ? '✅' : '❌'}`);
      }
    }
    
    // Test any contact forms
    const forms = await page.locator('form').all();
    console.log(`Found ${forms.length} forms on homepage`);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const inputs = await form.locator('input').all();
      console.log(`Form ${i + 1} has ${inputs.length} inputs`);
    }
    
    console.log('✅ Homepage interaction test completed');
  });

  test('should test responsive design', async ({ page }) => {
    console.log('📱 Testing Responsive Design');
    
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'responsive-desktop.png', fullPage: true });
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'responsive-tablet.png', fullPage: true });
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'responsive-mobile.png', fullPage: true });
    
    // Test login on mobile
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'login-mobile.png', fullPage: true });
    
    console.log('✅ Responsive design test completed');
  });

  test('should test error handling', async ({ page }) => {
    console.log('❌ Testing Error Handling');
    
    // Test 404 page
    await page.goto('/nonexistent-page');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    const is404 = title.includes('404') || title.includes('Not Found');
    console.log(`404 page test: ${is404 ? '✅ Working' : '❌ Not working'}`);
    
    if (is404) {
      await page.screenshot({ path: 'error-404-page.png', fullPage: true });
    }
    
    // Test malformed URLs
    const malformedUrls = [
      '/auth/',
      '/auth/invalid',
      '/registro/invalid'
    ];
    
    for (const url of malformedUrls) {
      console.log(`Testing malformed URL: ${url}`);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const currentTitle = await page.title();
      console.log(`URL "${url}" -> Title: "${currentTitle}"`);
    }
    
    console.log('✅ Error handling test completed');
  });
});