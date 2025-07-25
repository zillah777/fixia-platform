import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('Service Request Creation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as Explorador
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to service request creation
    await page.goto('/solicitar-servicio');
  });

  test('should display service request form with all fields', async ({ page }) => {
    await helpers.waitForElement('[data-testid="service-request-form"]');
    
    // Check all form fields are present
    await helpers.waitForElement('[data-testid="category-select"]');
    await helpers.waitForElement('[data-testid="description"]');
    await helpers.waitForElement('[data-testid="location-select"]');
    await helpers.waitForElement('[data-testid="priority-select"]');
    await helpers.waitForElement('[data-testid="budget-min"]');
    await helpers.waitForElement('[data-testid="budget-max"]');
    await helpers.waitForElement('[data-testid="preferred-date"]');
    await helpers.waitForElement('[data-testid="flexible-timing-checkbox"]');
    
    // Check submit button
    await helpers.waitForElement('[data-testid="submit-request-button"]');
  });

  test('should populate category options correctly', async ({ page }) => {
    const categorySelect = page.locator('[data-testid="category-select"]');
    
    // Get all options
    const options = await categorySelect.locator('option').all();
    const optionTexts = await Promise.all(
      options.map(option => option.textContent())
    );
    
    // Should include main service categories
    expect(optionTexts.some(text => text?.includes('Plomería'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Electricidad'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Limpieza'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Reparaciones'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Belleza'))).toBeTruthy();
  });

  test('should populate Chubut locations correctly', async ({ page }) => {
    const locationSelect = page.locator('[data-testid="location-select"]');
    
    // Get all options
    const options = await locationSelect.locator('option').all();
    const optionTexts = await Promise.all(
      options.map(option => option.textContent())
    );
    
    // Should include main Chubut locations
    expect(optionTexts.some(text => text?.includes('Rawson'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Puerto Madryn'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Trelew'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Comodoro Rivadavia'))).toBeTruthy();
  });

  test('should create service request successfully', async ({ page }) => {
    // Fill out the form
    await page.selectOption('[data-testid="category-select"]', 'plomeria');
    await helpers.fillField('[data-testid="description"]', 'Necesito reparar una fuga en la cocina. El problema está en la tubería debajo del fregadero.');
    await page.selectOption('[data-testid="location-select"]', 'rawson');
    await page.selectOption('[data-testid="priority-select"]', 'normal');
    await helpers.fillField('[data-testid="budget-min"]', '2000');
    await helpers.fillField('[data-testid="budget-max"]', '5000');
    
    // Submit the request
    await page.click('[data-testid="submit-request-button"]');
    
    // Should show success message
    await helpers.waitForElement('[data-testid="request-success"]');
    
    // Should redirect to requests list or dashboard
    await expect(page).toHaveURL(/\/(dashboard|mis-solicitudes)/);
  });

  test('should auto-generate title based on category and location', async ({ page }) => {
    // Select category and location
    await page.selectOption('[data-testid="category-select"]', 'electricidad');
    await page.selectOption('[data-testid="location-select"]', 'puerto-madryn');
    
    // Should auto-generate title
    await helpers.waitForElement('[data-testid="generated-title"]');
    const title = await page.textContent('[data-testid="generated-title"]');
    
    expect(title).toContain('Electricidad');
    expect(title).toContain('Puerto Madryn');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="submit-request-button"]');
    
    // Should show validation errors
    await helpers.waitForElement('[data-testid="error-category"]');
    await helpers.waitForElement('[data-testid="error-description"]');
    await helpers.waitForElement('[data-testid="error-location"]');
    
    const categoryError = await page.textContent('[data-testid="error-category"]');
    const descriptionError = await page.textContent('[data-testid="error-description"]');
    
    expect(categoryError).toContain('requerido');
    expect(descriptionError).toContain('requerido');
  });

  test('should validate description length', async ({ page }) => {
    // Try with very short description
    await page.selectOption('[data-testid="category-select"]', 'plomeria');
    await helpers.fillField('[data-testid="description"]', 'abc');
    await page.selectOption('[data-testid="location-select"]', 'rawson');
    
    await page.click('[data-testid="submit-request-button"]');
    
    // Should show description length error
    await helpers.waitForElement('[data-testid="error-description"]');
    const errorText = await page.textContent('[data-testid="error-description"]');
    expect(errorText).toContain('mínimo');
  });

  test('should validate budget range', async ({ page }) => {
    await page.selectOption('[data-testid="category-select"]', 'plomeria');
    await helpers.fillField('[data-testid="description"]', 'Test description with enough length');
    await page.selectOption('[data-testid="location-select"]', 'rawson');
    
    // Set invalid budget range (min > max)
    await helpers.fillField('[data-testid="budget-min"]', '5000');
    await helpers.fillField('[data-testid="budget-max"]', '2000');
    
    await page.click('[data-testid="submit-request-button"]');
    
    // Should show budget validation error
    await helpers.waitForElement('[data-testid="error-budget"]');
    const errorText = await page.textContent('[data-testid="error-budget"]');
    expect(errorText).toContain('mínimo');
  });

  test('should handle flexible timing option', async ({ page }) => {
    // Check flexible timing checkbox
    await page.click('[data-testid="flexible-timing-checkbox"]');
    
    // Date field should become optional/disabled
    const dateField = page.locator('[data-testid="preferred-date"]');
    const isDateOptional = await dateField.isDisabled() || 
                          await dateField.getAttribute('aria-required') === 'false';
    
    expect(isDateOptional).toBeTruthy();
  });

  test('should save draft and restore form data', async ({ page }) => {
    // Fill partial form
    await page.selectOption('[data-testid="category-select"]', 'limpieza');
    await helpers.fillField('[data-testid="description"]', 'Necesito limpieza profunda del hogar');
    
    // Navigate away
    await page.goto('/dashboard');
    
    // Return to form
    await page.goto('/solicitar-servicio');
    
    // Should restore draft data
    await expect(page.locator('[data-testid="category-select"]')).toHaveValue('limpieza');
    await expect(page.locator('[data-testid="description"]')).toHaveValue('Necesito limpieza profunda del hogar');
  });

  test('should handle priority levels correctly', async ({ page }) => {
    const prioritySelect = page.locator('[data-testid="priority-select"]');
    
    // Should have all priority options
    const options = await prioritySelect.locator('option').all();
    const optionValues = await Promise.all(
      options.map(option => option.getAttribute('value'))
    );
    
    expect(optionValues).toContain('flexible');
    expect(optionValues).toContain('normal');
    expect(optionValues).toContain('urgente');
    expect(optionValues).toContain('emergencia');
  });
});

test.describe('Service Request Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as Explorador
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to requests list
    await page.goto('/mis-solicitudes');
  });

  test('should display service requests list', async ({ page }) => {
    await helpers.waitForElement('[data-testid="requests-list"]');
    
    // Should show requests or empty state
    const requestItems = page.locator('[data-testid="request-item"]');
    const emptyState = page.locator('[data-testid="no-requests"]');
    
    const hasRequests = await requestItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasRequests || hasEmptyState).toBeTruthy();
  });

  test('should display request details correctly', async ({ page }) => {
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      // Check request structure
      await expect(firstRequest.locator('[data-testid="request-title"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-category"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-location"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-status"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-date"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-responses"]')).toBeVisible();
    }
  });

  test('should filter requests by status', async ({ page }) => {
    // Check for status filter
    const statusFilter = page.locator('[data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      // Filter by active requests
      await statusFilter.selectOption('active');
      
      // Should show only active requests
      await helpers.waitForPageLoad();
      
      const visibleRequests = page.locator('[data-testid="request-item"]');
      const count = await visibleRequests.count();
      
      if (count > 0) {
        // All visible requests should have active status
        const firstStatus = await visibleRequests.first().locator('[data-testid="request-status"]').textContent();
        expect(firstStatus?.toLowerCase()).toContain('active');
      }
    }
  });

  test('should view individual request details', async ({ page }) => {
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      await firstRequest.click();
      
      // Should navigate to request detail page
      await expect(page).toHaveURL(/\/solicitud\/\d+/);
      
      // Should show detailed view
      await helpers.waitForElement('[data-testid="request-detail"]');
      await helpers.waitForElement('[data-testid="request-description"]');
      await helpers.waitForElement('[data-testid="request-responses"]');
    }
  });

  test('should view AS responses to requests', async ({ page }) => {
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      await firstRequest.click();
      
      // Check for responses section
      await helpers.waitForElement('[data-testid="request-responses"]');
      
      const responses = page.locator('[data-testid="response-item"]');
      const responseCount = await responses.count();
      
      if (responseCount > 0) {
        // Each response should have proper structure
        const firstResponse = responses.first();
        await expect(firstResponse.locator('[data-testid="response-provider"]')).toBeVisible();
        await expect(firstResponse.locator('[data-testid="response-message"]')).toBeVisible();
        await expect(firstResponse.locator('[data-testid="response-price"]')).toBeVisible();
        await expect(firstResponse.locator('[data-testid="response-date"]')).toBeVisible();
        
        // Should have action buttons
        await expect(firstResponse.locator('[data-testid="accept-response-button"]')).toBeVisible();
        await expect(firstResponse.locator('[data-testid="message-provider-button"]')).toBeVisible();
      }
    }
  });

  test('should accept AS response', async ({ page }) => {
    // Navigate to a request with responses
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      await firstRequest.click();
      
      const firstResponse = page.locator('[data-testid="response-item"]').first();
      
      if (await firstResponse.isVisible()) {
        // Click accept button
        await firstResponse.locator('[data-testid="accept-response-button"]').click();
        
        // Should show confirmation dialog
        await helpers.waitForElement('[data-testid="accept-confirmation"]');
        
        // Confirm acceptance
        await page.click('[data-testid="confirm-accept-button"]');
        
        // Should show success message
        await helpers.waitForElement('[data-testid="acceptance-success"]');
        
        // Request status should update
        const updatedStatus = await page.textContent('[data-testid="request-status"]');
        expect(updatedStatus?.toLowerCase()).toContain('accepted');
      }
    }
  });

  test('should edit request if no responses', async ({ page }) => {
    // Find a request without responses
    const requestItems = page.locator('[data-testid="request-item"]');
    const count = await requestItems.count();
    
    for (let i = 0; i < count; i++) {
      const request = requestItems.nth(i);
      const responseCount = await request.locator('[data-testid="response-count"]').textContent();
      
      if (responseCount === '0' || !responseCount) {
        await request.click();
        
        // Should have edit button
        if (await page.locator('[data-testid="edit-request-button"]').isVisible()) {
          await page.click('[data-testid="edit-request-button"]');
          
          // Should navigate to edit form
          await expect(page).toHaveURL(/\/solicitud\/\d+\/editar/);
          
          // Should show populated form
          await helpers.waitForElement('[data-testid="service-request-form"]');
          break;
        }
      }
    }
  });

  test('should cancel request', async ({ page }) => {
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      await firstRequest.click();
      
      // Check if cancel button is available
      if (await page.locator('[data-testid="cancel-request-button"]').isVisible()) {
        await page.click('[data-testid="cancel-request-button"]');
        
        // Should show confirmation dialog
        await helpers.waitForElement('[data-testid="cancel-confirmation"]');
        
        // Confirm cancellation
        await page.click('[data-testid="confirm-cancel-button"]');
        
        // Should show success message
        await helpers.waitForElement('[data-testid="cancellation-success"]');
        
        // Request status should update
        const updatedStatus = await page.textContent('[data-testid="request-status"]');
        expect(updatedStatus?.toLowerCase()).toContain('cancelled');
      }
    }
  });
});

test.describe('Service Browsing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as Explorador
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to service browser
    await page.goto('/buscar-servicio');
  });

  test('should display services list', async ({ page }) => {
    await helpers.waitForElement('[data-testid="services-list"]');
    
    // Should show services or empty state
    const serviceItems = page.locator('[data-testid="service-item"]');
    const emptyState = page.locator('[data-testid="no-services"]');
    
    const hasServices = await serviceItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasServices || hasEmptyState).toBeTruthy();
  });

  test('should filter services by category', async ({ page }) => {
    // Check for category filter
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    
    if (await categoryFilter.isVisible()) {
      // Filter by specific category
      await categoryFilter.selectOption('plomeria');
      
      // Should show only plumbing services
      await helpers.waitForPageLoad();
      
      const visibleServices = page.locator('[data-testid="service-item"]');
      const count = await visibleServices.count();
      
      if (count > 0) {
        // All visible services should be plumbing
        const firstCategory = await visibleServices.first().locator('[data-testid="service-category"]').textContent();
        expect(firstCategory?.toLowerCase()).toContain('plomería');
      }
    }
  });

  test('should filter services by location', async ({ page }) => {
    // Check for location filter
    const locationFilter = page.locator('[data-testid="location-filter"]');
    
    if (await locationFilter.isVisible()) {
      // Filter by specific location
      await locationFilter.selectOption('rawson');
      
      // Should show only services in Rawson
      await helpers.waitForPageLoad();
      
      const visibleServices = page.locator('[data-testid="service-item"]');
      const count = await visibleServices.count();
      
      if (count > 0) {
        const firstLocation = await visibleServices.first().locator('[data-testid="service-location"]').textContent();
        expect(firstLocation?.toLowerCase()).toContain('rawson');
      }
    }
  });

  test('should search services by keyword', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      await helpers.fillField('[data-testid="search-input"]', 'plomería');
      await page.click('[data-testid="search-button"]');
      
      // Should show search results
      await helpers.waitForPageLoad();
      
      const searchResults = page.locator('[data-testid="service-item"]');
      const count = await searchResults.count();
      
      if (count > 0) {
        // Results should contain search keyword
        const firstResult = await searchResults.first().locator('[data-testid="service-title"]').textContent();
        expect(firstResult?.toLowerCase()).toContain('plomería');
      }
    }
  });

  test('should view service details', async ({ page }) => {
    const firstService = page.locator('[data-testid="service-item"]').first();
    
    if (await firstService.isVisible()) {
      await firstService.click();
      
      // Should navigate to service detail page
      await expect(page).toHaveURL(/\/servicio\/\d+/);
      
      // Should show detailed view
      await helpers.waitForElement('[data-testid="service-detail"]');
      await helpers.waitForElement('[data-testid="service-description"]');
      await helpers.waitForElement('[data-testid="service-provider"]');
      await helpers.waitForElement('[data-testid="contact-provider-button"]');
    }
  });

  test('should contact service provider', async ({ page }) => {
    const firstService = page.locator('[data-testid="service-item"]').first();
    
    if (await firstService.isVisible()) {
      await firstService.click();
      
      // Click contact button
      await page.click('[data-testid="contact-provider-button"]');
      
      // Should navigate to chat or contact form
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(chat|contactar)/);
    }
  });
});