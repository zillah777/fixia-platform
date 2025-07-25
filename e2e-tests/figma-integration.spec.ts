import { test, expect } from '@playwright/test';

test.describe('Figma Integration for Fixia.com.ar', () => {
  
  test('should capture designs for Figma comparison', async ({ page }) => {
    console.log('🎨 CAPTURING DESIGNS FOR FIGMA INTEGRATION');
    console.log('===========================================');
    
    // 1. Homepage - Full design capture
    console.log('📍 Capturing Homepage Design');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Full page capture for Figma
    await page.screenshot({ 
      path: 'figma-homepage-full.png', 
      fullPage: true,
      clip: undefined // Full page
    });
    
    // Hero section capture
    const heroSection = page.locator('section').first();
    if (await heroSection.isVisible()) {
      await heroSection.screenshot({ path: 'figma-hero-section.png' });
    }
    
    // Navigation capture
    const navigation = page.locator('nav');
    if (await navigation.isVisible()) {
      await navigation.screenshot({ path: 'figma-navigation.png' });
    }
    
    console.log('✅ Homepage design captured');
    
    // 2. Login Page Design
    console.log('📍 Capturing Login Page Design');
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'figma-login-page.png', 
      fullPage: true 
    });
    
    // Login form specific capture
    const loginForm = page.locator('form, .login-form, [class*="form"]').first();
    if (await loginForm.isVisible()) {
      await loginForm.screenshot({ path: 'figma-login-form.png' });
    }
    
    // Demo buttons capture
    const demoSection = page.locator('[class*="demo"], button:has-text("Demo")').first();
    if (await demoSection.isVisible()) {
      await demoSection.screenshot({ path: 'figma-demo-buttons.png' });
    }
    
    console.log('✅ Login page design captured');
    
    // 3. Registration Page Design
    console.log('📍 Capturing Registration Page Design');
    await page.goto('/auth/registro');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'figma-registration-page.png', 
      fullPage: true 
    });
    
    // Registration form capture
    const regForm = page.locator('form, .registration-form, [class*="form"]').first();
    if (await regForm.isVisible()) {
      await regForm.screenshot({ path: 'figma-registration-form.png' });
    }
    
    console.log('✅ Registration page design captured');
    
    // 4. Mobile Design Captures
    console.log('📍 Capturing Mobile Designs');
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'figma-mobile-homepage.png', fullPage: true });
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'figma-mobile-login.png', fullPage: true });
    
    console.log('✅ Mobile designs captured');
    
    console.log('🎨 ALL FIGMA DESIGNS CAPTURED FOR COMPARISON');
  });

  test('should test design system components', async ({ page }) => {
    console.log('🧩 TESTING DESIGN SYSTEM COMPONENTS');
    console.log('====================================');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Button components analysis
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} button components`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      
      console.log(`Button ${i + 1}: "${text}" (classes: ${className})`);
      
      // Capture each button for design system
      await button.screenshot({ path: `figma-button-component-${i + 1}.png` });
    }
    
    // Input components analysis
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input components`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');
      
      console.log(`Input ${i + 1}: type="${type}", placeholder="${placeholder}" (classes: ${className})`);
      
      // Capture each input for design system
      await input.screenshot({ path: `figma-input-component-${i + 1}.png` });
    }
    
    console.log('✅ Design system components captured');
  });

  test('should test color scheme and branding', async ({ page }) => {
    console.log('🎨 ANALYZING COLOR SCHEME AND BRANDING');
    console.log('======================================');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Extract color information from CSS
    const colorInfo = await page.evaluate(() => {
      const computedStyles = window.getComputedStyle(document.body);
      const colors = {
        background: computedStyles.backgroundColor,
        text: computedStyles.color,
        primary: '',
        secondary: ''
      };
      
      // Try to find primary colors from common elements
      const buttons = document.querySelectorAll('button');
      if (buttons.length > 0) {
        const buttonStyle = window.getComputedStyle(buttons[0]);
        colors.primary = buttonStyle.backgroundColor || buttonStyle.borderColor;
      }
      
      const links = document.querySelectorAll('a');
      if (links.length > 0) {
        const linkStyle = window.getComputedStyle(links[0]);
        colors.secondary = linkStyle.color;
      }
      
      return colors;
    });
    
    console.log('🎨 Color Scheme Analysis:');
    console.log(`  Background: ${colorInfo.background}`);
    console.log(`  Text: ${colorInfo.text}`);
    console.log(`  Primary: ${colorInfo.primary}`);
    console.log(`  Secondary: ${colorInfo.secondary}`);
    
    // Capture brand elements
    const logo = page.locator('img[alt*="logo"], img[alt*="Fixia"], .logo').first();
    if (await logo.isVisible()) {
      await logo.screenshot({ path: 'figma-logo-element.png' });
      console.log('✅ Logo element captured');
    }
    
    console.log('✅ Branding analysis completed');
  });

  test('should generate component library for Figma', async ({ page }) => {
    console.log('📚 GENERATING COMPONENT LIBRARY FOR FIGMA');
    console.log('==========================================');
    
    const components = [
      { name: 'Login Form', selector: 'form, .login-form', url: '/auth/login' },
      { name: 'Registration Form', selector: 'form, .registration-form', url: '/auth/registro' },
      { name: 'Navigation', selector: 'nav', url: '/' },
      { name: 'Hero Section', selector: 'section:first-of-type', url: '/' },
      { name: 'Footer', selector: 'footer', url: '/' }
    ];
    
    for (const component of components) {
      console.log(`📸 Capturing ${component.name}...`);
      
      await page.goto(component.url);
      await page.waitForLoadState('networkidle');
      
      const element = page.locator(component.selector).first();
      if (await element.isVisible()) {
        await element.screenshot({ 
          path: `figma-component-${component.name.toLowerCase().replace(/\s+/g, '-')}.png` 
        });
        console.log(`✅ ${component.name} captured`);
      } else {
        console.log(`⚠️ ${component.name} not found`);
      }
    }
    
    console.log('📚 Component library generation completed');
  });

  test('should test responsive breakpoints for Figma frames', async ({ page }) => {
    console.log('📱 TESTING RESPONSIVE BREAKPOINTS FOR FIGMA');
    console.log('=============================================');
    
    const breakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Mobile-L', width: 414, height: 896 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Laptop', width: 1024, height: 768 },
      { name: 'Desktop', width: 1440, height: 900 },
      { name: 'Desktop-L', width: 1920, height: 1080 }
    ];
    
    const pages = [
      { name: 'Homepage', url: '/' },
      { name: 'Login', url: '/auth/login' },
      { name: 'Registration', url: '/auth/registro' }
    ];
    
    for (const breakpoint of breakpoints) {
      console.log(`📱 Testing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      for (const pageInfo of pages) {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: `figma-${breakpoint.name.toLowerCase()}-${pageInfo.name.toLowerCase()}.png`,
          fullPage: true
        });
        
        console.log(`✅ ${breakpoint.name} - ${pageInfo.name} captured`);
      }
    }
    
    console.log('📱 All responsive breakpoints captured for Figma');
  });
});

test.describe('Figma Design Comparison', () => {
  
  test('should compare actual vs Figma designs', async ({ page }) => {
    console.log('🔍 FIGMA DESIGN COMPARISON TESTING');
    console.log('===================================');
    
    // This test would compare actual implementation with Figma designs
    // For now, we'll capture high-fidelity screenshots for manual comparison
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Capture for pixel-perfect comparison
    await page.screenshot({ 
      path: 'figma-comparison-homepage.png', 
      fullPage: true,
      type: 'png' // High quality for comparison
    });
    
    // Capture specific sections that might be in Figma
    const sections = await page.locator('section').all();
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (await section.isVisible()) {
        await section.screenshot({ 
          path: `figma-comparison-section-${i + 1}.png`,
          type: 'png'
        });
      }
    }
    
    console.log('✅ High-fidelity captures ready for Figma comparison');
  });

  test('should extract design tokens for Figma', async ({ page }) => {
    console.log('🎨 EXTRACTING DESIGN TOKENS FOR FIGMA');
    console.log('======================================');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Extract design tokens that could be used in Figma
    const designTokens = await page.evaluate(() => {
      const tokens = {
        typography: {},
        colors: {},
        spacing: {},
        shadows: {}
      };
      
      // Extract typography
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading, i) => {
        const style = window.getComputedStyle(heading);
        tokens.typography[`heading-${i + 1}`] = {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          fontFamily: style.fontFamily
        };
      });
      
      // Extract button styles
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, i) => {
        const style = window.getComputedStyle(button);
        tokens.colors[`button-${i + 1}`] = {
          background: style.backgroundColor,
          color: style.color,
          border: style.borderColor
        };
      });
      
      return tokens;
    });
    
    // Save design tokens to file for Figma import
    console.log('🎨 Design Tokens Extracted:');
    console.log(JSON.stringify(designTokens, null, 2));
    
    console.log('✅ Design tokens ready for Figma import');
  });
});