# EcoLearn AI - Makefile
# Simplify common development tasks

.PHONY: help install dev build test clean deploy logs

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)EcoLearn AI - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	cd backend && pip install -r requirements.txt
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

setup: ## Setup environment (copy .env, generate secrets)
	@echo "$(YELLOW)Setting up environment...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		SECRET_KEY=$$(openssl rand -base64 32); \
		if [[ "$$OSTYPE" == "darwin"* ]]; then \
			sed -i '' "s|SECRET_KEY=.*|SECRET_KEY=$$SECRET_KEY|" .env; \
		else \
			sed -i "s|SECRET_KEY=.*|SECRET_KEY=$$SECRET_KEY|" .env; \
		fi; \
		echo "$(GREEN)✓ .env file created$(NC)"; \
		echo "$(YELLOW)⚠ Please edit .env and add your API keys$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists$(NC)"; \
	fi

dev: ## Start development environment
	@echo "$(YELLOW)Starting development environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo ""
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

build: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Images built$(NC)"

start: ## Start all services
	@echo "$(YELLOW)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"

stop: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

logs: ## Show logs (use: make logs SERVICE=backend)
	@if [ -z "$(SERVICE)" ]; then \
		docker-compose logs -f; \
	else \
		docker-compose logs -f $(SERVICE); \
	fi

test: ## Run all tests
	@echo "$(YELLOW)Running backend tests...$(NC)"
	cd backend && pytest -v --cov=. --cov-report=term-missing
	@echo ""
	@echo "$(YELLOW)Running frontend tests...$(NC)"
	cd frontend && npm test

test-backend: ## Run backend tests only
	@echo "$(YELLOW)Running backend tests...$(NC)"
	cd backend && pytest -v --cov=. --cov-report=html
	@echo "$(GREEN)✓ Coverage report: backend/htmlcov/index.html$(NC)"

test-frontend: ## Run frontend tests only
	@echo "$(YELLOW)Running frontend tests...$(NC)"
	cd frontend && npm test -- --coverage

lint: ## Run linters
	@echo "$(YELLOW)Running backend linters...$(NC)"
	cd backend && flake8 . && black --check . && mypy .
	@echo "$(YELLOW)Running frontend linter...$(NC)"
	cd frontend && npm run lint

format: ## Format code
	@echo "$(YELLOW)Formatting backend code...$(NC)"
	cd backend && black .
	@echo "$(YELLOW)Formatting frontend code...$(NC)"
	cd frontend && npm run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	docker-compose exec backend alembic upgrade head
	@echo "$(GREEN)✓ Migrations applied$(NC)"

migrate-create: ## Create new migration (use: make migrate-create MSG="description")
	@if [ -z "$(MSG)" ]; then \
		echo "$(YELLOW)Usage: make migrate-create MSG=\"your migration message\"$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Creating migration: $(MSG)$(NC)"
	docker-compose exec backend alembic revision --autogenerate -m "$(MSG)"

db-shell: ## Open database shell
	@echo "$(YELLOW)Connecting to database...$(NC)"
	docker-compose exec db psql -U ecolearn -d ecolearn-db

backend-shell: ## Open backend shell
	@echo "$(YELLOW)Opening backend shell...$(NC)"
	docker-compose exec backend /bin/bash

clean: ## Clean up containers, volumes, and cache
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

reset: clean ## Reset everything (clean + rebuild)
	@echo "$(YELLOW)Resetting environment...$(NC)"
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✓ Environment reset$(NC)"

backup: ## Backup database
	@echo "$(YELLOW)Creating database backup...$(NC)"
	@mkdir -p backups
	docker-compose exec -T db pg_dump -U ecolearn ecolearn-db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"

restore: ## Restore database (use: make restore FILE=backups/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(YELLOW)Usage: make restore FILE=backups/backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(FILE)...$(NC)"
	docker-compose exec -T db psql -U ecolearn -d ecolearn-db < $(FILE)
	@echo "$(GREEN)✓ Database restored$(NC)"

deploy-aws: ## Deploy to AWS ECS
	@echo "$(YELLOW)Deploying to AWS...$(NC)"
	chmod +x scripts/deploy-aws.sh
	./scripts/deploy-aws.sh
	@echo "$(GREEN)✓ Deployment initiated$(NC)"

docs: ## Generate API documentation
	@echo "$(YELLOW)Opening API documentation...$(NC)"
	@command -v open > /dev/null && open http://localhost:8000/docs || xdg-open http://localhost:8000/docs 2>/dev/null || echo "Please open http://localhost:8000/docs manually"

health: ## Check services health
	@echo "$(BLUE)Checking services health...$(NC)"
	@echo ""
	@echo -n "Backend API:  "
	@curl -sf http://localhost:8000/health > /dev/null && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(YELLOW)✗ Unhealthy$(NC)"
	@echo -n "Frontend:     "
	@curl -sf http://localhost:3000 > /dev/null && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(YELLOW)✗ Unhealthy$(NC)"
	@echo -n "Database:     "
	@docker-compose exec -T db pg_isready -U ecolearn > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(YELLOW)✗ Unhealthy$(NC)"
	@echo -n "Prometheus:   "
	@curl -sf http://localhost:9090/-/healthy > /dev/null && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(YELLOW)✗ Unhealthy$(NC)"

quick-start: setup build start ## Quick start (setup + build + start)
	@echo ""
	@echo "$(GREEN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║             🌱 EcoLearn AI is Ready! 🌱                   ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "Docs:     http://localhost:8000/docs"

stats: ## Show project statistics
	@echo "$(BLUE)Project Statistics$(NC)"
	@echo ""
	@echo "Lines of Python code:"
	@find backend -name "*.py" ! -path "*/tests/*" | xargs wc -l | tail -n 1
	@echo ""
	@echo "Lines of JavaScript/JSX code:"
	@find frontend/src -name "*.js" -o -name "*.jsx" | xargs wc -l 2>/dev/null | tail -n 1 || echo "0"
	@echo ""
	@echo "Number of tests:"
	@find . -name "test_*.py" -o -name "*.test.js" | wc -l
	@echo ""
	@echo "Docker images:"
	@docker images | grep ecolearn | wc -l
