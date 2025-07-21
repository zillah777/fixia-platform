# Testing Guide for Fixia.com.ar

This document provides comprehensive information about the testing infrastructure and how to run tests for the Fixia platform.

## 🧪 Testing Overview

Fixia implements a comprehensive testing strategy with multiple layers:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API endpoints and service interactions
- **End-to-End Tests**: Test complete user workflows with Cypress
- **Performance Tests**: Monitor application performance and response times
- **Security Tests**: Validate authentication and authorization

## 📋 Test Categories

### Backend Testing (Node.js/Express)

- **Framework**: Jest + Supertest
- **Coverage**: 70%+ required for branches, functions, lines, and statements
- **Location**: `backend/tests/`
- **Configuration**: `backend/jest.config.js`

### Frontend Testing (Next.js/React)

- **Framework**: Cypress for E2E testing
- **Coverage**: TypeScript type checking + ESLint
- **Location**: `frontend/cypress/`
- **Configuration**: `frontend/cypress.config.js`

### Integration Testing

- **Database**: Test with real PostgreSQL database
- **APIs**: Full request/response cycle testing
- **Authentication**: JWT token validation and user sessions

## 🚀 Quick Start

### Run All Tests

```bash
# Complete test suite (takes 5-10 minutes)
./test-all.sh

# Quick tests for development (takes 1-2 minutes)
./test-quick.sh
```

### Individual Test Suites

```bash
# Backend unit tests only
npm run test:unit

# Backend integration tests only
npm run test:integration

# Backend tests with coverage
npm run test:coverage

# Frontend E2E tests only
npm run test:e2e

# TypeScript type checking
npm run type-check

# Linting (both backend and frontend)
npm run lint
```

## 📁 Test Structure

```
├── backend/
│   ├── tests/
│   │   ├── unit/                    # Unit tests
│   │   │   ├── authController.test.js
│   │   │   └── servicesController.test.js
│   │   ├── integration/             # Integration tests
│   │   │   └── auth.integration.test.js
│   │   ├── helpers/                 # Test utilities
│   │   │   └── testDatabase.js
│   │   └── setup.js                 # Global test setup
│   └── jest.config.js
├── frontend/
│   ├── cypress/
│   │   ├── e2e/                     # E2E test specs
│   │   │   ├── auth.cy.js
│   │   │   └── services.cy.js
│   │   ├── support/                 # Cypress commands
│   │   │   ├── commands.js
│   │   │   └── e2e.js
│   │   └── fixtures/                # Test data
│   │       ├── users.json
│   │       └── services.json
│   └── cypress.config.js
├── test-all.sh                      # Complete test suite
├── test-quick.sh                    # Quick development tests
└── README-TESTING.md                # This file
```

## 🔧 Test Configuration

### Backend Jest Configuration

Key features:
- **Coverage thresholds**: 70% minimum
- **Test environment**: Node.js
- **Test timeout**: 10 seconds
- **Setup file**: Automatic database cleanup
- **Mocking**: Database queries and external services

### Frontend Cypress Configuration

Key features:
- **Base URL**: http://localhost:3000
- **API URL**: http://localhost:5000/api
- **Viewport**: 1280x720
- **Screenshots**: On failure
- **Custom commands**: Login, logout, test data creation

## 📊 Coverage Requirements

### Backend Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Coverage Reports

After running tests with coverage:
- **HTML Report**: `backend/coverage/lcov-report/index.html`
- **JSON Report**: `backend/coverage/coverage-final.json`
- **Text Summary**: Displayed in terminal

## 🧪 Writing Tests

### Backend Unit Test Example

```javascript
const request = require('supertest');
const app = require('../../server');
const { query } = require('../../src/config/database');

// Mock database
jest.mock('../../src/config/database');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    // Mock database response
    query.mockResolvedValueOnce({ rows: [] }); // User doesn't exist
    query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com' }] }); // Create user

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        user_type: 'provider'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

### Frontend E2E Test Example

```javascript
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.cleanTestData();
  });

  it('should login with valid credentials', () => {
    cy.createTestUser({
      email: 'test@example.com',
      password: 'password123'
    });

    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.checkToast('Inicio de sesión exitoso', 'success');
    cy.url().should('include', '/dashboard');
  });
});
```

## 🔍 Test Data Management

### Backend Test Database

- **Helper**: `TestDatabase` class in `backend/tests/helpers/testDatabase.js`
- **Cleanup**: Automatic cleanup after each test
- **Seeding**: Create test users, services, and data

### Frontend Test Fixtures

- **User Data**: `frontend/cypress/fixtures/users.json`
- **Service Data**: `frontend/cypress/fixtures/services.json`
- **Custom Commands**: `cy.createTestUser()`, `cy.login()`, `cy.logout()`

## 🚨 Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: ./test-all.sh --skip-e2e
      - uses: actions/upload-artifact@v3
        with:
          name: coverage-reports
          path: reports/
```

### Pre-commit Hooks (Recommended)

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:quick"
```

## 🐛 Debugging Tests

### Backend Test Debugging

```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/authController.test.js

# Run tests with verbose output
npm test -- --verbose

# Debug with Node.js inspector
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Frontend Test Debugging

```bash
# Open Cypress GUI
npm run cypress:open

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.js"

# Debug mode with browser open
npx cypress run --headed --no-exit
```

## 📈 Performance Testing

### Response Time Monitoring

The test suite automatically monitors API response times:
- **Fast**: < 100ms
- **Acceptable**: < 500ms
- **Slow**: > 500ms (triggers warnings)

### Database Performance

Monitor database query performance:
- **Connection time**: < 50ms
- **Query execution**: < 200ms
- **Complex queries**: < 1000ms

## 🔒 Security Testing

### Authentication Tests

- Password hashing validation
- JWT token generation and validation
- Session management
- Rate limiting verification

### Authorization Tests

- Role-based access control
- Resource ownership validation
- API endpoint protection

## 📋 Test Checklist

Before deploying to production:

- [ ] All unit tests pass (70%+ coverage)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Database migrations work
- [ ] Environment variables configured
- [ ] Monitoring and logging functional

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL is running
   brew services start postgresql  # macOS
   sudo systemctl start postgresql  # Linux
   ```

2. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 5000
   npx kill-port 3000 5000
   ```

3. **Cypress Tests Failing**
   ```bash
   # Clear Cypress cache
   npx cypress cache clear
   npx cypress install
   ```

4. **Test Database Issues**
   ```bash
   # Reset test database
   npm run migrate
   npm run seed
   ```

### Getting Help

- **Documentation**: Check this README and inline comments
- **Logs**: Check `backend/logs/` for detailed error logs
- **Issues**: Create an issue in the repository
- **Team**: Contact the development team

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Happy Testing! 🧪✨**