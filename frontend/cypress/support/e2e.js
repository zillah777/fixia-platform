// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands for Fixia testing
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('fixia_token', response.body.token);
    window.localStorage.setItem('fixia_user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('fixia_token');
  window.localStorage.removeItem('fixia_user');
});

// Clean up test data
Cypress.Commands.add('cleanTestData', () => {
  // Add cleanup logic if needed
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Create test user
Cypress.Commands.add('createTestUser', (userData = {}) => {
  const defaultUser = {
    first_name: 'Test',
    last_name: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    user_type: 'provider'
  };
  
  const user = { ...defaultUser, ...userData };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/register`,
    body: user
  }).then((response) => {
    expect(response.status).to.eq(201);
    return cy.wrap(response.body);
  });
});

// Wait for element with better error handling
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Custom assertion for toast messages
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  cy.get(`[data-testid="toast-${type}"]`, { timeout: 5000 })
    .should('be.visible')
    .and('contain.text', message);
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err.message);
  return false;
});