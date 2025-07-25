import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(public page: Page) {}

  /**
   * Wait for and check that an element is visible
   */
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    return this.page.locator(selector);
  }

  /**
   * Fill a form field and verify it was filled
   */
  async fillField(selector: string, value: string) {
    await this.page.fill(selector, value);
    await expect(this.page.locator(selector)).toHaveValue(value);
  }

  /**
   * Click and wait for navigation
   */
  async clickAndNavigate(selector: string, expectedUrl?: string) {
    await this.page.click(selector);
    if (expectedUrl) {
      await this.page.waitForURL(expectedUrl);
    }
  }

  /**
   * Login helper for different user types
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.fillField('[data-testid="email"]', email);
    await this.fillField('[data-testid="password"]', password);
    await this.clickAndNavigate('[data-testid="login-button"]');
    
    // Wait for successful login (either dashboard redirect)
    await this.page.waitForURL(/\/(dashboard|perfil)/, { timeout: 10000 });
  }

  /**
   * Register helper
   */
  async register(userData: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    userType: 'explorador' | 'as';
  }) {
    await this.page.goto('/register');
    
    // Step 1: Personal info
    await this.fillField('[data-testid="nombre"]', userData.nombre);
    await this.fillField('[data-testid="apellido"]', userData.apellido);
    await this.fillField('[data-testid="email"]', userData.email);
    await this.clickAndNavigate('[data-testid="next-button"]');
    
    // Step 2: Password
    await this.fillField('[data-testid="password"]', userData.password);
    await this.fillField('[data-testid="confirm-password"]', userData.password);
    await this.clickAndNavigate('[data-testid="next-button"]');
    
    // Step 3: Account type and terms
    await this.page.click(`[data-testid="user-type-${userData.userType}"]`);
    await this.page.click('[data-testid="terms-checkbox"]');
    await this.clickAndNavigate('[data-testid="register-button"]');
    
    // Wait for successful registration
    await this.page.waitForURL(/\/(dashboard|perfil)/, { timeout: 15000 });
  }

  /**
   * Create a service request (for Explorador)
   */
  async createServiceRequest(requestData: {
    category: string;
    description: string;
    location: string;
    priority?: string;
  }) {
    await this.page.goto('/dashboard');
    await this.clickAndNavigate('[data-testid="new-request-button"]');
    
    // Fill request form
    await this.page.selectOption('[data-testid="category-select"]', requestData.category);
    await this.fillField('[data-testid="description"]', requestData.description);
    await this.page.selectOption('[data-testid="location-select"]', requestData.location);
    
    if (requestData.priority) {
      await this.page.selectOption('[data-testid="priority-select"]', requestData.priority);
    }
    
    await this.clickAndNavigate('[data-testid="submit-request-button"]');
    
    // Wait for confirmation
    await this.waitForElement('[data-testid="request-success"]');
  }

  /**
   * Create a service (for AS)
   */
  async createService(serviceData: {
    title: string;
    description: string;
    category: string;
    price: string;
  }) {
    await this.page.goto('/dashboard');
    await this.clickAndNavigate('[data-testid="new-service-button"]');
    
    // Fill service form
    await this.fillField('[data-testid="service-title"]', serviceData.title);
    await this.fillField('[data-testid="service-description"]', serviceData.description);
    await this.page.selectOption('[data-testid="service-category"]', serviceData.category);
    await this.fillField('[data-testid="service-price"]', serviceData.price);
    
    await this.clickAndNavigate('[data-testid="create-service-button"]');
    
    // Wait for confirmation
    await this.waitForElement('[data-testid="service-created-success"]');
  }

  /**
   * Send a chat message
   */
  async sendChatMessage(message: string) {
    await this.fillField('[data-testid="chat-input"]', message);
    await this.page.click('[data-testid="send-message-button"]');
    
    // Wait for message to appear
    await this.waitForElement(`text=${message}`);
  }

  /**
   * Logout helper
   */
  async logout() {
    await this.page.click('[data-testid="user-menu-button"]');
    await this.clickAndNavigate('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  /**
   * Clean up test data (if needed)
   */
  async cleanupTestData() {
    // This would connect to your test database and clean up any test data
    // Implementation depends on your backend API
  }

  /**
   * Generate unique test email
   */
  generateTestEmail(prefix = 'test'): string {
    const timestamp = Date.now();
    return `${prefix}.${timestamp}@test.fixia.com`;
  }

  /**
   * Wait for loading states to complete
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e-tests/screenshots/${name}.png` });
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Switch user role (from Explorador to AS)
   */
  async switchToASRole() {
    await this.page.goto('/perfil');
    await this.page.click('[data-testid="switch-to-as-button"]');
    await this.page.click('[data-testid="confirm-role-switch"]');
    
    // Wait for profile completion redirect
    await this.page.waitForURL(/\/perfil.*completar/);
  }
}

// Test data generators
export const TestData = {
  explorador: {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: '',  // Will be generated
    password: 'TestPassword123!',
    userType: 'explorador' as const
  },
  
  as: {
    nombre: 'María',
    apellido: 'García',
    email: '',  // Will be generated
    password: 'TestPassword123!',
    userType: 'as' as const
  },
  
  serviceRequest: {
    category: 'plomeria',
    description: 'Necesito reparar una fuga en el baño principal',
    location: 'rawson',
    priority: 'normal'
  },
  
  service: {
    title: 'Reparación de plomería profesional',
    description: 'Servicio de plomería con más de 10 años de experiencia',
    category: 'plomeria',
    price: '5000'
  },
  
  chatMessage: 'Hola, necesito más información sobre el servicio'
};

// Selectors constants
export const Selectors = {
  // Auth
  loginForm: '[data-testid="login-form"]',
  registerForm: '[data-testid="register-form"]',
  
  // Navigation
  dashboard: '[data-testid="dashboard"]',
  profileMenu: '[data-testid="user-menu"]',
  
  // Services
  serviceCard: '[data-testid="service-card"]',
  serviceList: '[data-testid="service-list"]',
  
  // Chat
  chatWindow: '[data-testid="chat-window"]',
  messageList: '[data-testid="message-list"]',
  
  // Common
  loadingSpinner: '[data-testid="loading"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]'
};