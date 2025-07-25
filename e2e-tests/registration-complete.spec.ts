import { test, expect } from '@playwright/test';

test.describe('Complete Registration Flow - Production', () => {
  
  test('should complete full registration process', async ({ page }) => {
    console.log('📋 Starting complete registration test');
    
    // Step 1: Navigate to registration
    await page.goto('/auth/registro');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'registration-step1-initial.png', fullPage: true });
    
    // Step 2: Fill first form (nombres y email)
    console.log('✅ Filling personal information');
    
    const firstNameInput = page.locator('input[name="first_name"]');
    const lastNameInput = page.locator('input[name="last_name"]');
    const emailInput = page.locator('input[name="email"]');
    const continueButton = page.locator('button:has-text("Continuar")');
    
    // Verify elements are visible
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(continueButton).toBeVisible();
    
    // Fill the form
    await firstNameInput.fill('Juan');
    await lastNameInput.fill('Pérez');
    await emailInput.fill(`test.user.${Date.now()}@fixia.com`);
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'registration-step1-filled.png', fullPage: true });
    
    // Click continue
    console.log('✅ Clicking Continue button');
    await continueButton.click();
    
    // Wait for next step
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of next step
    await page.screenshot({ path: 'registration-step2.png', fullPage: true });
    
    // Check what happened
    const currentUrl = page.url();
    const currentTitle = await page.title();
    console.log(`After continue: URL=${currentUrl}, Title="${currentTitle}"`);
    
    // Look for password fields (if it's a multi-step form)
    const passwordInputs = await page.locator('input[type="password"]').all();
    const passwordFields = await page.locator('input[name*="password"]').all();
    
    console.log(`Found ${passwordInputs.length} password type inputs`);
    console.log(`Found ${passwordFields.length} password name inputs`);
    
    if (passwordInputs.length > 0 || passwordFields.length > 0) {
      console.log('✅ Found password step');
      
      // Fill password fields if they exist
      const passwordField = passwordInputs.length > 0 ? passwordInputs[0] : passwordFields[0];
      const confirmField = passwordInputs.length > 1 ? passwordInputs[1] : 
                          (passwordFields.length > 1 ? passwordFields[1] : null);
      
      await passwordField.fill('TestPassword123!');
      if (confirmField) {
        await confirmField.fill('TestPassword123!');
      }
      
      // Look for next continue button
      const nextButton = page.locator('button:has-text("Continuar"), button[type="submit"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'registration-step3.png', fullPage: true });
      }
    }
    
    // Look for user type selection
    const userTypeButtons = await page.locator('button:has-text("Explorador"), button:has-text("AS"), button:has-text("Cliente")').all();
    console.log(`Found ${userTypeButtons.length} user type buttons`);
    
    if (userTypeButtons.length > 0) {
      console.log('✅ Found user type selection');
      await userTypeButtons[0].click(); // Click first option
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'registration-step-usertype.png', fullPage: true });
    }
    
    // Look for terms checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      console.log('✅ Found terms checkbox');
      await termsCheckbox.check();
      await page.waitForTimeout(1000);
    }
    
    // Look for final submit button
    const submitButtons = await page.locator('button:has-text("Registrar"), button:has-text("Crear"), button:has-text("Finalizar")').all();
    if (submitButtons.length > 0) {
      console.log('✅ Found final submit button');
      await submitButtons[0].click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'registration-final-result.png', fullPage: true });
    }
    
    // Check final state
    const finalUrl = page.url();
    const finalTitle = await page.title();
    console.log(`Final state: URL=${finalUrl}, Title="${finalTitle}"`);
    
    console.log('🎉 Registration flow test completed');
  });

  test('should test registration with different user types', async ({ page }) => {
    console.log('👥 Testing different registration paths');
    
    // Test direct customer registration
    await page.goto('/auth/registro?type=customer');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'registration-customer-direct.png', fullPage: true });
    
    const customerTitle = await page.title();
    console.log(`Customer registration title: "${customerTitle}"`);
    
    // Check for any differences in form
    const inputs = await page.locator('input').all();
    console.log(`Customer registration has ${inputs.length} inputs`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`Customer input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
    }
    
    console.log('✅ Customer registration path tested');
  });

  test('should test form validation', async ({ page }) => {
    console.log('🔍 Testing form validation');
    
    await page.goto('/auth/registro');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const continueButton = page.locator('button:has-text("Continuar")');
    await continueButton.click();
    
    // Wait for validation
    await page.waitForTimeout(2000);
    
    // Look for validation errors
    const errorElements = await page.locator('[class*="error"], [class*="invalid"], .text-red-500, [style*="color: red"]').all();
    console.log(`Found ${errorElements.length} potential validation errors`);
    
    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      if (errorText && errorText.trim()) {
        console.log(`Validation error ${i + 1}: "${errorText}"`);
      }
    }
    
    // Take screenshot of validation state
    await page.screenshot({ path: 'registration-validation-errors.png', fullPage: true });
    
    // Test invalid email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('invalid-email');
    await continueButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'registration-invalid-email.png', fullPage: true });
    
    console.log('✅ Form validation test completed');
  });

  test('should explore all registration links from homepage', async ({ page }) => {
    console.log('🔗 Testing registration links from homepage');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find all registration links
    const registerLinks = await page.locator('a[href*="registro"]').all();
    console.log(`Found ${registerLinks.length} registration links on homepage`);
    
    for (let i = 0; i < registerLinks.length; i++) {
      const link = registerLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`Registration link ${i + 1}: "${text?.trim()}" -> "${href}"`);
      
      // Test each link
      if (href) {
        await page.goto(href);
        await page.waitForLoadState('networkidle');
        
        const pageTitle = await page.title();
        console.log(`  Link leads to: "${pageTitle}"`);
        
        await page.screenshot({ path: `registration-link-${i + 1}.png`, fullPage: true });
        
        // Go back to homepage
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      }
    }
    
    console.log('✅ Registration links exploration completed');
  });
});