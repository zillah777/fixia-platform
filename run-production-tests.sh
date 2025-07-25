#!/bin/bash

# 🎭 Fixia.com.ar Production E2E Tests - Final Suite
# Tests optimizados para la aplicación real en producción

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
    echo -e "${PURPLE}"
    echo "🎭 =============================================="
    echo "   FIXIA.COM.AR - PRODUCTION E2E TEST SUITE"
    echo "   Optimized for Real Application Testing"
    echo "===============================================${NC}"
    echo ""
}

print_summary() {
    echo -e "${CYAN}📊 AVAILABLE TEST SUITES:${NC}"
    echo ""
    echo -e "${GREEN}🔑 auth${NC}           - Login & Demo buttons functionality"
    echo -e "${GREEN}📋 registration${NC}   - Complete registration flow"
    echo -e "${GREEN}🎯 journey${NC}        - Complete user journeys"
    echo -e "${GREEN}📱 responsive${NC}     - Responsive design testing"
    echo -e "${GREEN}❌ validation${NC}     - Form validation testing"
    echo -e "${GREEN}🔍 exploration${NC}    - Page structure exploration"
    echo -e "${GREEN}⚡ quick${NC}          - Quick essential tests"
    echo -e "${GREEN}🎪 all${NC}           - All production tests"
    echo ""
    echo -e "${YELLOW}💡 All tests run with visible browser (headless: false)${NC}"
    echo ""
}

run_auth_tests() {
    echo -e "${BLUE}🔑 Running Authentication Tests...${NC}"
    npx playwright test e2e-tests/login-demo-flow.spec.ts --workers=1 --project=chromium
}

run_registration_tests() {
    echo -e "${BLUE}📋 Running Registration Tests...${NC}"
    npx playwright test e2e-tests/registration-complete.spec.ts --workers=1 --project=chromium
}

run_journey_tests() {
    echo -e "${BLUE}🎯 Running Complete Journey Tests...${NC}"
    npx playwright test e2e-tests/complete-user-journey.spec.ts --workers=1 --project=chromium
}

run_responsive_tests() {
    echo -e "${BLUE}📱 Running Responsive Design Tests...${NC}"
    npx playwright test e2e-tests/complete-user-journey.spec.ts -g "responsive" --workers=1 --project=chromium
}

run_validation_tests() {
    echo -e "${BLUE}❌ Running Validation Tests...${NC}"
    npx playwright test e2e-tests/complete-user-journey.spec.ts -g "validation" --workers=1 --project=chromium
}

run_exploration_tests() {
    echo -e "${BLUE}🔍 Running Exploration Tests...${NC}"
    npx playwright test e2e-tests/simple-visual-test.spec.ts --workers=1 --project=chromium
}

run_quick_tests() {
    echo -e "${BLUE}⚡ Running Quick Essential Tests...${NC}"
    echo -e "${CYAN}This includes: Login demo buttons + Registration flow + Basic navigation${NC}"
    echo ""
    
    npx playwright test e2e-tests/login-demo-flow.spec.ts -g "should test Explorador demo" --workers=1 --project=chromium
    npx playwright test e2e-tests/registration-complete.spec.ts -g "should test form validation" --workers=1 --project=chromium
    npx playwright test e2e-tests/complete-user-journey.spec.ts -g "should test complete navigation" --workers=1 --project=chromium
}

run_all_tests() {
    echo -e "${BLUE}🎪 Running All Production Tests...${NC}"
    echo -e "${YELLOW}This will take several minutes and run all test suites${NC}"
    echo ""
    
    run_auth_tests
    echo ""
    run_registration_tests
    echo ""
    run_journey_tests
    echo ""
}

show_results() {
    echo ""
    echo -e "${PURPLE}📈 ==========================================="
    echo "             TEST RESULTS"
    echo "===========================================${NC}"
    echo ""
    echo -e "${CYAN}📸 Screenshots generated in current directory${NC}"
    echo -e "${CYAN}📊 HTML Report available: npx playwright show-report${NC}"
    echo ""
    echo -e "${GREEN}✅ Key Features Tested:${NC}"
    echo -e "   • Homepage navigation and sections"
    echo -e "   • Login page with demo buttons"
    echo -e "   • Multi-step registration flow"
    echo -e "   • Form validation (login & registration)"
    echo -e "   • Responsive design (mobile/tablet/desktop)"
    echo -e "   • Error handling (404 pages)"
    echo -e "   • User type differentiation (Explorador/Especialista)"
    echo ""
    echo -e "${YELLOW}🔍 Discovered Application Structure:${NC}"
    echo -e "   • Landing page: Fx Fixia professional services"
    echo -e "   • Auth routes: /auth/login, /auth/registro"
    echo -e "   • User types: customer (Explorador), provider (Especialista)"
    echo -e "   • Demo buttons: 🔍 Explorador Demo, 🛠️ AS Demo"
    echo -e "   • Form validation: Real-time error messages"
    echo -e "   • Multi-step registration with password confirmation"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "auth")
        print_banner
        run_auth_tests
        show_results
        ;;
    "registration")
        print_banner
        run_registration_tests
        show_results
        ;;
    "journey")
        print_banner
        run_journey_tests
        show_results
        ;;
    "responsive")
        print_banner
        run_responsive_tests
        show_results
        ;;
    "validation")
        print_banner
        run_validation_tests
        show_results
        ;;
    "exploration")
        print_banner
        run_exploration_tests
        show_results
        ;;
    "quick")
        print_banner
        run_quick_tests
        show_results
        ;;
    "all")
        print_banner
        run_all_tests
        show_results
        ;;
    "help"|"-h"|"--help"|"")
        print_banner
        print_summary
        echo -e "${CYAN}USAGE: ./run-production-tests.sh [OPTION]${NC}"
        echo ""
        echo -e "${YELLOW}EXAMPLES:${NC}"
        echo -e "  ${CYAN}./run-production-tests.sh quick${NC}        # Quick essential tests"
        echo -e "  ${CYAN}./run-production-tests.sh auth${NC}         # Login and demo buttons"
        echo -e "  ${CYAN}./run-production-tests.sh registration${NC} # Registration flow"
        echo -e "  ${CYAN}./run-production-tests.sh all${NC}          # Complete test suite"
        echo ""
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        echo -e "${YELLOW}Use './run-production-tests.sh help' for available options${NC}"
        exit 1
        ;;
esac