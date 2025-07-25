import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('Explorador Dashboard', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login as Explorador before each test
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display dashboard overview with statistics', async ({ page }) => {
    // Wait for dashboard to load
    await helpers.waitForElement('[data-testid="explorador-dashboard"]');
    
    // Check for statistics cards
    await helpers.waitForElement('[data-testid="stats-active-requests"]');
    await helpers.waitForElement('[data-testid="stats-completed-services"]');
    await helpers.waitForElement('[data-testid="stats-total-spent"]');
    
    // Verify statistics have numeric values
    const activeRequests = await page.textContent('[data-testid="stats-active-requests"] .stat-value');
    const completedServices = await page.textContent('[data-testid="stats-completed-services"] .stat-value');
    const totalSpent = await page.textContent('[data-testid="stats-total-spent"] .stat-value');
    
    expect(activeRequests).toMatch(/^\d+$/);
    expect(completedServices).toMatch(/^\d+$/);
    expect(totalSpent).toMatch(/^\$?[\d,]+/);
  });

  test('should display quick action buttons', async ({ page }) => {
    // Check for quick action buttons
    await helpers.waitForElement('[data-testid="new-request-button"]');
    await helpers.waitForElement('[data-testid="browse-services-button"]');
    await helpers.waitForElement('[data-testid="view-requests-button"]');
    await helpers.waitForElement('[data-testid="edit-profile-button"]');
    
    // Verify buttons are clickable
    await expect(page.locator('[data-testid="new-request-button"]')).toBeEnabled();
    await expect(page.locator('[data-testid="browse-services-button"]')).toBeEnabled();
  });

  test('should navigate to create new request', async ({ page }) => {
    await page.click('[data-testid="new-request-button"]');
    
    // Should navigate to request creation page
    await expect(page).toHaveURL(/\/solicitar-servicio/);
    
    // Should show request form
    await helpers.waitForElement('[data-testid="service-request-form"]');
  });

  test('should navigate to browse services', async ({ page }) => {
    await page.click('[data-testid="browse-services-button"]');
    
    // Should navigate to services browser
    await expect(page).toHaveURL(/\/buscar-servicio/);
    
    // Should show services list
    await helpers.waitForElement('[data-testid="services-list"]');
  });

  test('should display recent activity feed', async ({ page }) => {
    // Check for recent activity section
    await helpers.waitForElement('[data-testid="recent-activity"]');
    
    // Should show activity items or empty state
    const activityItems = page.locator('[data-testid="activity-item"]');
    const emptyState = page.locator('[data-testid="no-activity"]');
    
    // Either should have activity items or empty state
    const hasActivity = await activityItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasActivity || hasEmptyState).toBeTruthy();
  });

  test('should display active requests section', async ({ page }) => {
    await helpers.waitForElement('[data-testid="active-requests-section"]');
    
    // Check for requests list or empty state
    const requestItems = page.locator('[data-testid="request-item"]');
    const emptyState = page.locator('[data-testid="no-active-requests"]');
    
    const hasRequests = await requestItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasRequests || hasEmptyState).toBeTruthy();
    
    // If there are requests, check they have proper structure
    if (hasRequests) {
      const firstRequest = requestItems.first();
      await expect(firstRequest.locator('[data-testid="request-title"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-status"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-date"]')).toBeVisible();
    }
  });

  test('should show navigation menu with proper user info', async ({ page }) => {
    // Check user menu
    await helpers.waitForElement('[data-testid="user-menu"]');
    
    // Click to open user menu
    await page.click('[data-testid="user-menu-button"]');
    
    // Should show user info
    await helpers.waitForElement('[data-testid="user-name"]');
    await helpers.waitForElement('[data-testid="user-type"]');
    
    // Verify user type shows as Explorador
    const userType = await page.textContent('[data-testid="user-type"]');
    expect(userType).toContain('Explorador');
    
    // Check menu options
    await helpers.waitForElement('[data-testid="menu-dashboard"]');
    await helpers.waitForElement('[data-testid="menu-profile"]');
    await helpers.waitForElement('[data-testid="menu-requests"]');
    await helpers.waitForElement('[data-testid="menu-chat"]');
    await helpers.waitForElement('[data-testid="logout-button"]');
  });

  test('should handle responsive design on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, dashboard should stack vertically
      const dashboardLayout = await page.locator('[data-testid="explorador-dashboard"]').evaluate(
        el => window.getComputedStyle(el).flexDirection
      );
      expect(dashboardLayout).toBe('column');
      
      // Mobile navigation should be present
      await helpers.waitForElement('[data-testid="mobile-nav-toggle"]');
      
      // Stats should be in mobile layout
      await helpers.waitForElement('[data-testid="mobile-stats-container"]');
    }
  });

  test('should refresh data when page reloads', async ({ page }) => {
    // Get initial stats
    const initialRequests = await page.textContent('[data-testid="stats-active-requests"] .stat-value');
    
    // Reload page
    await page.reload();
    
    // Wait for data to reload
    await helpers.waitForPageLoad();
    await helpers.waitForElement('[data-testid="stats-active-requests"]');
    
    // Stats should be loaded (same or different values, but not loading state)
    const reloadedRequests = await page.textContent('[data-testid="stats-active-requests"] .stat-value');
    expect(reloadedRequests).toMatch(/^\d+$/);
  });

  test('should handle loading states properly', async ({ page }) => {
    // Intercept API calls to delay them
    await page.route('**/api/dashboard/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Reload to trigger loading states
    await page.reload();
    
    // Should show loading indicators
    await helpers.waitForElement('[data-testid="dashboard-loading"]');
    
    // Loading should eventually complete
    await helpers.waitForElement('[data-testid="explorador-dashboard"]', 15000);
    await expect(page.locator('[data-testid="dashboard-loading"]')).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and make them fail
    await page.route('**/api/dashboard/**', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    // Reload to trigger API calls
    await page.reload();
    
    // Should show error state
    await helpers.waitForElement('[data-testid="dashboard-error"]');
    
    // Should offer retry option
    await helpers.waitForElement('[data-testid="retry-button"]');
    
    // Clicking retry should attempt to reload
    await page.click('[data-testid="retry-button"]');
    await helpers.waitForElement('[data-testid="dashboard-loading"]');
  });
});

test.describe('Explorador Profile Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Login and navigate to profile
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/perfil');
  });

  test('should display profile information', async ({ page }) => {
    await helpers.waitForElement('[data-testid="profile-form"]');
    
    // Check profile fields are present
    await helpers.waitForElement('[data-testid="profile-nombre"]');
    await helpers.waitForElement('[data-testid="profile-apellido"]');
    await helpers.waitForElement('[data-testid="profile-email"]');
    await helpers.waitForElement('[data-testid="profile-telefono"]');
    
    // Email should be disabled (can't be changed)
    await expect(page.locator('[data-testid="profile-email"]')).toBeDisabled();
  });

  test('should update profile information', async ({ page }) => {
    // Update profile fields
    await helpers.fillField('[data-testid="profile-nombre"]', 'Juan Updated');
    await helpers.fillField('[data-testid="profile-telefono"]', '+54 280 123456');
    
    // Save changes
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show success message
    await helpers.waitForElement('[data-testid="profile-update-success"]');
    
    // Reload and verify changes persisted
    await page.reload();
    await expect(page.locator('[data-testid="profile-nombre"]')).toHaveValue('Juan Updated');
    await expect(page.locator('[data-testid="profile-telefono"]')).toHaveValue('+54 280 123456');
  });

  test('should validate phone number format', async ({ page }) => {
    await helpers.fillField('[data-testid="profile-telefono"]', 'invalid-phone');
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show validation error
    await helpers.waitForElement('[data-testid="error-telefono"]');
    const errorText = await page.textContent('[data-testid="error-telefono"]');
    expect(errorText).toContain('teléfono');
  });

  test('should handle profile picture upload', async ({ page }) => {
    // Check if profile picture upload is available
    const uploadButton = page.locator('[data-testid="profile-picture-upload"]');
    
    if (await uploadButton.isVisible()) {
      // Create a test image file
      const testImagePath = 'e2e-tests/fixtures/test-avatar.jpg';
      
      // Upload image (this would need a test fixture)
      await uploadButton.setInputFiles(testImagePath);
      
      // Should show preview
      await helpers.waitForElement('[data-testid="profile-picture-preview"]');
      
      // Save profile
      await page.click('[data-testid="save-profile-button"]');
      
      // Should show success
      await helpers.waitForElement('[data-testid="profile-update-success"]');
    }
  });

  test('should navigate to password change', async ({ page }) => {
    await page.click('[data-testid="change-password-button"]');
    
    // Should show password change form
    await helpers.waitForElement('[data-testid="password-change-form"]');
    await helpers.waitForElement('[data-testid="current-password"]');
    await helpers.waitForElement('[data-testid="new-password"]');
    await helpers.waitForElement('[data-testid="confirm-new-password"]');
  });

  test('should show role switching option', async ({ page }) => {
    // Check if role switch option is available
    const switchButton = page.locator('[data-testid="switch-to-as-button"]');
    
    if (await switchButton.isVisible()) {
      await switchButton.click();
      
      // Should show confirmation dialog
      await helpers.waitForElement('[data-testid="role-switch-confirmation"]');
      
      // Should explain what switching means
      const explanation = await page.textContent('[data-testid="role-switch-explanation"]');
      expect(explanation).toContain('Anunciante de Servicios');
    }
  });
});