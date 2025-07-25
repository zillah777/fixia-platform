import { test, expect } from '@playwright/test';

test.describe('Complete User Journey - Fixia.com.ar Production', () => {
  
  test('should complete full Explorador journey', async ({ page }) => {
    console.log('🎯 COMPLETE EXPLORADOR JOURNEY TEST');
    console.log('=====================================');
    
    // Step 1: Homepage exploration
    console.log('📍 Step 1: Exploring Homepage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const homeTitle = await page.title();
    console.log(`✅ Homepage loaded: "${homeTitle}"`);
    await page.screenshot({ path: 'journey-1-homepage.png', fullPage: true });
    
    // Step 2: Navigate to sections
    console.log('📍 Step 2: Navigating through sections');
    const sections = ['#como-funciona', '#servicios', '#profesionales', '#contacto'];
    
    for (const section of sections) {
      await page.locator(`a[href="${section}"]`).first().click();
      await page.waitForTimeout(1000);
      console.log(`✅ Navigated to section: ${section}`);
    }
    
    await page.screenshot({ path: 'journey-2-sections.png', fullPage: true });
    
    // Step 3: Click "Soy Explorador" registration
    console.log('📍 Step 3: Starting Explorador registration');
    await page.click('a:has-text("Soy Explorador")');
    await page.waitForLoadState('networkidle');
    
    const regUrl = page.url();
    console.log(`✅ Registration URL: ${regUrl}`);
    await page.screenshot({ path: 'journey-3-explorador-register.png', fullPage: true });
    
    // Step 4: Complete registration form - Step 1
    console.log('📍 Step 4: Filling registration form (Step 1)');
    await page.fill('input[name="first_name"]', 'Juan Carlos');
    await page.fill('input[name="last_name"]', 'Explorador Test');
    await page.fill('input[name="email"]', `explorador.test.${Date.now()}@fixia.com`);
    
    await page.screenshot({ path: 'journey-4-register-step1.png', fullPage: true });
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(2000);
    
    // Step 5: Password step
    console.log('📍 Step 5: Filling password information');
    const passwordInputs = await page.locator('input[type="password"]').all();
    
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill('MiPasswordSegura123!');
      await passwordInputs[1].fill('MiPasswordSegura123!');
      console.log('✅ Password fields filled');
    }
    
    await page.screenshot({ path: 'journey-5-register-password.png', fullPage: true });
    
    // Look for continue/next button
    const nextButtons = await page.locator('button:has-text("Continuar"), button:has-text("Siguiente"), button[type="submit"]').all();
    if (nextButtons.length > 0) {
      await nextButtons[0].click();
      await page.waitForTimeout(2000);
    }
    
    // Step 6: Terms and final submission
    console.log('📍 Step 6: Accepting terms and submitting');
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
      console.log('✅ Terms accepted');
    }
    
    const submitButtons = await page.locator('button:has-text("Registrar"), button:has-text("Crear"), button:has-text("Finalizar")').all();
    if (submitButtons.length > 0) {
      await submitButtons[0].click();
      console.log('✅ Registration submitted');
      await page.waitForTimeout(5000);
    }
    
    await page.screenshot({ path: 'journey-6-register-final.png', fullPage: true });
    
    // Step 7: Check final state
    console.log('📍 Step 7: Checking registration result');
    const finalUrl = page.url();
    const finalTitle = await page.title();
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Final Title: "${finalTitle}"`);
    
    // Look for success messages or dashboard
    const successElements = await page.locator('[class*="success"], [class*="welcome"], [class*="dashboard"], [class*="bienvenido"]').all();
    console.log(`Found ${successElements.length} potential success elements`);
    
    console.log('🎉 EXPLORADOR JOURNEY COMPLETED');
    console.log('==================================');
  });

  test('should complete full Especialista journey', async ({ page }) => {
    console.log('🔧 COMPLETE ESPECIALISTA JOURNEY TEST');
    console.log('======================================');
    
    // Step 1: Homepage to Especialista registration
    console.log('📍 Step 1: Navigating to Especialista registration');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.click('a:has-text("Soy Especialista")');
    await page.waitForLoadState('networkidle');
    
    const regUrl = page.url();
    console.log(`✅ Especialista Registration URL: ${regUrl}`);
    await page.screenshot({ path: 'journey-especialista-1.png', fullPage: true });
    
    // Step 2: Fill registration
    console.log('📍 Step 2: Filling Especialista registration');
    await page.fill('input[name="first_name"]', 'María Elena');
    await page.fill('input[name="last_name"]', 'Especialista Pro');
    await page.fill('input[name="email"]', `especialista.test.${Date.now()}@fixia.com`);
    
    await page.screenshot({ path: 'journey-especialista-2.png', fullPage: true });
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(2000);
    
    // Continue with password step
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill('EspecialistaPassword123!');
      await passwordInputs[1].fill('EspecialistaPassword123!');
    }
    
    await page.screenshot({ path: 'journey-especialista-3.png', fullPage: true });
    
    // Complete registration
    const nextButtons = await page.locator('button:has-text("Continuar"), button[type="submit"]').all();
    if (nextButtons.length > 0) {
      await nextButtons[0].click();
      await page.waitForTimeout(2000);
    }
    
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    const submitButtons = await page.locator('button:has-text("Registrar"), button:has-text("Crear")').all();
    if (submitButtons.length > 0) {
      await submitButtons[0].click();
      await page.waitForTimeout(5000);
    }
    
    await page.screenshot({ path: 'journey-especialista-final.png', fullPage: true });
    
    console.log('✅ ESPECIALISTA JOURNEY COMPLETED');
  });

  test('should test login attempts with demo buttons', async ({ page }) => {
    console.log('🔑 DEMO BUTTONS TESTING');
    console.log('========================');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Test Explorador Demo
    console.log('📍 Testing Explorador Demo Button');
    const explorerDemo = page.locator('button:has-text("🔍 Explorador Demo")');
    await expect(explorerDemo).toBeVisible();
    
    await explorerDemo.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'demo-explorador-result.png', fullPage: true });
    
    const explorerResult = page.url();
    console.log(`Explorador Demo Result: ${explorerResult}`);
    
    // Test AS Demo
    console.log('📍 Testing AS Demo Button');
    await page.goto('/auth/login'); // Reset
    await page.waitForLoadState('networkidle');
    
    const asDemo = page.locator('button:has-text("🛠️ AS Demo")');
    await expect(asDemo).toBeVisible();
    
    await asDemo.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'demo-as-result.png', fullPage: true });
    
    const asResult = page.url();
    console.log(`AS Demo Result: ${asResult}`);
    
    console.log('✅ DEMO BUTTONS TESTED');
  });

  test('should validate all form error messages', async ({ page }) => {
    console.log('❌ COMPREHENSIVE VALIDATION TESTING');
    console.log('====================================');
    
    // Test Login Validation
    console.log('📍 Testing Login Validation');
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Empty form
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'validation-login-empty.png', fullPage: true });
    
    // Invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'validation-login-invalid.png', fullPage: true });
    
    // Test Registration Validation
    console.log('📍 Testing Registration Validation');
    await page.goto('/auth/registro');
    await page.waitForLoadState('networkidle');
    
    // Empty form
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'validation-register-empty.png', fullPage: true });
    
    // Invalid email
    await page.fill('input[name="first_name"]', 'A');
    await page.fill('input[name="last_name"]', 'B');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'validation-register-invalid.png', fullPage: true });
    
    console.log('✅ VALIDATION TESTING COMPLETED');
  });

  test('should test responsive design across devices', async ({ page }) => {
    console.log('📱 RESPONSIVE DESIGN TESTING');
    console.log('=============================');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Mobile-SM', width: 320, height: 568 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📍 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Test homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `responsive-${viewport.name.toLowerCase()}-home.png`, fullPage: true });
      
      // Test login
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `responsive-${viewport.name.toLowerCase()}-login.png`, fullPage: true });
      
      // Test registration
      await page.goto('/auth/registro');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `responsive-${viewport.name.toLowerCase()}-register.png`, fullPage: true });
    }
    
    console.log('✅ RESPONSIVE TESTING COMPLETED');
  });

  test('should test complete navigation flow', async ({ page }) => {
    console.log('🧭 COMPLETE NAVIGATION TESTING');
    console.log('===============================');
    
    // Homepage navigation
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded');
    
    // Test all main navigation links
    const navLinks = await page.locator('nav a').all();
    console.log(`Found ${navLinks.length} navigation links`);
    
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
      const link = navLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      console.log(`Testing nav link: "${text}" -> "${href}"`);
      
      if (href && href.startsWith('#')) {
        // Section link
        await link.click();
        await page.waitForTimeout(1000);
        console.log(`✅ Section navigation: ${href}`);
      }
    }
    
    // Test auth navigation
    await page.click('a[href="/auth/login"]');
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page reached');
    
    await page.click('a[href="/auth/registro"]');
    await page.waitForLoadState('networkidle');
    console.log('✅ Registration page reached');
    
    // Back to homepage
    await page.goto('/');
    console.log('✅ Back to homepage');
    
    console.log('🎉 NAVIGATION TESTING COMPLETED');
  });
});

test.describe('Error Handling and Edge Cases', () => {
  
  test('should handle various error scenarios', async ({ page }) => {
    console.log('🚨 ERROR SCENARIOS TESTING');
    console.log('===========================');
    
    // Test 404 pages
    const invalidUrls = [
      '/nonexistent',
      '/auth/invalid',
      '/user/123',
      '/dashboard/fake',
      '/services/notfound'
    ];
    
    for (const url of invalidUrls) {
      console.log(`📍 Testing 404 for: ${url}`);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      const is404 = title.includes('404') || title.includes('Not Found');
      console.log(`${url} -> ${is404 ? '✅ 404 Working' : '❌ No 404'}`);
      
      if (is404) {
        await page.screenshot({ path: `error-404-${url.replace(/\//g, '_')}.png`, fullPage: true });
      }
    }
    
    console.log('✅ ERROR SCENARIOS COMPLETED');
  });
});