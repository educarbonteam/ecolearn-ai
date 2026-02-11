#!/bin/bash

# EcoLearn AI - Quick Start Script
# This script helps you get started with the project quickly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║             🌱 EcoLearn AI - Quick Start 🌱                ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose installed"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git installed"
    
    echo ""
}

# Setup environment
setup_environment() {
    echo -e "${BLUE}Setting up environment...${NC}"
    
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp .env.example .env
        
        # Generate random secret key
        SECRET_KEY=$(openssl rand -base64 32)
        
        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|SECRET_KEY=.*|SECRET_KEY=$SECRET_KEY|" .env
        else
            sed -i "s|SECRET_KEY=.*|SECRET_KEY=$SECRET_KEY|" .env
        fi
        
        print_success ".env file created"
        
        echo ""
        print_info "Please edit .env file and add your API keys:"
        echo "  - OPENAI_API_KEY (required for AI features)"
        echo "  - TREE_API_KEY (optional for tree planting)"
        echo ""
        read -p "Press Enter to continue after updating .env file..."
    else
        print_success ".env file already exists"
    fi
    
    echo ""
}

# Build and start services
start_services() {
    echo -e "${BLUE}Building and starting services...${NC}"
    
    print_info "This may take a few minutes on first run..."
    
    # Build images
    docker-compose build
    
    # Start services
    docker-compose up -d
    
    print_success "Services started successfully"
    echo ""
}

# Wait for services to be ready
wait_for_services() {
    echo -e "${BLUE}Waiting for services to be ready...${NC}"
    
    # Wait for database
    print_info "Waiting for database..."
    until docker-compose exec -T db pg_isready -U ecolearn &> /dev/null; do
        sleep 1
    done
    print_success "Database is ready"
    
    # Wait for backend
    print_info "Waiting for backend API..."
    until curl -s http://localhost:8000/health &> /dev/null; do
        sleep 2
    done
    print_success "Backend API is ready"
    
    # Wait for frontend
    print_info "Waiting for frontend..."
    until curl -s http://localhost:3000 &> /dev/null; do
        sleep 2
    done
    print_success "Frontend is ready"
    
    echo ""
}

# Create test user
create_test_user() {
    echo -e "${BLUE}Creating test user...${NC}"
    
    response=$(curl -s -X POST "http://localhost:8000/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "demo@ecolearn.ai",
            "name": "Demo User",
            "password": "demo123"
        }')
    
    if echo "$response" | grep -q "email"; then
        print_success "Test user created successfully"
        echo ""
        print_info "Login credentials:"
        echo "  Email: demo@ecolearn.ai"
        echo "  Password: demo123"
    else
        print_info "Test user may already exist or there was an error"
    fi
    
    echo ""
}

# Display access information
display_info() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                  🎉 Setup Complete! 🎉                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${YELLOW}Access your services:${NC}"
    echo ""
    echo "  🌐 Frontend:          http://localhost:3000"
    echo "  🚀 Backend API:       http://localhost:8000"
    echo "  📚 API Docs:          http://localhost:8000/docs"
    echo "  📊 Prometheus:        http://localhost:9090"
    echo "  📈 Grafana:           http://localhost:3001 (admin/admin)"
    echo ""
    
    echo -e "${YELLOW}Test credentials:${NC}"
    echo "  Email:    demo@ecolearn.ai"
    echo "  Password: demo123"
    echo ""
    
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "  View logs:      docker-compose logs -f"
    echo "  Stop services:  docker-compose down"
    echo "  Restart:        docker-compose restart"
    echo ""
}

# Main execution
main() {
    print_header
    check_prerequisites
    setup_environment
    start_services
    wait_for_services
    create_test_user
    display_info
    
    echo -e "${GREEN}🌱 Happy learning! 🌱${NC}"
}

# Run main function
main
