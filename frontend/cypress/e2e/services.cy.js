describe('Services Management', () => {
  let testUser;
  
  beforeEach(() => {
    cy.cleanTestData();
    
    // Create and login test user
    cy.createTestUser({
      email: 'service-provider@example.com',
      password: 'password123',
      user_type: 'provider'
    }).then((response) => {
      testUser = response.user;
      cy.login(testUser.email, 'password123');
    });
  });

  describe('Service Creation', () => {
    it('should create a new service successfully', () => {
      cy.visit('/services/new');
      
      // Fill service form
      cy.get('[data-testid="service-title"]').type('Professional Cleaning Service');
      cy.get('[data-testid="service-description"]').type('Complete house cleaning with professional equipment and eco-friendly products');
      cy.get('[data-testid="service-category"]').select('Limpieza');
      cy.get('[data-testid="service-price"]').type('150');
      cy.get('[data-testid="service-duration"]').type('120');
      cy.get('[data-testid="service-location"]').type('Rawson, Chubut');
      
      // Add requirements
      cy.get('[data-testid="service-requirements"]').type('Access to water and electricity required');
      
      // Upload service image (if image upload is implemented)
      // cy.get('[data-testid="service-image-upload"]').selectFile('cypress/fixtures/service-image.jpg');
      
      // Submit form
      cy.get('[data-testid="create-service-button"]').click();
      
      // Should show success message
      cy.checkToast('Servicio creado exitosamente', 'success');
      
      // Should redirect to services list or service detail
      cy.url().should('not.include', '/new');
    });

    it('should show validation errors for incomplete form', () => {
      cy.visit('/services/new');
      
      // Try to submit empty form
      cy.get('[data-testid="create-service-button"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="title-error"]').should('be.visible');
      cy.get('[data-testid="description-error"]').should('be.visible');
      cy.get('[data-testid="category-error"]').should('be.visible');
      cy.get('[data-testid="price-error"]').should('be.visible');
    });

    it('should validate price input', () => {
      cy.visit('/services/new');
      
      // Test negative price
      cy.get('[data-testid="service-price"]').type('-50');
      cy.get('[data-testid="create-service-button"]').click();
      
      cy.get('[data-testid="price-error"]')
        .should('be.visible')
        .and('contain.text', 'mayor a 0');
      
      // Test invalid price format
      cy.get('[data-testid="service-price"]').clear().type('abc');
      cy.get('[data-testid="create-service-button"]').click();
      
      cy.get('[data-testid="price-error"]')
        .should('be.visible')
        .and('contain.text', 'número válido');
    });

    it('should validate service title length', () => {
      cy.visit('/services/new');
      
      // Test title too short
      cy.get('[data-testid="service-title"]').type('ab');
      cy.get('[data-testid="create-service-button"]').click();
      
      cy.get('[data-testid="title-error"]')
        .should('be.visible')
        .and('contain.text', 'al menos 3 caracteres');
      
      // Test title too long
      const longTitle = 'a'.repeat(201);
      cy.get('[data-testid="service-title"]').clear().type(longTitle);
      cy.get('[data-testid="create-service-button"]').click();
      
      cy.get('[data-testid="title-error"]')
        .should('be.visible')
        .and('contain.text', 'máximo 200 caracteres');
    });
  });

  describe('Services Listing', () => {
    it('should display services list', () => {
      cy.visit('/services');
      
      // Should show services grid/list
      cy.get('[data-testid="services-list"]').should('be.visible');
      
      // Should show search and filters
      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="category-filter"]').should('be.visible');
      cy.get('[data-testid="price-filter"]').should('be.visible');
    });

    it('should search services by title', () => {
      cy.visit('/services');
      
      // Search for specific service
      cy.get('[data-testid="search-input"]').type('cleaning');
      cy.get('[data-testid="search-button"]').click();
      
      // Should filter results
      cy.get('[data-testid="service-card"]').should('contain.text', 'cleaning');
    });

    it('should filter services by category', () => {
      cy.visit('/services');
      
      // Select category filter
      cy.get('[data-testid="category-filter"]').select('Limpieza');
      
      // Should show only services in that category
      cy.get('[data-testid="service-card"]').each(($card) => {
        cy.wrap($card).should('contain.text', 'Limpieza');
      });
    });

    it('should filter services by price range', () => {
      cy.visit('/services');
      
      // Set price range
      cy.get('[data-testid="min-price-input"]').type('100');
      cy.get('[data-testid="max-price-input"]').type('200');
      cy.get('[data-testid="apply-filters-button"]').click();
      
      // Should show services within price range
      cy.get('[data-testid="service-price"]').each(($price) => {
        const price = parseFloat($price.text().replace(/[^0-9.]/g, ''));
        expect(price).to.be.at.least(100);
        expect(price).to.be.at.most(200);
      });
    });

    it('should show service details when clicking on service card', () => {
      cy.visit('/services');
      
      // Click on first service card
      cy.get('[data-testid="service-card"]').first().click();
      
      // Should navigate to service detail page
      cy.url().should('include', '/services/');
      cy.get('[data-testid="service-detail"]').should('be.visible');
    });
  });

  describe('Service Detail Page', () => {
    it('should display service information', () => {
      // Assume we have a service with ID 1
      cy.visit('/services/1');
      
      // Should show service details
      cy.get('[data-testid="service-title"]').should('be.visible');
      cy.get('[data-testid="service-description"]').should('be.visible');
      cy.get('[data-testid="service-price"]').should('be.visible');
      cy.get('[data-testid="service-category"]').should('be.visible');
      cy.get('[data-testid="service-provider"]').should('be.visible');
      
      // Should show booking button for non-owners
      cy.get('[data-testid="book-service-button"]').should('be.visible');
    });

    it('should show edit options for service owner', () => {
      // Create a service first, then visit its detail page
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/services`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('fixia_token')}`
        },
        body: {
          title: 'My Test Service',
          description: 'Test service description',
          price: 100,
          category: 'Limpieza',
          duration: 60,
          location: 'Test Location'
        }
      }).then((response) => {
        const serviceId = response.body.service.id;
        cy.visit(`/services/${serviceId}`);
        
        // Should show edit and delete options for owner
        cy.get('[data-testid="edit-service-button"]').should('be.visible');
        cy.get('[data-testid="delete-service-button"]').should('be.visible');
        
        // Should not show booking button for owner
        cy.get('[data-testid="book-service-button"]').should('not.exist');
      });
    });

    it('should allow service booking', () => {
      // Create another user as service provider
      cy.createTestUser({
        email: 'other-provider@example.com',
        password: 'password123',
        user_type: 'provider'
      }).then(() => {
        // Login as regular user (explorer)
        cy.createTestUser({
          email: 'explorer@example.com',
          password: 'password123',
          user_type: 'explorer'
        }).then(() => {
          cy.login('explorer@example.com', 'password123');
          
          // Visit service detail page
          cy.visit('/services/1');
          
          // Click book service button
          cy.get('[data-testid="book-service-button"]').click();
          
          // Should open booking modal or navigate to booking page
          cy.get('[data-testid="booking-form"]').should('be.visible');
          
          // Fill booking form
          cy.get('[data-testid="booking-date"]').type('2024-12-31');
          cy.get('[data-testid="booking-time"]').type('14:00');
          cy.get('[data-testid="booking-notes"]').type('Please bring all necessary equipment');
          
          // Submit booking
          cy.get('[data-testid="confirm-booking-button"]').click();
          
          cy.checkToast('Reserva creada exitosamente', 'success');
        });
      });
    });
  });

  describe('My Services Management', () => {
    it('should display user\'s services', () => {
      cy.visit('/dashboard/services');
      
      // Should show user's services
      cy.get('[data-testid="my-services-list"]').should('be.visible');
      cy.get('[data-testid="create-service-button"]').should('be.visible');
    });

    it('should allow editing service', () => {
      // Create a service first
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/services`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('fixia_token')}`
        },
        body: {
          title: 'Original Service',
          description: 'Original description',
          price: 100,
          category: 'Limpieza',
          duration: 60,
          location: 'Original Location'
        }
      }).then((response) => {
        const serviceId = response.body.service.id;
        
        cy.visit('/dashboard/services');
        
        // Click edit button
        cy.get(`[data-testid="edit-service-${serviceId}"]`).click();
        
        // Should navigate to edit form
        cy.url().should('include', `/services/${serviceId}/edit`);
        
        // Update service details
        cy.get('[data-testid="service-title"]').clear().type('Updated Service Title');
        cy.get('[data-testid="service-price"]').clear().type('150');
        
        // Save changes
        cy.get('[data-testid="update-service-button"]').click();
        
        cy.checkToast('Servicio actualizado exitosamente', 'success');
      });
    });

    it('should allow deleting service', () => {
      // Create a service first
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/services`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('fixia_token')}`
        },
        body: {
          title: 'Service to Delete',
          description: 'This service will be deleted',
          price: 100,
          category: 'Limpieza',
          duration: 60,
          location: 'Test Location'
        }
      }).then((response) => {
        const serviceId = response.body.service.id;
        
        cy.visit('/dashboard/services');
        
        // Click delete button
        cy.get(`[data-testid="delete-service-${serviceId}"]`).click();
        
        // Should show confirmation dialog
        cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
        
        // Confirm deletion
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.checkToast('Servicio eliminado exitosamente', 'success');
        
        // Service should be removed from list
        cy.get(`[data-testid="service-${serviceId}"]`).should('not.exist');
      });
    });
  });
});