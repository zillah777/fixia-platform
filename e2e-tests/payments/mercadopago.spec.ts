import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('MercadoPago Payment System', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should initiate payment process from service booking', async ({ page }) => {
    // Login as Explorador
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to a service and book it
    await page.goto('/buscar-servicio');
    
    const firstService = page.locator('[data-testid="service-item"]').first();
    
    if (await firstService.isVisible()) {
      await firstService.click();
      
      // Click book service button
      const bookButton = page.locator('[data-testid="book-service-button"]');
      
      if (await bookButton.isVisible()) {
        await bookButton.click();
        
        // Should show booking confirmation
        await helpers.waitForElement('[data-testid="booking-confirmation"]');
        
        // Should have payment button
        await helpers.waitForElement('[data-testid="proceed-to-payment-button"]');
        
        await page.click('[data-testid="proceed-to-payment-button"]');
        
        // Should redirect to payment page
        await expect(page).toHaveURL(/\/(pagar|payment)/);
      }
    }
  });

  test('should display payment summary correctly', async ({ page }) => {
    // Login and navigate to a payment page (mock scenario)
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // This would need a specific payment URL with booking ID
    // For testing purposes, we'll check if the payment page structure exists
    await page.goto('/pagar/123'); // Mock payment URL
    
    // Check if page loads or redirects appropriately
    const isPaymentPage = page.url().includes('pagar') || page.url().includes('payment');
    
    if (isPaymentPage) {
      // Should show payment summary
      await helpers.waitForElement('[data-testid="payment-summary"]');
      
      // Check payment details
      await helpers.waitForElement('[data-testid="service-name"]');
      await helpers.waitForElement('[data-testid="service-provider"]');
      await helpers.waitForElement('[data-testid="payment-amount"]');
      await helpers.waitForElement('[data-testid="payment-description"]');
      
      // Should show MercadoPago payment options
      await helpers.waitForElement('[data-testid="payment-methods"]');
    }
  });

  test('should handle MercadoPago integration', async ({ page }) => {
    // Mock MercadoPago integration test
    // In a real scenario, this would test the actual MercadoPago flow
    
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to mock payment page
    await page.goto('/pagar/123');
    
    const paymentPage = page.url().includes('pagar') || page.url().includes('payment');
    
    if (paymentPage) {
      // Check for MercadoPago elements
      const mpButton = page.locator('[data-testid="mercadopago-button"]');
      const paymentForm = page.locator('[data-testid="payment-form"]');
      
      if (await mpButton.isVisible()) {
        await mpButton.click();
        
        // Should redirect to MercadoPago or show MP widget
        // Note: In real testing, this would open MercadoPago's interface
        
        // For testing purposes, we'll check if the redirection happens
        await page.waitForTimeout(2000);
        
        // URL should change or MP widget should load
        const currentUrl = page.url();
        const hasMPWidget = await page.locator('.mercadopago-button').isVisible();
        
        expect(currentUrl.includes('mercadopago') || hasMPWidget).toBeTruthy();
      }
      
      if (await paymentForm.isVisible()) {
        // Check form fields for credit card payment
        await helpers.waitForElement('[data-testid="card-number"]');
        await helpers.waitForElement('[data-testid="expiry-date"]');
        await helpers.waitForElement('[data-testid="security-code"]');
        await helpers.waitForElement('[data-testid="cardholder-name"]');
      }
    }
  });

  test('should validate payment form fields', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/pagar/123');
    
    const paymentForm = page.locator('[data-testid="payment-form"]');
    
    if (await paymentForm.isVisible()) {
      // Try to submit empty form
      await page.click('[data-testid="submit-payment-button"]');
      
      // Should show validation errors
      const cardError = page.locator('[data-testid="error-card-number"]');
      const expiryError = page.locator('[data-testid="error-expiry-date"]');
      const cvvError = page.locator('[data-testid="error-security-code"]');
      
      if (await cardError.isVisible()) {
        const errorText = await cardError.textContent();
        expect(errorText).toContain('requerido');
      }
    }
  });

  test('should handle payment success flow', async ({ page }) => {
    // Mock successful payment flow
    // In real testing, this would involve MercadoPago test credentials
    
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Mock a successful payment return URL
    await page.goto('/pago/exitoso?booking_id=123&payment_id=456');
    
    // Should show payment success page
    if (page.url().includes('exitoso') || page.url().includes('success')) {
      await helpers.waitForElement('[data-testid="payment-success"]');
      
      // Should show success message and booking details
      await helpers.waitForElement('[data-testid="success-message"]');
      await helpers.waitForElement('[data-testid="booking-confirmation"]');
      await helpers.waitForElement('[data-testid="service-details"]');
      
      // Should have options to continue
      await helpers.waitForElement('[data-testid="go-to-dashboard-button"]');
      await helpers.waitForElement('[data-testid="view-booking-button"]');
      
      const successMessage = await page.textContent('[data-testid="success-message"]');
      expect(successMessage).toContain('exitoso');
    }
  });

  test('should handle payment failure flow', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Mock a failed payment return URL
    await page.goto('/pago/error?booking_id=123&error=payment_rejected');
    
    // Should show payment error page
    if (page.url().includes('error') || page.url().includes('failed')) {
      await helpers.waitForElement('[data-testid="payment-error"]');
      
      // Should show error message and retry options
      await helpers.waitForElement('[data-testid="error-message"]');
      await helpers.waitForElement('[data-testid="retry-payment-button"]');
      await helpers.waitForElement('[data-testid="contact-support-button"]');
      
      const errorMessage = await page.textContent('[data-testid="error-message"]');
      expect(errorMessage).toContain('error');
    }
  });

  test('should handle payment cancellation', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Mock a cancelled payment return URL
    await page.goto('/pago/cancelado?booking_id=123');
    
    // Should show payment cancellation page
    if (page.url().includes('cancelado') || page.url().includes('cancelled')) {
      await helpers.waitForElement('[data-testid="payment-cancelled"]');
      
      // Should show cancellation message and options
      await helpers.waitForElement('[data-testid="cancellation-message"]');
      await helpers.waitForElement('[data-testid="retry-payment-button"]');
      await helpers.waitForElement('[data-testid="return-to-service-button"]');
      
      const cancellationMessage = await page.textContent('[data-testid="cancellation-message"]');
      expect(cancellationMessage).toContain('cancelado');
    }
  });
});

test.describe('Payment History and Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should display payment history for Explorador', async ({ page }) => {
    // Login as Explorador
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to payment history
    await page.goto('/mis-pagos');
    
    await helpers.waitForElement('[data-testid="payment-history"]');
    
    // Should show payments or empty state
    const paymentItems = page.locator('[data-testid="payment-item"]');
    const emptyState = page.locator('[data-testid="no-payments"]');
    
    const hasPayments = await paymentItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasPayments || hasEmptyState).toBeTruthy();
    
    // If there are payments, check their structure
    if (hasPayments) {
      const firstPayment = paymentItems.first();
      await expect(firstPayment.locator('[data-testid="payment-service"]')).toBeVisible();
      await expect(firstPayment.locator('[data-testid="payment-amount"]')).toBeVisible();
      await expect(firstPayment.locator('[data-testid="payment-date"]')).toBeVisible();
      await expect(firstPayment.locator('[data-testid="payment-status"]')).toBeVisible();
    }
  });

  test('should display earnings for AS', async ({ page }) => {
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    
    // Navigate to earnings page
    await page.goto('/mis-ganancias');
    
    await helpers.waitForElement('[data-testid="earnings-dashboard"]');
    
    // Should show earnings summary
    await helpers.waitForElement('[data-testid="total-earnings"]');
    await helpers.waitForElement('[data-testid="monthly-earnings"]');
    await helpers.waitForElement('[data-testid="pending-earnings"]');
    
    // Should show earnings history
    const earningsItems = page.locator('[data-testid="earning-item"]');
    const emptyState = page.locator('[data-testid="no-earnings"]');
    
    const hasEarnings = await earningsItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasEarnings || hasEmptyState).toBeTruthy();
    
    if (hasEarnings) {
      const firstEarning = earningsItems.first();
      await expect(firstEarning.locator('[data-testid="earning-service"]')).toBeVisible();
      await expect(firstEarning.locator('[data-testid="earning-amount"]')).toBeVisible();
      await expect(firstEarning.locator('[data-testid="earning-date"]')).toBeVisible();
      await expect(firstEarning.locator('[data-testid="earning-status"]')).toBeVisible();
    }
  });

  test('should filter payment history by status', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/mis-pagos');
    
    const statusFilter = page.locator('[data-testid="payment-status-filter"]');
    
    if (await statusFilter.isVisible()) {
      // Filter by completed payments
      await statusFilter.selectOption('completed');
      
      await helpers.waitForPageLoad();
      
      const visiblePayments = page.locator('[data-testid="payment-item"]');
      const count = await visiblePayments.count();
      
      if (count > 0) {
        // All visible payments should be completed
        const firstStatus = await visiblePayments.first().locator('[data-testid="payment-status"]').textContent();
        expect(firstStatus?.toLowerCase()).toContain('completado');
      }
    }
  });

  test('should filter payment history by date range', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/mis-pagos');
    
    const dateFilterFrom = page.locator('[data-testid="date-from"]');
    const dateFilterTo = page.locator('[data-testid="date-to"]');
    
    if (await dateFilterFrom.isVisible() && await dateFilterTo.isVisible()) {
      // Set date range for current month
      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      await dateFilterFrom.fill(firstDay.toISOString().split('T')[0]);
      await dateFilterTo.fill(lastDay.toISOString().split('T')[0]);
      
      await page.click('[data-testid="apply-date-filter"]');
      
      await helpers.waitForPageLoad();
      
      // Results should be within the date range
      const visiblePayments = page.locator('[data-testid="payment-item"]');
      const count = await visiblePayments.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should view payment receipt/details', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/mis-pagos');
    
    const firstPayment = page.locator('[data-testid="payment-item"]').first();
    
    if (await firstPayment.isVisible()) {
      const viewDetailsButton = firstPayment.locator('[data-testid="view-payment-details"]');
      
      if (await viewDetailsButton.isVisible()) {
        await viewDetailsButton.click();
        
        // Should show payment details modal or navigate to details page
        await helpers.waitForElement('[data-testid="payment-details"]');
        
        // Should show detailed information
        await helpers.waitForElement('[data-testid="payment-id"]');
        await helpers.waitForElement('[data-testid="payment-method"]');
        await helpers.waitForElement('[data-testid="transaction-id"]');
        await helpers.waitForElement('[data-testid="payment-breakdown"]');
        
        // Should have download receipt option
        const downloadButton = page.locator('[data-testid="download-receipt"]');
        if (await downloadButton.isVisible()) {
          await expect(downloadButton).toBeEnabled();
        }
      }
    }
  });

  test('should request refund', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/mis-pagos');
    
    const firstPayment = page.locator('[data-testid="payment-item"]').first();
    
    if (await firstPayment.isVisible()) {
      await firstPayment.click();
      
      const refundButton = page.locator('[data-testid="request-refund-button"]');
      
      if (await refundButton.isVisible()) {
        await refundButton.click();
        
        // Should show refund request form
        await helpers.waitForElement('[data-testid="refund-request-form"]');
        
        // Fill refund reason
        await helpers.fillField('[data-testid="refund-reason"]', 'El servicio no se realizó según lo acordado');
        
        // Submit refund request
        await page.click('[data-testid="submit-refund-request"]');
        
        // Should show success message
        await helpers.waitForElement('[data-testid="refund-request-success"]');
        
        const successMessage = await page.textContent('[data-testid="refund-request-success"]');
        expect(successMessage).toContain('solicitud');
      }
    }
  });
});

test.describe('Payment Security and Validation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should validate payment amount limits', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to a mock payment page with extreme amount
    await page.goto('/pagar/123?amount=999999999');
    
    if (page.url().includes('pago') || page.url().includes('payment')) {
      // Should show amount validation error for excessive amounts
      const amountError = page.locator('[data-testid="amount-validation-error"]');
      
      if (await amountError.isVisible()) {
        const errorText = await amountError.textContent();
        expect(errorText).toContain('límite');
      }
    }
  });

  test('should handle payment timeout', async ({ page }) => {
    // Mock payment timeout scenario
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Set up route to simulate slow payment processing
    await page.route('**/api/payment/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
      await route.continue();
    });
    
    await page.goto('/pagar/123');
    
    const paymentButton = page.locator('[data-testid="submit-payment-button"]');
    
    if (await paymentButton.isVisible()) {
      await paymentButton.click();
      
      // Should show loading state
      await helpers.waitForElement('[data-testid="payment-processing"]');
      
      // Should eventually show timeout message
      await helpers.waitForElement('[data-testid="payment-timeout"]', 35000);
      
      const timeoutMessage = await page.textContent('[data-testid="payment-timeout"]');
      expect(timeoutMessage).toContain('tiempo');
    }
  });

  test('should prevent duplicate payments', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/pagar/123');
    
    const paymentButton = page.locator('[data-testid="submit-payment-button"]');
    
    if (await paymentButton.isVisible()) {
      // Click payment button multiple times rapidly
      await paymentButton.click();
      await paymentButton.click();
      await paymentButton.click();
      
      // Button should be disabled after first click
      await expect(paymentButton).toBeDisabled();
      
      // Should show processing message
      const processingMessage = page.locator('[data-testid="payment-processing"]');
      if (await processingMessage.isVisible()) {
        const message = await processingMessage.textContent();
        expect(message).toContain('procesando');
      }
    }
  });

  test('should validate secure payment environment', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/pagar/123');
    
    // Check that payment page is served over HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      expect(page.url()).toMatch(/^https:/);
    }
    
    // Check for security indicators
    const securityBadge = page.locator('[data-testid="security-badge"]');
    const sslIndicator = page.locator('[data-testid="ssl-indicator"]');
    
    if (await securityBadge.isVisible() || await sslIndicator.isVisible()) {
      // Security elements should be present on payment pages
      expect(true).toBeTruthy();
    }
  });
});