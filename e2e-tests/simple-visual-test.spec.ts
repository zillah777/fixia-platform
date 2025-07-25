import { test, expect } from '@playwright/test';

test.describe('Simple Visual Tests for Fixia.com.ar', () => {
  test('Complete user journey exploration', async ({ page }) => {
    console.log('🚀 Starting visual exploration of Fixia.com.ar');
    
    // 1. Homepage
    console.log('📍 Step 1: Visiting homepage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step1-homepage.png', fullPage: true });
    
    const title = await page.title();
    console.log(`✅ Homepage loaded: "${title}"`);
    await page.waitForTimeout(2000); // Pause to see
    
    // 2. Navigate to login
    console.log('📍 Step 2: Navigating to login');
    await page.click('a[href="/auth/login"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step2-login.png', fullPage: true });
    console.log('✅ Login page loaded');
    await page.waitForTimeout(2000);
    
    // 3. Fill login form
    console.log('📍 Step 3: Filling login form');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('usuario@ejemplo.com');
      console.log('✅ Email filled');
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('password123');
      console.log('✅ Password filled');
    }
    
    await page.screenshot({ path: 'step3-form-filled.png', fullPage: true });
    await page.waitForTimeout(2000);
    
    // 4. Navigate to registration
    console.log('📍 Step 4: Navigating to registration');
    await page.goto('/auth/registro');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step4-registration.png', fullPage: true });
    console.log('✅ Registration page loaded');
    await page.waitForTimeout(2000);
    
    // 5. Try registration with customer type
    console.log('📍 Step 5: Exploring customer registration');
    await page.goto('/auth/registro?type=customer');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step5-customer-registration.png', fullPage: true });
    console.log('✅ Customer registration page loaded');
    await page.waitForTimeout(2000);
    
    // 6. Explore navigation
    console.log('📍 Step 6: Exploring main sections');
    await page.goto('/');
    
    const sections = ['#como-funciona', '#servicios', '#profesionales', '#contacto'];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`📍 Scrolling to section: ${section}`);
      
      await page.locator(section).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `step6-section-${i + 1}.png`, fullPage: true });
      console.log(`✅ Section ${section} captured`);
    }
    
    console.log('🎉 Visual exploration completed!');
    console.log('📸 Check the generated screenshots for the complete journey');
  });

  test('Interactive form testing', async ({ page }) => {
    console.log('🔍 Testing form interactions');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Find and interact with form elements
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      
      console.log(`Input ${i + 1}: type="${type}", placeholder="${placeholder}", name="${name}"`);
      
      // Highlight the input
      await input.focus();
      await page.waitForTimeout(500);
      
      // Fill with test data based on type
      if (type === 'email') {
        await input.fill('test@fixia.com');
      } else if (type === 'password') {
        await input.fill('testpassword123');
      } else if (type === 'text') {
        await input.fill('Test Value');
      }
      
      await page.waitForTimeout(500);
    }
    
    // Find and highlight buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      
      console.log(`Button ${i + 1}: "${text}"`);
      
      // Highlight the button
      await button.hover();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: 'interactive-form-test.png', fullPage: true });
    console.log('✅ Interactive form testing completed');
  });
});