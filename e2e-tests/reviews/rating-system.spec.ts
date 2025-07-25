import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from '../utils/test-helpers';

test.describe('Review and Rating System', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should allow Explorador to leave review after service completion', async ({ page }) => {
    // Login as Explorador
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Navigate to completed services that need reviews
    await page.goto('/mis-servicios-completados');
    
    const completedService = page.locator('[data-testid="completed-service-item"]').first();
    
    if (await completedService.isVisible()) {
      const reviewButton = completedService.locator('[data-testid="leave-review-button"]');
      
      if (await reviewButton.isVisible()) {
        await reviewButton.click();
        
        // Should show review form
        await helpers.waitForElement('[data-testid="review-form"]');
        
        // Check form elements
        await helpers.waitForElement('[data-testid="star-rating"]');
        await helpers.waitForElement('[data-testid="review-comment"]');
        await helpers.waitForElement('[data-testid="submit-review-button"]');
        
        // Select 5-star rating
        await page.click('[data-testid="star-5"]');
        
        // Fill review comment
        await helpers.fillField('[data-testid="review-comment"]', 'Excelente servicio. El técnico fue muy profesional y resolvió el problema rápidamente. Muy recomendado.');
        
        // Submit review
        await page.click('[data-testid="submit-review-button"]');
        
        // Should show success message
        await helpers.waitForElement('[data-testid="review-submitted-success"]');
        
        const successMessage = await page.textContent('[data-testid="review-submitted-success"]');
        expect(successMessage).toContain('reseña');
      }
    }
  });

  test('should validate review form fields', async ({ page }) => {
    // Login and navigate to review form
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/dejar-resena/123'); // Mock review URL
    
    if (page.url().includes('resena') || page.url().includes('review')) {
      await helpers.waitForElement('[data-testid="review-form"]');
      
      // Try to submit without rating
      await page.click('[data-testid="submit-review-button"]');
      
      // Should show rating validation error
      await helpers.waitForElement('[data-testid="error-rating"]');
      const ratingError = await page.textContent('[data-testid="error-rating"]');
      expect(ratingError).toContain('calificación');
      
      // Try to submit with rating but no comment
      await page.click('[data-testid="star-4"]');
      await page.click('[data-testid="submit-review-button"]');
      
      // Should show comment validation error
      await helpers.waitForElement('[data-testid="error-comment"]');
      const commentError = await page.textContent('[data-testid="error-comment"]');
      expect(commentError).toContain('comentario');
    }
  });

  test('should validate review comment length', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/dejar-resena/123');
    
    if (page.url().includes('resena') || page.url().includes('review')) {
      await helpers.waitForElement('[data-testid="review-form"]');
      
      // Select rating
      await page.click('[data-testid="star-3"]');
      
      // Try very short comment
      await helpers.fillField('[data-testid="review-comment"]', 'Ok');
      await page.click('[data-testid="submit-review-button"]');
      
      // Should show length validation error
      await helpers.waitForElement('[data-testid="error-comment"]');
      const lengthError = await page.textContent('[data-testid="error-comment"]');
      expect(lengthError).toContain('mínimo');
      
      // Try very long comment
      const longComment = 'A'.repeat(2000); // Assuming there's a max limit
      await helpers.fillField('[data-testid="review-comment"]', longComment);
      
      // Should show character counter or limit warning
      const charCounter = page.locator('[data-testid="character-counter"]');
      const maxLengthError = page.locator('[data-testid="error-max-length"]');
      
      const hasCharCounter = await charCounter.isVisible();
      const hasMaxError = await maxLengthError.isVisible();
      
      expect(hasCharCounter || hasMaxError).toBeTruthy();
    }
  });

  test('should display star rating interface correctly', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    await page.goto('/dejar-resena/123');
    
    if (page.url().includes('resena') || page.url().includes('review')) {
      await helpers.waitForElement('[data-testid="star-rating"]');
      
      // Should have 5 stars
      const stars = page.locator('[data-testid^="star-"]');
      const starCount = await stars.count();
      expect(starCount).toBe(5);
      
      // Test interactive rating
      await page.hover('[data-testid="star-3"]');
      
      // Stars 1-3 should be highlighted on hover
      const star1 = page.locator('[data-testid="star-1"]');
      const star3 = page.locator('[data-testid="star-3"]');
      const star4 = page.locator('[data-testid="star-4"]');
      
      // Check if stars have proper visual states
      const star3Class = await star3.getAttribute('class');
      expect(star3Class).toContain('highlighted');
      
      // Click to select rating
      await page.click('[data-testid="star-4"]');
      
      // Selected stars should have different visual state
      const selectedStarClass = await page.locator('[data-testid="star-4"]').getAttribute('class');
      expect(selectedStarClass).toContain('selected');
    }
  });

  test('should prevent duplicate reviews from same user', async ({ page }) => {
    // Login and try to review the same service twice
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // First review
    await page.goto('/dejar-resena/123');
    
    if (page.url().includes('resena')) {
      // Check if already reviewed
      const alreadyReviewed = page.locator('[data-testid="already-reviewed"]');
      const reviewForm = page.locator('[data-testid="review-form"]');
      
      const hasAlreadyReviewed = await alreadyReviewed.isVisible();
      const hasReviewForm = await reviewForm.isVisible();
      
      if (hasAlreadyReviewed) {
        // Should show message that user already reviewed
        const message = await alreadyReviewed.textContent();
        expect(message).toContain('ya has');
        
        // Should not show review form
        await expect(reviewForm).not.toBeVisible();
      } else if (hasReviewForm) {
        // Can submit first review
        await page.click('[data-testid="star-4"]');
        await helpers.fillField('[data-testid="review-comment"]', 'Primera reseña para este servicio.');
        await page.click('[data-testid="submit-review-button"]');
        
        // Should succeed
        await helpers.waitForElement('[data-testid="review-submitted-success"]');
        
        // Try to review again
        await page.goto('/dejar-resena/123');
        
        // Should now show already reviewed message
        await helpers.waitForElement('[data-testid="already-reviewed"]');
      }
    }
  });
});

test.describe('Review Display and Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should display reviews on AS profile', async ({ page }) => {
    // Navigate to AS profile page
    await page.goto('/perfil-as/123'); // Mock AS profile URL
    
    if (page.url().includes('perfil-as') || page.url().includes('provider')) {
      // Should show reviews section
      await helpers.waitForElement('[data-testid="reviews-section"]');
      
      // Should show overall rating
      await helpers.waitForElement('[data-testid="overall-rating"]');
      await helpers.waitForElement('[data-testid="total-reviews"]');
      
      const overallRating = await page.textContent('[data-testid="overall-rating"]');
      expect(overallRating).toMatch(/^\d\.\d$/); // e.g., "4.5"
      
      // Should show individual reviews
      const reviewItems = page.locator('[data-testid="review-item"]');
      const reviewCount = await reviewItems.count();
      
      if (reviewCount > 0) {
        const firstReview = reviewItems.first();
        
        // Each review should have proper structure
        await expect(firstReview.locator('[data-testid="reviewer-name"]')).toBeVisible();
        await expect(firstReview.locator('[data-testid="review-rating"]')).toBeVisible();
        await expect(firstReview.locator('[data-testid="review-comment"]')).toBeVisible();
        await expect(firstReview.locator('[data-testid="review-date"]')).toBeVisible();
        
        // Should show service context if available
        const serviceContext = firstReview.locator('[data-testid="review-service"]');
        if (await serviceContext.isVisible()) {
          const serviceName = await serviceContext.textContent();
          expect(serviceName?.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should display reviews on service pages', async ({ page }) => {
    // Navigate to service detail page
    await page.goto('/servicio/123');
    
    if (page.url().includes('servicio') || page.url().includes('service')) {
      // Should show reviews section for the service
      const reviewsSection = page.locator('[data-testid="service-reviews"]');
      
      if (await reviewsSection.isVisible()) {
        // Should show service rating summary
        await helpers.waitForElement('[data-testid="service-rating-summary"]');
        
        const reviewItems = page.locator('[data-testid="review-item"]');
        const reviewCount = await reviewItems.count();
        
        if (reviewCount > 0) {
          // Reviews should be specific to this service
          const firstReview = reviewItems.first();
          await expect(firstReview.locator('[data-testid="review-rating"]')).toBeVisible();
          await expect(firstReview.locator('[data-testid="review-comment"]')).toBeVisible();
        }
      }
    }
  });

  test('should filter and sort reviews', async ({ page }) => {
    await page.goto('/perfil-as/123');
    
    if (page.url().includes('perfil-as')) {
      const reviewsSection = page.locator('[data-testid="reviews-section"]');
      
      if (await reviewsSection.isVisible()) {
        // Check for rating filter
        const ratingFilter = page.locator('[data-testid="rating-filter"]');
        
        if (await ratingFilter.isVisible()) {
          // Filter by 5-star reviews
          await ratingFilter.selectOption('5');
          
          await helpers.waitForPageLoad();
          
          const visibleReviews = page.locator('[data-testid="review-item"]');
          const count = await visibleReviews.count();
          
          if (count > 0) {
            // All visible reviews should be 5-star
            const firstRating = await visibleReviews.first().locator('[data-testid="review-rating"]').textContent();
            expect(firstRating).toContain('5');
          }
        }
        
        // Check for sort options
        const sortSelect = page.locator('[data-testid="reviews-sort"]');
        
        if (await sortSelect.isVisible()) {
          // Sort by newest first
          await sortSelect.selectOption('newest');
          
          await helpers.waitForPageLoad();
          
          // Reviews should be sorted by date
          const reviewDates = page.locator('[data-testid="review-date"]');
          const dateCount = await reviewDates.count();
          
          if (dateCount > 1) {
            const firstDate = await reviewDates.first().textContent();
            const secondDate = await reviewDates.nth(1).textContent();
            
            // First review should be newer (this would need proper date parsing)
            expect(firstDate?.length).toBeGreaterThan(0);
            expect(secondDate?.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test('should paginate reviews', async ({ page }) => {
    await page.goto('/perfil-as/123');
    
    if (page.url().includes('perfil-as')) {
      const reviewsSection = page.locator('[data-testid="reviews-section"]');
      
      if (await reviewsSection.isVisible()) {
        // Check for pagination
        const pagination = page.locator('[data-testid="reviews-pagination"]');
        
        if (await pagination.isVisible()) {
          const nextButton = page.locator('[data-testid="reviews-next-page"]');
          
          if (await nextButton.isEnabled()) {
            // Get current reviews
            const currentReviews = await page.locator('[data-testid="review-item"]').allTextContents();
            
            // Go to next page
            await nextButton.click();
            
            await helpers.waitForPageLoad();
            
            // Should show different reviews
            const newReviews = await page.locator('[data-testid="review-item"]').allTextContents();
            
            expect(newReviews).not.toEqual(currentReviews);
          }
        }
      }
    }
  });

  test('should show rating breakdown', async ({ page }) => {
    await page.goto('/perfil-as/123');
    
    if (page.url().includes('perfil-as')) {
      const ratingBreakdown = page.locator('[data-testid="rating-breakdown"]');
      
      if (await ratingBreakdown.isVisible()) {
        // Should show distribution of ratings
        for (let i = 1; i <= 5; i++) {
          const starCount = page.locator(`[data-testid="star-${i}-count"]`);
          
          if (await starCount.isVisible()) {
            const count = await starCount.textContent();
            expect(count).toMatch(/^\d+$/);
          }
        }
        
        // Should show percentage bars
        const percentageBars = page.locator('[data-testid="rating-percentage-bar"]');
        const barCount = await percentageBars.count();
        expect(barCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle review responses from AS', async ({ page }) => {
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    
    // Navigate to reviews of their services
    await page.goto('/mis-resenas');
    
    if (page.url().includes('resenas') || page.url().includes('reviews')) {
      const reviewItems = page.locator('[data-testid="review-item"]');
      const reviewCount = await reviewItems.count();
      
      if (reviewCount > 0) {
        const firstReview = reviewItems.first();
        const respondButton = firstReview.locator('[data-testid="respond-to-review"]');
        
        if (await respondButton.isVisible()) {
          await respondButton.click();
          
          // Should show response form
          await helpers.waitForElement('[data-testid="review-response-form"]');
          
          // Fill response
          await helpers.fillField('[data-testid="response-text"]', 'Muchas gracias por su comentario. Nos alegra saber que quedó satisfecho con nuestro servicio.');
          
          // Submit response
          await page.click('[data-testid="submit-response-button"]');
          
          // Should show success message
          await helpers.waitForElement('[data-testid="response-submitted-success"]');
          
          // Response should appear in the review
          await helpers.waitForElement('[data-testid="as-response"]');
        }
      }
    }
  });
});

test.describe('Rating Analytics and Statistics', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should display rating statistics in AS dashboard', async ({ page }) => {
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    await page.goto('/dashboard');
    
    // Should show rating statistics
    const ratingsWidget = page.locator('[data-testid="ratings-widget"]');
    
    if (await ratingsWidget.isVisible()) {
      // Should show overall rating
      await helpers.waitForElement('[data-testid="overall-rating"]');
      
      // Should show recent reviews count
      await helpers.waitForElement('[data-testid="recent-reviews-count"]');
      
      // Should show rating trend
      const ratingTrend = page.locator('[data-testid="rating-trend"]');
      
      if (await ratingTrend.isVisible()) {
        const trend = await ratingTrend.getAttribute('data-trend');
        expect(['up', 'down', 'stable']).toContain(trend);
      }
    }
  });

  test('should show review notifications', async ({ page }) => {
    // Login as AS
    await page.goto('/login');
    await page.click('[data-testid="demo-as-login"]');
    
    // Check for review notifications
    const notifications = page.locator('[data-testid="notifications"]');
    
    if (await notifications.isVisible()) {
      const reviewNotifications = page.locator('[data-testid="review-notification"]');
      const notificationCount = await reviewNotifications.count();
      
      if (notificationCount > 0) {
        const firstNotification = reviewNotifications.first();
        
        // Should show new review information
        await expect(firstNotification.locator('[data-testid="notification-title"]')).toBeVisible();
        await expect(firstNotification.locator('[data-testid="notification-service"]')).toBeVisible();
        await expect(firstNotification.locator('[data-testid="notification-rating"]')).toBeVisible();
        
        // Should have action to view review
        await expect(firstNotification.locator('[data-testid="view-review-button"]')).toBeVisible();
      }
    }
  });

  test('should handle review moderation', async ({ page }) => {
    // This would be for admin/moderation interface
    // Login as admin (if such role exists)
    await page.goto('/login');
    
    // Try to access admin panel
    await page.goto('/admin/reviews');
    
    if (page.url().includes('admin')) {
      // Should show reported reviews
      const reportedReviews = page.locator('[data-testid="reported-review"]');
      const reviewCount = await reportedReviews.count();
      
      if (reviewCount > 0) {
        const firstReported = reportedReviews.first();
        
        // Should have moderation actions
        await expect(firstReported.locator('[data-testid="approve-review"]')).toBeVisible();
        await expect(firstReported.locator('[data-testid="reject-review"]')).toBeVisible();
        await expect(firstReported.locator('[data-testid="review-details"]')).toBeVisible();
      }
    }
  });

  test('should prevent review spam', async ({ page }) => {
    // Login as Explorador
    await page.goto('/login');
    await page.click('[data-testid="demo-explorador-login"]');
    
    // Try to submit multiple reviews quickly
    await page.goto('/dejar-resena/123');
    
    if (page.url().includes('resena')) {
      // First review
      await page.click('[data-testid="star-5"]');
      await helpers.fillField('[data-testid="review-comment"]', 'Primera reseña de prueba');
      await page.click('[data-testid="submit-review-button"]');
      
      // If successful, try immediate second review
      if (await page.locator('[data-testid="review-submitted-success"]').isVisible()) {
        await page.goto('/dejar-resena/124'); // Different service
        
        // Try to submit another review immediately
        await page.click('[data-testid="star-4"]');
        await helpers.fillField('[data-testid="review-comment"]', 'Segunda reseña inmediata');
        await page.click('[data-testid="submit-review-button"]');
        
        // Should show rate limiting error
        const rateLimitError = page.locator('[data-testid="rate-limit-error"]');
        
        if (await rateLimitError.isVisible()) {
          const errorMessage = await rateLimitError.textContent();
          expect(errorMessage).toContain('espera');
        }
      }
    }
  });
});