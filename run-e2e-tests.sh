#!/bin/bash

# 🎭 Script de Ejecución de Tests E2E - Fixia.com.ar
# Este script facilita la ejecución de tests E2E con diferentes configuraciones

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "🎭 ======================================"
    echo "   FIXIA.COM.AR - E2E TESTS RUNNER"
    echo "======================================${NC}"
    echo ""
}

# Print help
print_help() {
    echo -e "${CYAN}Uso: ./run-e2e-tests.sh [OPCIÓN]${NC}"
    echo ""
    echo -e "${YELLOW}OPCIONES DISPONIBLES:${NC}"
    echo -e "  ${GREEN}all${NC}          - Ejecutar todos los tests E2E"
    echo -e "  ${GREEN}auth${NC}         - Tests de autenticación (registro, login)"
    echo -e "  ${GREEN}explorador${NC}   - Tests de funcionalidades de Explorador"
    echo -e "  ${GREEN}as${NC}           - Tests de funcionalidades de AS"
    echo -e "  ${GREEN}chat${NC}         - Tests del sistema de chat"
    echo -e "  ${GREEN}payments${NC}     - Tests del sistema de pagos"
    echo -e "  ${GREEN}reviews${NC}      - Tests del sistema de reviews"
    echo -e "  ${GREEN}critical${NC}     - Solo tests críticos"
    echo -e "  ${GREEN}ui${NC}           - Ejecutar con interfaz visual"
    echo -e "  ${GREEN}headed${NC}       - Ejecutar con ventanas del navegador visibles"
    echo -e "  ${GREEN}debug${NC}        - Modo debug (step-by-step)"
    echo -e "  ${GREEN}report${NC}       - Mostrar último reporte HTML"
    echo -e "  ${GREEN}install${NC}      - Instalar Playwright y navegadores"
    echo -e "  ${GREEN}help${NC}         - Mostrar esta ayuda"
    echo ""
    echo -e "${YELLOW}EJEMPLOS:${NC}"
    echo -e "  ${CYAN}./run-e2e-tests.sh all${NC}        - Todos los tests"
    echo -e "  ${CYAN}./run-e2e-tests.sh auth${NC}       - Solo autenticación"
    echo -e "  ${CYAN}./run-e2e-tests.sh ui${NC}         - Con interfaz visual"
    echo -e "  ${CYAN}./run-e2e-tests.sh critical${NC}   - Tests críticos"
    echo ""
}

# Check if services are running
check_services() {
    # Check if using production URL
    if [[ "${TEST_BASE_URL:-https://fixia-platform.vercel.app}" == *"vercel.app"* ]] || [[ "${TEST_BASE_URL:-https://fixia-platform.vercel.app}" == *"fixia"* ]]; then
        echo -e "${BLUE}🌐 Usando deployment en producción: ${TEST_BASE_URL:-https://fixia-platform.vercel.app}${NC}"
        
        # Check if production site is accessible
        if ! curl -s "${TEST_BASE_URL:-https://fixia-platform.vercel.app}" > /dev/null 2>&1; then
            echo -e "${RED}❌ No se puede acceder a la aplicación en producción${NC}"
            echo -e "${YELLOW}💡 Verifica que https://fixia-platform.vercel.app esté funcionando${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ Aplicación en producción accesible${NC}"
        echo ""
        return
    fi
    
    echo -e "${BLUE}🔍 Verificando servicios locales...${NC}"
    
    # Check frontend (port 3000)
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${RED}❌ Frontend no está ejecutándose en puerto 3000${NC}"
        echo -e "${YELLOW}💡 Ejecuta: cd frontend && npm run dev${NC}"
        exit 1
    fi
    
    # Check backend (port 5000)
    if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Backend no responde en puerto 5000${NC}"
        echo -e "${YELLOW}💡 Ejecuta: cd backend && npm run dev${NC}"
        echo -e "${BLUE}🔄 Continuando (algunos tests pueden fallar)...${NC}"
    fi
    
    echo -e "${GREEN}✅ Servicios verificados${NC}"
    echo ""
}

# Install Playwright
install_playwright() {
    echo -e "${BLUE}📦 Instalando Playwright...${NC}"
    
    # Install Playwright packages
    echo -e "${CYAN}Instalando paquetes...${NC}"
    npm install -D playwright @playwright/test
    
    # Install browsers
    echo -e "${CYAN}Instalando navegadores...${NC}"
    npx playwright install
    
    # Install system dependencies
    echo -e "${CYAN}Instalando dependencias del sistema...${NC}"
    npx playwright install-deps
    
    echo -e "${GREEN}✅ Playwright instalado correctamente${NC}"
    exit 0
}

# Run specific test suite
run_tests() {
    local test_type=$1
    local extra_args=${2:-""}
    
    echo -e "${BLUE}🚀 Ejecutando tests: ${test_type}${NC}"
    echo -e "${CYAN}Argumentos adicionales: ${extra_args}${NC}"
    echo ""
    
    case $test_type in
        "all")
            npx playwright test $extra_args
            ;;
        "auth")
            npx playwright test e2e-tests/auth/ $extra_args
            ;;
        "explorador")
            npx playwright test e2e-tests/explorador/ $extra_args
            ;;
        "as")
            npx playwright test e2e-tests/as/ $extra_args
            ;;
        "chat")
            npx playwright test e2e-tests/communication/ $extra_args
            ;;
        "payments")
            npx playwright test e2e-tests/payments/ $extra_args
            ;;
        "reviews")
            npx playwright test e2e-tests/reviews/ $extra_args
            ;;
        "critical")
            npx playwright test e2e-tests/auth/ e2e-tests/explorador/service-requests.spec.ts e2e-tests/as/service-management.spec.ts $extra_args
            ;;
        *)
            echo -e "${RED}❌ Tipo de test no reconocido: $test_type${NC}"
            print_help
            exit 1
            ;;
    esac
}

# Show test report
show_report() {
    echo -e "${BLUE}📊 Mostrando reporte de tests...${NC}"
    npx playwright show-report
}

# Print test summary
print_summary() {
    echo ""
    echo -e "${PURPLE}📈 ======================================"
    echo "        RESUMEN DE TESTS E2E"
    echo "======================================${NC}"
    echo ""
    echo -e "${CYAN}Estructura de Tests Disponibles:${NC}"
    echo -e "  📁 auth/                  - Registro, Login, Logout"
    echo -e "  📁 explorador/           - Dashboard, Solicitudes, Búsqueda"
    echo -e "  📁 as/                   - Dashboard AS, Servicios, Respuestas"
    echo -e "  📁 communication/        - Chat en tiempo real"
    echo -e "  📁 payments/            - MercadoPago, Historial, Ganancias"
    echo -e "  📁 reviews/             - Calificaciones, Reseñas"
    echo ""
    echo -e "${GREEN}✅ Total: ~150+ test cases cubriendo toda la funcionalidad${NC}"
    echo ""
    echo -e "${YELLOW}💡 Consejos:${NC}"
    echo -e "  • Usa 'ui' para interfaz visual interactiva"
    echo -e "  • Usa 'headed' para ver los navegadores en acción"
    echo -e "  • Usa 'debug' para debugging paso a paso"
    echo -e "  • Usa 'critical' para tests esenciales rápidos"
    echo ""
}

# Main script logic
main() {
    print_banner
    
    # Handle command line arguments
    case "${1:-help}" in
        "install")
            install_playwright
            ;;
        "help"|"-h"|"--help"|"")
            print_help
            print_summary
            ;;
        "report")
            show_report
            ;;
        "ui")
            check_services
            run_tests "all" "--ui"
            ;;
        "headed")
            check_services
            run_tests "all" "--headed"
            ;;
        "debug")
            check_services
            run_tests "all" "--debug"
            ;;
        "all"|"auth"|"explorador"|"as"|"chat"|"payments"|"reviews"|"critical")
            check_services
            run_tests "$1"
            
            # Show completion message
            echo ""
            echo -e "${GREEN}🎉 Tests completados!${NC}"
            echo -e "${CYAN}📊 Para ver el reporte: ./run-e2e-tests.sh report${NC}"
            ;;
        *)
            echo -e "${RED}❌ Opción no reconocida: $1${NC}"
            echo ""
            print_help
            exit 1
            ;;
    esac
}

# Check if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi