import { test, expect } from '@playwright/test';

test.describe('Page Exploration', () => {
  test('should explore login page structure', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'login-page-structure.png', fullPage: true });
    
    // Get all interactive elements
    const buttons = await page.locator('button').all();
    const inputs = await page.locator('input').all();
    const links = await page.locator('a').all();
    
    console.log(`Found ${buttons.length} buttons`);
    console.log(`Found ${inputs.length} inputs`);
    console.log(`Found ${links.length} links`);
    
    // Print button texts
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const className = await buttons[i].getAttribute('class');
      console.log(`Button ${i + 1}: "${text}" (class: "${className}")`);
    }
    
    // Print input attributes
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const id = await inputs[i].getAttribute('id');
      const name = await inputs[i].getAttribute('name');
      console.log(`Input ${i + 1}: type="${type}", placeholder="${placeholder}", id="${id}", name="${name}"`);
    }
    
    // Check page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`Page title: "${title}"`);
    console.log(`Page URL: "${url}"`);
    
    // Get page HTML for inspection
    const html = await page.content();
    console.log('Page HTML length:', html.length);
    
    // Look for any data-testid attributes
    const testIds = await page.locator('[data-testid]').all();
    console.log(`Found ${testIds.length} elements with data-testid`);
    
    for (let i = 0; i < Math.min(testIds.length, 10); i++) {
      const testId = await testIds[i].getAttribute('data-testid');
      const tagName = await testIds[i].evaluate(el => el.tagName);
      console.log(`TestID ${i + 1}: "${testId}" on ${tagName}`);
    }
  });

  test('should explore homepage structure', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'homepage-structure.png', fullPage: true });
    
    // Check page title
    const title = await page.title();
    console.log(`Homepage title: "${title}"`);
    
    // Get navigation elements
    const navLinks = await page.locator('nav a').all();
    console.log(`Found ${navLinks.length} navigation links`);
    
    for (let i = 0; i < navLinks.length; i++) {
      const text = await navLinks[i].textContent();
      const href = await navLinks[i].getAttribute('href');
      console.log(`Nav link ${i + 1}: "${text}" -> "${href}"`);
    }
  });
});