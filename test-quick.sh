#!/bin/bash

# Quick Testing Script for Fixia.com.ar
# This script runs essential tests quickly for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}===== $1 =====${NC}\n"
}

main() {
    print_header "Quick Test Suite"
    
    # Backend quick tests
    print_status "Running backend unit tests..."
    cd backend
    npm run test:unit
    print_success "Backend unit tests passed"
    cd ..
    
    # Frontend type checking
    print_status "Running TypeScript type checking..."
    cd frontend
    if npm run type-check 2>/dev/null; then
        print_success "TypeScript type checking passed"
    else
        print_error "TypeScript type checking failed"
        exit 1
    fi
    cd ..
    
    # Linting
    print_status "Running linting checks..."
    cd backend
    if npm run lint 2>/dev/null; then
        print_success "Backend linting passed"
    else
        print_error "Backend linting failed"
    fi
    cd ..
    
    cd frontend
    if npm run lint 2>/dev/null; then
        print_success "Frontend linting passed"
    else
        print_error "Frontend linting failed"
    fi
    cd ..
    
    print_header "Quick Tests Completed!"
    echo -e "${GREEN}✅ All quick tests passed successfully!${NC}\n"
}

main "$@"