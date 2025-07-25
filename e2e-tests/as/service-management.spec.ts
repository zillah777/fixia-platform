import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('AS Service Creation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    
    // Navigate to service creation
    await page.goto('/crear-servicio');
  });

  test('should display service creation form', async ({ page }) => {
    await helpers.waitForElement('[data-testid="service-creation-form"]');
    
    // Check all required form fields
    await helpers.waitForElement('[data-testid="service-title"]');
    await helpers.waitForElement('[data-testid="service-description"]');
    await helpers.waitForElement('[data-testid="service-category"]');
    await helpers.waitForElement('[data-testid="service-price"]');
    await helpers.waitForElement('[data-testid="service-areas"]');
    await helpers.waitForElement('[data-testid="service-availability"]');
    
    // Check optional fields
    await helpers.waitForElement('[data-testid="service-images"]');
    await helpers.waitForElement('[data-testid="service-requirements"]');
    
    // Check submit button
    await helpers.waitForElement('[data-testid="create-service-button"]');
  });

  test('should create service successfully', async ({ page }) => {
    // Fill service form
    await helpers.fillField('[data-testid="service-title"]', 'Reparación de Plomería Profesional');
    await helpers.fillField('[data-testid="service-description"]', 'Servicio completo de reparación de plomería incluyendo arreglo de fugas, destapado de cañerías, instalación de grifos y reparación de inodoros. Trabajo garantizado por 6 meses.');
    
    await page.selectOption('[data-testid="service-category"]', 'plomeria');
    await helpers.fillField('[data-testid="service-price"]', '3500');
    await page.selectOption('[data-testid="service-areas"]', ['rawson', 'trelew']);
    await page.selectOption('[data-testid="service-availability"]', 'flexible');
    
    // Submit service
    await page.click('[data-testid="create-service-button"]');
    
    // Should show success message
    await helpers.waitForElement('[data-testid="service-created-success"]');
    
    // Should redirect to services list or dashboard
    await expect(page).toHaveURL(/\/(mis-servicios|dashboard)/);
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="create-service-button"]');
    
    // Should show validation errors
    await helpers.waitForElement('[data-testid="error-service-title"]');
    await helpers.waitForElement('[data-testid="error-service-description"]');
    await helpers.waitForElement('[data-testid="error-service-category"]');
    await helpers.waitForElement('[data-testid="error-service-price"]');
    
    const titleError = await page.textContent('[data-testid="error-service-title"]');
    const descriptionError = await page.textContent('[data-testid="error-service-description"]');
    
    expect(titleError).toContain('requerido');
    expect(descriptionError).toContain('requerido');
  });

  test('should validate service description length', async ({ page }) => {
    await helpers.fillField('[data-testid="service-title"]', 'Test Service');
    await helpers.fillField('[data-testid="service-description"]', 'Too short');
    await page.selectOption('[data-testid="service-category"]', 'plomeria');
    await helpers.fillField('[data-testid="service-price"]', '1000');
    
    await page.click('[data-testid="create-service-button"]');
    
    // Should show description length error
    await helpers.waitForElement('[data-testid="error-service-description"]');
    const errorText = await page.textContent('[data-testid="error-service-description"]');
    expect(errorText).toContain('mínimo');
  });

  test('should validate service price', async ({ page }) => {
    await helpers.fillField('[data-testid="service-title"]', 'Test Service');
    await helpers.fillField('[data-testid="service-description"]', 'Valid description with enough length to pass validation requirements for service creation.');
    await page.selectOption('[data-testid="service-category"]', 'plomeria');
    
    // Try invalid price
    await helpers.fillField('[data-testid="service-price"]', '-100');
    await page.click('[data-testid="create-service-button"]');
    
    // Should show price validation error
    await helpers.waitForElement('[data-testid="error-service-price"]');
    const errorText = await page.textContent('[data-testid="error-service-price"]');
    expect(errorText).toContain('válido');
  });

  test('should handle service image uploads', async ({ page }) => {
    const imageUpload = page.locator('[data-testid="service-images"]');
    
    if (await imageUpload.isVisible()) {
      // Check upload interface
      await expect(imageUpload).toBeVisible();
      
      // Should have instructions or preview area
      const uploadArea = page.locator('[data-testid="image-upload-area"]');
      const imagePreview = page.locator('[data-testid="image-preview"]');
      
      const hasUploadArea = await uploadArea.isVisible();
      const hasPreview = await imagePreview.isVisible();
      
      expect(hasUploadArea || hasPreview).toBeTruthy();
    }
  });

  test('should populate category dropdown correctly', async ({ page }) => {
    const categorySelect = page.locator('[data-testid="service-category"]');
    
    // Get all options
    const options = await categorySelect.locator('option').all();
    const optionTexts = await Promise.all(
      options.map(option => option.textContent())
    );
    
    // Should include service categories
    expect(optionTexts.some(text => text?.includes('Plomería'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Electricidad'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Limpieza'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Reparaciones'))).toBeTruthy();
    expect(optionTexts.some(text => text?.includes('Belleza'))).toBeTruthy();
  });

  test('should save draft and restore form data', async ({ page }) => {
    // Fill partial form
    await helpers.fillField('[data-testid="service-title"]', 'Draft Service');
    await helpers.fillField('[data-testid="service-description"]', 'This is a draft service description');
    
    // Navigate away
    await page.goto('/dashboard');
    
    // Return to form
    await page.goto('/crear-servicio');
    
    // Should restore draft data
    await expect(page.locator('[data-testid="service-title"]')).toHaveValue('Draft Service');
    await expect(page.locator('[data-testid="service-description"]')).toHaveValue('This is a draft service description');
  });
});

test.describe('AS Service Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    
    // Navigate to services list
    await page.goto('/mis-servicios');
  });

  test('should display services list', async ({ page }) => {
    await helpers.waitForElement('[data-testid="services-list"]');
    
    // Should show services or empty state
    const serviceItems = page.locator('[data-testid="service-item"]');
    const emptyState = page.locator('[data-testid="no-services"]');
    
    const hasServices = await serviceItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasServices || hasEmptyState).toBeTruthy();
    
    // If empty state, should have create service button
    if (hasEmptyState) {
      await helpers.waitForElement('[data-testid="create-first-service-button"]');
    }
  });

  test('should display service details correctly', async ({ page }) => {
    const serviceItems = page.locator('[data-testid="service-item"]');
    const serviceCount = await serviceItems.count();
    
    if (serviceCount > 0) {
      const firstService = serviceItems.first();
      
      // Check service structure
      await expect(firstService.locator('[data-testid="service-title"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="service-category"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="service-price"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="service-status"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="service-views"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="service-requests"]')).toBeVisible();
      
      // Check action buttons
      await expect(firstService.locator('[data-testid="edit-service-button"]')).toBeVisible();
      await expect(firstService.locator('[data-testid="toggle-status-button"]')).toBeVisible();
    }
  });

  test('should filter services by status', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      // Filter by active services
      await statusFilter.selectOption('active');
      
      await helpers.waitForPageLoad();
      
      const visibleServices = page.locator('[data-testid="service-item"]');
      const count = await visibleServices.count();
      
      if (count > 0) {
        // All visible services should have active status
        const firstStatus = await visibleServices.first().locator('[data-testid="service-status"]').textContent();
        expect(firstStatus?.toLowerCase()).toContain('activo');
      }
    }
  });

  test('should edit service', async ({ page }) => {
    const firstService = page.locator('[data-testid="service-item"]').first();
    
    if (await firstService.isVisible()) {
      await firstService.locator('[data-testid="edit-service-button"]').click();
      
      // Should navigate to edit form
      await expect(page).toHaveURL(/\/servicio\/\d+\/editar/);
      
      // Should show populated form
      await helpers.waitForElement('[data-testid="service-edit-form"]');
      
      // Form should have current values
      const titleField = page.locator('[data-testid="service-title"]');
      const title = await titleField.inputValue();
      expect(title.length).toBeGreaterThan(0);
    }
  });

  test('should toggle service status', async ({ page }) => {
    const firstService = page.locator('[data-testid="service-item"]').first();
    
    if (await firstService.isVisible()) {
      // Get current status
      const currentStatus = await firstService.locator('[data-testid="service-status"]').textContent();
      
      // Click toggle button
      await firstService.locator('[data-testid="toggle-status-button"]').click();
      
      // Should show confirmation dialog
      await helpers.waitForElement('[data-testid="status-toggle-confirmation"]');
      
      // Confirm toggle
      await page.click('[data-testid="confirm-toggle-button"]');
      
      // Should show success message
      await helpers.waitForElement('[data-testid="status-toggle-success"]');
      
      // Status should change
      await page.reload();
      const newStatus = await firstService.locator('[data-testid="service-status"]').textContent();
      expect(newStatus).not.toBe(currentStatus);
    }
  });

  test('should view service statistics', async ({ page }) => {
    const firstService = page.locator('[data-testid="service-item"]').first();
    
    if (await firstService.isVisible()) {
      await firstService.click();
      
      // Should navigate to service detail page
      await expect(page).toHaveURL(/\/servicio\/\d+/);
      
      // Should show service statistics
      await helpers.waitForElement('[data-testid="service-statistics"]');
      await helpers.waitForElement('[data-testid="total-views"]');
      await helpers.waitForElement('[data-testid="total-inquiries"]');
      await helpers.waitForElement('[data-testid="conversion-rate"]');
      
      // Statistics should have numeric values
      const views = await page.textContent('[data-testid="total-views"]');
      const inquiries = await page.textContent('[data-testid="total-inquiries"]');
      
      expect(views).toMatch(/^\d+$/);
      expect(inquiries).toMatch(/^\d+$/);
    }
  });

  test('should delete service', async ({ page }) => {
    const serviceItems = page.locator('[data-testid="service-item"]');
    const serviceCount = await serviceItems.count();
    
    if (serviceCount > 0) {
      const firstService = serviceItems.first();
      
      // Click service to view details
      await firstService.click();
      
      // Look for delete button (might be in dropdown menu)
      const deleteButton = page.locator('[data-testid="delete-service-button"]');
      const moreActionsButton = page.locator('[data-testid="more-actions-button"]');
      
      if (await moreActionsButton.isVisible()) {
        await moreActionsButton.click();
        await page.click('[data-testid="delete-service-button"]');
      } else if (await deleteButton.isVisible()) {
        await deleteButton.click();
      }
      
      // Should show confirmation dialog
      await helpers.waitForElement('[data-testid="delete-confirmation"]');
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Should show success message
      await helpers.waitForElement('[data-testid="delete-success"]');
      
      // Should redirect to services list
      await expect(page).toHaveURL(/\/mis-servicios/);
    }
  });

  test('should view service requests/inquiries', async ({ page }) => {
    const firstService = page.locator('[data-testid="service-item"]').first();
    
    if (await firstService.isVisible()) {
      // Check if service has requests
      const requestCount = await firstService.locator('[data-testid="service-requests"]').textContent();
      
      if (requestCount && requestCount !== '0') {
        await firstService.click();
        
        // Should show service inquiries
        await helpers.waitForElement('[data-testid="service-inquiries"]');
        
        const inquiryItems = page.locator('[data-testid="inquiry-item"]');
        const inquiryCount = await inquiryItems.count();
        
        if (inquiryCount > 0) {
          const firstInquiry = inquiryItems.first();
          await expect(firstInquiry.locator('[data-testid="inquiry-client"]')).toBeVisible();
          await expect(firstInquiry.locator('[data-testid="inquiry-message"]')).toBeVisible();
          await expect(firstInquiry.locator('[data-testid="inquiry-date"]')).toBeVisible();
          await expect(firstInquiry.locator('[data-testid="respond-button"]')).toBeVisible();
        }
      }
    }
  });
});

test.describe('AS Request Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    
    // Navigate to incoming requests
    await page.goto('/solicitudes');
  });

  test('should display incoming service requests', async ({ page }) => {
    await helpers.waitForElement('[data-testid="incoming-requests"]');
    
    // Should show requests or empty state
    const requestItems = page.locator('[data-testid="request-item"]');
    const emptyState = page.locator('[data-testid="no-incoming-requests"]');
    
    const hasRequests = await requestItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasRequests || hasEmptyState).toBeTruthy();
  });

  test('should display request details correctly', async ({ page }) => {
    const requestItems = page.locator('[data-testid="request-item"]');
    const requestCount = await requestItems.count();
    
    if (requestCount > 0) {
      const firstRequest = requestItems.first();
      
      // Check request structure
      await expect(firstRequest.locator('[data-testid="request-title"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-category"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-location"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-priority"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-budget"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-date"]')).toBeVisible();
      
      // Check action buttons
      await expect(firstRequest.locator('[data-testid="view-request-button"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="respond-request-button"]')).toBeVisible();
    }
  });

  test('should filter requests by category', async ({ page }) => {
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    
    if (await categoryFilter.isVisible()) {
      // Filter by specific category
      await categoryFilter.selectOption('plomeria');
      
      await helpers.waitForPageLoad();
      
      const visibleRequests = page.locator('[data-testid="request-item"]');
      const count = await visibleRequests.count();
      
      if (count > 0) {
        // All visible requests should match category
        const firstCategory = await visibleRequests.first().locator('[data-testid="request-category"]').textContent();
        expect(firstCategory?.toLowerCase()).toContain('plomería');
      }
    }
  });

  test('should view request details', async ({ page }) => {
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      await firstRequest.locator('[data-testid="view-request-button"]').click();
      
      // Should navigate to request detail page
      await expect(page).toHaveURL(/\/solicitud\/\d+/);
      
      // Should show detailed view
      await helpers.waitForElement('[data-testid="request-detail"]');
      await helpers.waitForElement('[data-testid="request-description"]');
      await helpers.waitForElement('[data-testid="request-client-info"]');
      await helpers.waitForElement('[data-testid="respond-to-request-button"]');
    }
  });

  test('should respond to service request', async ({ page }) => {
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      await firstRequest.locator('[data-testid="respond-request-button"]').click();
      
      // Should show response form
      await helpers.waitForElement('[data-testid="response-form"]');
      await helpers.waitForElement('[data-testid="response-message"]');
      await helpers.waitForElement('[data-testid="quoted-price"]');
      await helpers.waitForElement('[data-testid="estimated-duration"]');
      
      // Fill response
      await helpers.fillField('[data-testid="response-message"]', 'Puedo realizar este trabajo. Tengo experiencia en este tipo de reparaciones y puedo comenzar esta semana.');
      await helpers.fillField('[data-testid="quoted-price"]', '2500');
      await helpers.fillField('[data-testid="estimated-duration"]', '2-3 horas');
      
      // Submit response
      await page.click('[data-testid="submit-response-button"]');
      
      // Should show success message
      await helpers.waitForElement('[data-testid="response-sent-success"]');
      
      // Should update request status or list
      await page.goto('/solicitudes');
      // Request should show as responded
    }
  });

  test('should validate response form', async ({ page }) => {
    const firstRequest = page.locator('[data-testid="request-item"]').first();
    
    if (await firstRequest.isVisible()) {
      await firstRequest.locator('[data-testid="respond-request-button"]').click();
      
      // Try to submit empty response
      await page.click('[data-testid="submit-response-button"]');
      
      // Should show validation errors
      await helpers.waitForElement('[data-testid="error-response-message"]');
      await helpers.waitForElement('[data-testid="error-quoted-price"]');
      
      const messageError = await page.textContent('[data-testid="error-response-message"]');
      expect(messageError).toContain('requerido');
    }
  });
});