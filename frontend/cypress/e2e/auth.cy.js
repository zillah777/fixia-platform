describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.cleanTestData();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/register');
      
      // Fill registration form
      cy.get('[data-testid="first-name-input"]').type('John');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="email-input"]').type(`test${Date.now()}@example.com`);
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="confirm-password-input"]').type('password123');
      cy.get('[data-testid="user-type-select"]').select('provider');
      cy.get('[data-testid="phone-input"]').type('+1234567890');
      
      // Accept terms
      cy.get('[data-testid="terms-checkbox"]').check();
      
      // Submit registration
      cy.get('[data-testid="register-button"]').click();
      
      // Should show success message
      cy.checkToast('Usuario registrado exitosamente', 'success');
      
      // Should redirect to verification page or dashboard
      cy.url().should('not.include', '/register');
    });

    it('should show validation errors for invalid data', () => {
      cy.visit('/register');
      
      // Try to submit empty form
      cy.get('[data-testid="register-button"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="first-name-error"]').should('be.visible');
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('be.visible');
    });

    it('should show error for invalid email format', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="email-error"]')
        .should('be.visible')
        .and('contain.text', 'correo electrónico válido');
    });

    it('should show error for weak password', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('123');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="password-error"]')
        .should('be.visible')
        .and('contain.text', 'al menos 6 caracteres');
    });

    it('should show error for mismatched passwords', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="confirm-password-input"]').type('different123');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="confirm-password-error"]')
        .should('be.visible')
        .and('contain.text', 'contraseñas no coinciden');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user before each login test
      cy.createTestUser({
        email: 'login@example.com',
        password: 'password123',
        user_type: 'provider'
      });
    });

    it('should login with valid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="email-input"]').type('login@example.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();
      
      // Should show success message
      cy.checkToast('Inicio de sesión exitoso', 'success');
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      
      // Should show user info
      cy.get('[data-testid="user-menu"]').should('contain.text', 'Test User');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="email-input"]').type('wrong@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      
      cy.checkToast('Credenciales inválidas', 'error');
      cy.url().should('include', '/login');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('be.visible');
    });

    it('should toggle password visibility', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="password-input"]').type('password123');
      
      // Password should be hidden by default
      cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password');
      
      // Click toggle button
      cy.get('[data-testid="password-toggle"]').click();
      
      // Password should be visible
      cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'text');
      
      // Click toggle again
      cy.get('[data-testid="password-toggle"]').click();
      
      // Password should be hidden again
      cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password');
    });
  });

  describe('Password Reset', () => {
    it('should request password reset', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="forgot-password-link"]').click();
      cy.url().should('include', '/forgot-password');
      
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="reset-button"]').click();
      
      cy.checkToast('Correo de recuperación enviado', 'success');
    });

    it('should show validation error for invalid email', () => {
      cy.visit('/forgot-password');
      
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="reset-button"]').click();
      
      cy.get('[data-testid="email-error"]').should('be.visible');
    });
  });

  describe('User Logout', () => {
    it('should logout successfully', () => {
      // First login
      cy.createTestUser({
        email: 'logout@example.com',
        password: 'password123'
      }).then(() => {
        cy.login('logout@example.com', 'password123');
        cy.visit('/dashboard');
        
        // Verify user is logged in
        cy.get('[data-testid="user-menu"]').should('be.visible');
        
        // Logout
        cy.get('[data-testid="user-menu"]').click();
        cy.get('[data-testid="logout-button"]').click();
        
        // Should redirect to login
        cy.url().should('include', '/login');
        
        // Should show logout message
        cy.checkToast('Sesión cerrada exitosamente', 'success');
        
        // Should not be able to access protected pages
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected pages without auth', () => {
      const protectedRoutes = ['/dashboard', '/services/new', '/profile'];
      
      protectedRoutes.forEach((route) => {
        cy.visit(route);
        cy.url().should('include', '/login');
      });
    });

    it('should allow access to protected pages when authenticated', () => {
      cy.createTestUser({
        email: 'protected@example.com',
        password: 'password123'
      }).then(() => {
        cy.login('protected@example.com', 'password123');
        
        cy.visit('/dashboard');
        cy.url().should('include', '/dashboard');
        cy.get('[data-testid="dashboard-content"]').should('be.visible');
      });
    });
  });
});