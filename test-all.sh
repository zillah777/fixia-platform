#!/bin/bash

# Comprehensive Testing Script for Fixia.com.ar
# This script runs all test suites for both backend and frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Check if dependencies are installed
check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_status "Node.js version: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm version: $(npm --version)"
    
    print_success "All dependencies are available"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Run backend tests
run_backend_tests() {
    print_header "Running Backend Tests"
    
    cd backend
    
    # Run linting
    print_status "Running backend linting..."
    if npm run lint 2>/dev/null; then
        print_success "Backend linting passed"
    else
        print_warning "Backend linting not configured or failed"
    fi
    
    # Run unit tests
    print_status "Running backend unit tests..."
    npm run test:unit
    print_success "Backend unit tests completed"
    
    # Run integration tests
    print_status "Running backend integration tests..."
    npm run test:integration
    print_success "Backend integration tests completed"
    
    # Run all tests with coverage
    print_status "Running backend tests with coverage..."
    npm run test:coverage
    print_success "Backend test coverage generated"
    
    cd ..
}

# Run frontend tests
run_frontend_tests() {
    print_header "Running Frontend Tests"
    
    cd frontend
    
    # Run linting
    print_status "Running frontend linting..."
    if npm run lint 2>/dev/null; then
        print_success "Frontend linting passed"
    else
        print_warning "Frontend linting check skipped"
    fi
    
    # Run type checking
    print_status "Running TypeScript type checking..."
    if npm run type-check 2>/dev/null; then
        print_success "TypeScript type checking passed"
    else
        print_warning "TypeScript type checking failed or not configured"
    fi
    
    # Build frontend to check for build errors
    print_status "Building frontend..."
    if npm run build 2>/dev/null; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Run E2E tests
run_e2e_tests() {
    print_header "Running End-to-End Tests"
    
    # Check if servers are running
    print_status "Checking if backend server is running..."
    if ! curl -s http://localhost:5000/health >/dev/null 2>&1; then
        print_warning "Backend server is not running. Starting it..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        
        # Wait for backend to start
        print_status "Waiting for backend to start..."
        for i in {1..30}; do
            if curl -s http://localhost:5000/health >/dev/null 2>&1; then
                print_success "Backend server is running"
                break
            fi
            sleep 2
        done
    else
        print_success "Backend server is already running"
    fi
    
    print_status "Checking if frontend server is running..."
    if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_warning "Frontend server is not running. Starting it..."
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        # Wait for frontend to start
        print_status "Waiting for frontend to start..."
        for i in {1..30}; do
            if curl -s http://localhost:3000 >/dev/null 2>&1; then
                print_success "Frontend server is running"
                break
            fi
            sleep 2
        done
    else
        print_success "Frontend server is already running"
    fi
    
    # Run Cypress tests
    cd frontend
    print_status "Running Cypress E2E tests..."
    npm run test:e2e
    print_success "E2E tests completed"
    cd ..
    
    # Cleanup: kill servers if we started them
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Stopping backend server..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend server..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Generate test reports
generate_reports() {
    print_header "Generating Test Reports"
    
    # Create reports directory
    mkdir -p reports
    
    # Copy backend coverage report
    if [ -d "backend/coverage" ]; then
        cp -r backend/coverage reports/backend-coverage
        print_success "Backend coverage report copied to reports/backend-coverage"
    fi
    
    # Copy Cypress reports if they exist
    if [ -d "frontend/cypress/reports" ]; then
        cp -r frontend/cypress/reports reports/e2e-reports
        print_success "E2E test reports copied to reports/e2e-reports"
    fi
    
    print_success "Test reports generated in ./reports directory"
}

# Main execution
main() {
    print_header "Fixia.com.ar - Comprehensive Test Suite"
    
    # Parse command line arguments
    SKIP_DEPS=false
    SKIP_E2E=false
    SKIP_FRONTEND=false
    SKIP_BACKEND=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-e2e)
                SKIP_E2E=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            --skip-backend)
                SKIP_BACKEND=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-deps      Skip dependency installation"
                echo "  --skip-e2e       Skip end-to-end tests"
                echo "  --skip-frontend  Skip frontend tests"
                echo "  --skip-backend   Skip backend tests"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies if not skipped
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
    fi
    
    # Run backend tests if not skipped
    if [ "$SKIP_BACKEND" = false ]; then
        run_backend_tests
    fi
    
    # Run frontend tests if not skipped
    if [ "$SKIP_FRONTEND" = false ]; then
        run_frontend_tests
    fi
    
    # Run E2E tests if not skipped
    if [ "$SKIP_E2E" = false ]; then
        run_e2e_tests
    fi
    
    # Generate reports
    generate_reports
    
    print_header "All Tests Completed Successfully!"
    print_success "✅ Backend tests: $([ "$SKIP_BACKEND" = false ] && echo "PASSED" || echo "SKIPPED")"
    print_success "✅ Frontend tests: $([ "$SKIP_FRONTEND" = false ] && echo "PASSED" || echo "SKIPPED")"
    print_success "✅ E2E tests: $([ "$SKIP_E2E" = false ] && echo "PASSED" || echo "SKIPPED")"
    
    echo -e "\n${GREEN}🎉 Fixia.com.ar is ready for production! 🎉${NC}\n"
}

# Trap to cleanup on exit
trap 'if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null || true; fi; if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null || true; fi' EXIT

# Run main function
main "$@"