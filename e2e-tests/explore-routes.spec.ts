import { test, expect } from '@playwright/test';

test.describe('Route Exploration', () => {
  const routes = [
    '/',
    '/login',
    '/register',
    '/registro',
    '/auth/login',
    '/auth/registro',
    '/explorador/dashboard',
    '/as/dashboard',
    '/solicitar-servicio',
    '/buscar-servicio',
    '/servicios',
    '/profesionales',
    '/contacto',
    '/about',
    '/como-funciona'
  ];

  for (const route of routes) {
    test(`should check route: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      const url = page.url();
      const is404 = title.includes('404') || title.includes('Not Found');
      
      console.log(`Route: ${route}`);
      console.log(`  Final URL: ${url}`);
      console.log(`  Title: ${title}`);
      console.log(`  Is 404: ${is404}`);
      console.log(`  Status: ${is404 ? '❌ Not Found' : '✅ Available'}`);
      console.log('---');
      
      // Take screenshot for available routes
      if (!is404) {
        await page.screenshot({ 
          path: `route-${route.replace(/[\/]/g, '_')}.png`,
          fullPage: true 
        });
      }
    });
  }

  test('should explore homepage links and sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main sections
    const sections = ['#como-funciona', '#servicios', '#profesionales', '#contacto'];
    
    for (const section of sections) {
      const element = page.locator(section);
      const exists = await element.isVisible();
      console.log(`Section ${section}: ${exists ? '✅ Found' : '❌ Not found'}`);
      
      if (exists) {
        const content = await element.textContent();
        console.log(`  Content preview: ${content?.substring(0, 100)}...`);
      }
    }
    
    // Look for any forms
    const forms = await page.locator('form').all();
    console.log(`Found ${forms.length} forms on homepage`);
    
    for (let i = 0; i < forms.length; i++) {
      const action = await forms[i].getAttribute('action');
      const method = await forms[i].getAttribute('method');
      console.log(`  Form ${i + 1}: action="${action}", method="${method}"`);
    }
    
    // Look for any auth-related buttons
    const authButtons = await page.locator('button, a').filter({ 
      hasText: /login|registro|iniciar|entrar|registrarse/i 
    }).all();
    
    console.log(`Found ${authButtons.length} potential auth buttons`);
    
    for (let i = 0; i < authButtons.length; i++) {
      const text = await authButtons[i].textContent();
      const href = await authButtons[i].getAttribute('href');
      const tagName = await authButtons[i].evaluate(el => el.tagName);
      console.log(`  Auth button ${i + 1}: "${text}" (${tagName}, href="${href}")`);
    }
  });
});