import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('AS Dashboard', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    await page.waitForURL(/\/(dashboard|perfil)/);
  });

  test('should display AS dashboard with revenue analytics', async ({ page }) => {
    // Navigate to dashboard if we're on profile completion
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    await helpers.waitForElement('[data-testid="as-dashboard"]');
    
    // Check for revenue analytics
    await helpers.waitForElement('[data-testid="revenue-analytics"]');
    await helpers.waitForElement('[data-testid="monthly-earnings"]');
    await helpers.waitForElement('[data-testid="completed-services"]');
    await helpers.waitForElement('[data-testid="conversion-rate"]');
    
    // Verify analytics have numeric values
    const monthlyEarnings = await page.textContent('[data-testid="monthly-earnings"] .stat-value');
    const completedServices = await page.textContent('[data-testid="completed-services"] .stat-value');
    const conversionRate = await page.textContent('[data-testid="conversion-rate"] .stat-value');
    
    expect(monthlyEarnings).toMatch(/^\$?[\d,]+/);
    expect(completedServices).toMatch(/^\d+$/);
    expect(conversionRate).toMatch(/^\d+%$/);
  });

  test('should display performance metrics', async ({ page }) => {
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    await helpers.waitForElement('[data-testid="performance-metrics"]');
    
    // Check performance indicators
    await helpers.waitForElement('[data-testid="response-time"]');
    await helpers.waitForElement('[data-testid="client-satisfaction"]');
    await helpers.waitForElement('[data-testid="active-services"]');
    
    // Verify metrics have proper values
    const responseTime = await page.textContent('[data-testid="response-time"] .metric-value');
    const satisfaction = await page.textContent('[data-testid="client-satisfaction"] .metric-value');
    const activeServices = await page.textContent('[data-testid="active-services"] .metric-value');
    
    expect(responseTime).toMatch(/^\d+[\w\s]*$/); // e.g., "2 horas"
    expect(satisfaction).toMatch(/^\d+\.?\d*$/); // e.g., "4.8"
    expect(activeServices).toMatch(/^\d+$/);
  });

  test('should show service management section', async ({ page }) => {
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    await helpers.waitForElement('[data-testid="service-management"]');
    
    // Check for service list with status indicators
    const serviceItems = page.locator('[data-testid="service-item"]');
    const newServiceButton = page.locator('[data-testid="new-service-button"]');
    
    await expect(newServiceButton).toBeVisible();
    
    // If services exist, check their structure
    const serviceCount = await serviceItems.count();
    if (serviceCount > 0) {
      const firstService = serviceItems.first();
      await expect(firstService.locator('[data-testid="service-title"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="service-status"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="service-views"]')).toBeVisible();
    }
  });

  test('should display calendar with upcoming appointments', async ({ page }) => {
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    await helpers.waitForElement('[data-testid="calendar-section"]');
    
    // Check for calendar or upcoming appointments
    const calendar = page.locator('[data-testid="calendar"]');
    const appointmentsList = page.locator('[data-testid="upcoming-appointments"]');
    
    const hasCalendar = await calendar.isVisible();
    const hasAppointments = await appointmentsList.isVisible();
    
    expect(hasCalendar || hasAppointments).toBeTruthy();
    
    // If there are appointments, check structure
    const appointmentItems = page.locator('[data-testid="appointment-item"]');
    const appointmentCount = await appointmentItems.count();
    
    if (appointmentCount > 0) {
      const firstAppointment = appointmentItems.first();
      await expect(firstAppointment.locator('[data-testid="appointment-client"]')).toBeVisible();
      await expect(firstAppointment.locator('[data-testid="appointment-service"]')).toBeVisible();
      await expect(firstAppointment.locator('[data-testid="appointment-datetime"]')).toBeVisible();
    }
  });

  test('should show quick actions for AS', async ({ page }) => {
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    // Check AS-specific quick actions
    await helpers.waitForElement('[data-testid="new-service-button"]');
    await helpers.waitForElement('[data-testid="view-requests-button"]');
    await helpers.waitForElement('[data-testid="manage-calendar-button"]');
    await helpers.waitForElement('[data-testid="earnings-report-button"]');
    
    // Verify buttons are clickable
    await expect(page.locator('[data-testid="new-service-button"]')).toBeEnabled();
    await expect(page.locator('[data-testid="view-requests-button"]')).toBeEnabled();
  });

  test('should navigate to create new service', async ({ page }) => {
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    await page.click('[data-testid="new-service-button"]');
    
    // Should navigate to service creation page
    await expect(page).toHaveURL(/\/crear-servicio/);
    
    // Should show service creation form
    await helpers.waitForElement('[data-testid="service-creation-form"]');
  });

  test('should navigate to incoming requests', async ({ page }) => {
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    await page.click('[data-testid="view-requests-button"]');
    
    // Should navigate to requests list
    await expect(page).toHaveURL(/\/solicitudes/);
    
    // Should show incoming requests
    await helpers.waitForElement('[data-testid="incoming-requests"]');
  });

  test('should show profile completion progress for new AS', async ({ page }) => {
    // If we're on profile completion page
    if (page.url().includes('perfil')) {
      await helpers.waitForElement('[data-testid="profile-completion"]');
      
      // Check completion progress
      await helpers.waitForElement('[data-testid="completion-progress"]');
      await helpers.waitForElement('[data-testid="completion-percentage"]');
      
      // Should show completion steps
      await helpers.waitForElement('[data-testid="completion-steps"]');
      
      // Check for specific completion requirements
      const steps = page.locator('[data-testid="completion-step"]');
      const stepCount = await steps.count();
      
      expect(stepCount).toBeGreaterThan(0);
      
      // Each step should have a status indicator
      if (stepCount > 0) {
        const firstStep = steps.first();
        await expect(firstStep.locator('[data-testid="step-status"]')).toBeVisible();
        await expect(firstStep.locator('[data-testid="step-title"]')).toBeVisible();
      }
    }
  });

  test('should handle AS user menu correctly', async ({ page }) => {
    // Navigate to dashboard if needed
    if (page.url().includes('perfil')) {
      await page.goto('/dashboard');
    }
    
    // Check user menu
    await helpers.waitForElement('[data-testid="user-menu"]');
    
    // Click to open user menu
    await page.click('[data-testid="user-menu-button"]');
    
    // Should show AS user info
    await helpers.waitForElement('[data-testid="user-type"]');
    const userType = await page.textContent('[data-testid="user-type"]');
    expect(userType).toContain('AS');
    
    // Check AS-specific menu options
    await helpers.waitForElement('[data-testid="menu-dashboard"]');
    await helpers.waitForElement('[data-testid="menu-services"]');
    await helpers.waitForElement('[data-testid="menu-requests"]');
    await helpers.waitForElement('[data-testid="menu-earnings"]');
    await helpers.waitForElement('[data-testid="menu-profile"]');
    await helpers.waitForElement('[data-testid="logout-button"]');
  });
});

test.describe('AS Profile Completion', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    
    // Should be on profile completion or navigate there
    if (!page.url().includes('perfil')) {
      await page.goto('/perfil?completar=true');
    }
  });

  test('should display profile completion form', async ({ page }) => {
    await helpers.waitForElement('[data-testid="profile-completion-form"]');
    
    // Check required AS profile fields
    await helpers.waitForElement('[data-testid="business-name"]');
    await helpers.waitForElement('[data-testid="business-description"]');
    await helpers.waitForElement('[data-testid="service-categories"]');
    await helpers.waitForElement('[data-testid="experience-years"]');
    await helpers.waitForElement('[data-testid="service-areas"]');
    
    // Check optional fields
    const websiteField = page.locator('[data-testid="website"]');
    const portfolioUpload = page.locator('[data-testid="portfolio-upload"]');
    
    await expect(websiteField).toBeVisible();
    await expect(portfolioUpload).toBeVisible();
  });

  test('should complete AS profile successfully', async ({ page }) => {
    // Fill required fields
    await helpers.fillField('[data-testid="business-name"]', 'García Plomería Profesional');
    await helpers.fillField('[data-testid="business-description"]', 'Servicios de plomería con más de 10 años de experiencia. Atendemos emergencias las 24 horas.');
    
    // Select service categories (multi-select)
    await page.selectOption('[data-testid="service-categories"]', ['plomeria', 'reparaciones']);
    
    await helpers.fillField('[data-testid="experience-years"]', '10');
    
    // Select service areas (multi-select)
    await page.selectOption('[data-testid="service-areas"]', ['rawson', 'trelew']);
    
    // Fill optional fields
    await helpers.fillField('[data-testid="website"]', 'https://garcia-plomeria.com');
    
    // Submit profile
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show success message
    await helpers.waitForElement('[data-testid="profile-completion-success"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should validate required profile fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show validation errors
    await helpers.waitForElement('[data-testid="error-business-name"]');
    await helpers.waitForElement('[data-testid="error-business-description"]');
    await helpers.waitForElement('[data-testid="error-service-categories"]');
    await helpers.waitForElement('[data-testid="error-experience-years"]');
    
    const nameError = await page.textContent('[data-testid="error-business-name"]');
    expect(nameError).toContain('requerido');
  });

  test('should validate business description length', async ({ page }) => {
    await helpers.fillField('[data-testid="business-name"]', 'Test Business');
    await helpers.fillField('[data-testid="business-description"]', 'Too short');
    await page.selectOption('[data-testid="service-categories"]', ['plomeria']);
    
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show description length error
    await helpers.waitForElement('[data-testid="error-business-description"]');
    const errorText = await page.textContent('[data-testid="error-business-description"]');
    expect(errorText).toContain('mínimo');
  });

  test('should validate experience years', async ({ page }) => {
    await helpers.fillField('[data-testid="business-name"]', 'Test Business');
    await helpers.fillField('[data-testid="business-description"]', 'Valid description with enough length to pass validation requirements.');
    await page.selectOption('[data-testid="service-categories"]', ['plomeria']);
    
    // Try invalid experience years
    await helpers.fillField('[data-testid="experience-years"]', '-5');
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show validation error
    await helpers.waitForElement('[data-testid="error-experience-years"]');
    const errorText = await page.textContent('[data-testid="error-experience-years"]');
    expect(errorText).toContain('válido');
  });

  test('should validate website URL format', async ({ page }) => {
    await helpers.fillField('[data-testid="business-name"]', 'Test Business');
    await helpers.fillField('[data-testid="business-description"]', 'Valid description with enough length to pass validation requirements.');
    await page.selectOption('[data-testid="service-categories"]', ['plomeria']);
    await helpers.fillField('[data-testid="experience-years"]', '5');
    
    // Try invalid website URL
    await helpers.fillField('[data-testid="website"]', 'invalid-url');
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show URL validation error
    await helpers.waitForElement('[data-testid="error-website"]');
    const errorText = await page.textContent('[data-testid="error-website"]');
    expect(errorText).toContain('URL válida');
  });

  test('should handle portfolio image uploads', async ({ page }) => {
    const portfolioUpload = page.locator('[data-testid="portfolio-upload"]');
    
    if (await portfolioUpload.isVisible()) {
      // This would require test fixture images
      // For now, just check the upload interface exists
      await expect(portfolioUpload).toBeVisible();
      
      // Check for upload instructions or preview area
      const uploadInstructions = page.locator('[data-testid="upload-instructions"]');
      const imagePreview = page.locator('[data-testid="image-preview"]');
      
      const hasInstructions = await uploadInstructions.isVisible();
      const hasPreview = await imagePreview.isVisible();
      
      expect(hasInstructions || hasPreview).toBeTruthy();
    }
  });

  test('should show completion progress', async ({ page }) => {
    // Check for progress indicator
    await helpers.waitForElement('[data-testid="completion-progress"]');
    
    const progressBar = page.locator('[data-testid="progress-bar"]');
    const progressPercentage = page.locator('[data-testid="progress-percentage"]');
    
    await expect(progressBar).toBeVisible();
    await expect(progressPercentage).toBeVisible();
    
    // Progress should be numeric
    const percentage = await progressPercentage.textContent();
    expect(percentage).toMatch(/^\d+%$/);
  });

  test('should allow skipping optional fields', async ({ page }) => {
    // Fill only required fields
    await helpers.fillField('[data-testid="business-name"]', 'Minimal Business');
    await helpers.fillField('[data-testid="business-description"]', 'Valid minimal description for business profile completion.');
    await page.selectOption('[data-testid="service-categories"]', ['limpieza']);
    await helpers.fillField('[data-testid="experience-years"]', '2');
    await page.selectOption('[data-testid="service-areas"]', ['rawson']);
    
    // Skip optional fields (website, portfolio)
    await page.click('[data-testid="save-profile-button"]');
    
    // Should still save successfully
    await helpers.waitForElement('[data-testid="profile-completion-success"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});