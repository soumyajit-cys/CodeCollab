#!/bin/bash

# CodeCollab Deployment Script
# This script helps deploy the CodeCollab application to production

set -e

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Create environment file if it doesn't exist
setup_environment() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        print_warning "Especially set your JWT_SECRET, email, SMS, and OpenAI credentials."
        read -p "Press Enter to continue after editing .env file..."
    else
        print_success ".env file found"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p uploads
    mkdir -p ssl
    mkdir -p logs
    print_success "Directories created"
}

# Build and start containers
deploy() {
    print_status "Building and starting containers..."
    
    # Stop any existing containers
    docker-compose down
    
    # Build the images
    docker-compose build --no-cache
    
    # Start the services
    docker-compose up -d
    
    print_success "Containers started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    timeout 60 bash -c 'until docker-compose exec -T mongodb mongo --eval "db.adminCommand(&quot;ping&quot;)" &>/dev/null; do sleep 2; done'
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout 60 bash -c 'until docker-compose exec -T redis redis-cli ping &>/dev/null; do sleep 2; done'
    
    # Wait for Server
    print_status "Waiting for Server..."
    timeout 60 bash -c 'until curl -f http://localhost:3001/health &>/dev/null; do sleep 2; done'
    
    # Wait for Client
    print_status "Waiting for Client..."
    timeout 60 bash -c 'until curl -f http://localhost/health &>/dev/null; do sleep 2; done'
    
    print_success "All services are healthy!"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    docker-compose ps
    echo ""
    print_success "Application is running at: http://localhost"
    print_success "API is available at: http://localhost:3001"
    print_success "Health check: http://localhost:3001/health"
    echo ""
    print_status "Default admin credentials (if using MongoDB init script):"
    print_warning "  Username: admin"
    print_warning "  Password: admin123"
    echo ""
    print_status "To view logs: docker-compose logs -f [service-name]"
    print_status "To stop: docker-compose down"
    print_status "To restart: docker-compose restart"
}

# Main deployment function
main() {
    print_status "Starting CodeCollab deployment..."
    echo ""
    
    check_docker
    check_docker_compose
    setup_environment
    create_directories
    deploy
    wait_for_services
    show_status
    
    print_success "CodeCollab deployment completed successfully! 🚀"
}

# Function to update the application
update() {
    print_status "Updating CodeCollab..."
    
    # Pull latest changes (if in git repository)
    if [ -d .git ]; then
        git pull
    fi
    
    # Rebuild and restart
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    wait_for_services
    print_success "CodeCollab updated successfully!"
}

# Function to backup data
backup() {
    print_status "Creating backup..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup MongoDB
    docker-compose exec -T mongodb mongodump --out /tmp/backup
    docker cp $(docker-compose ps -q mongodb):/tmp/backup "$BACKUP_DIR/mongodb"
    
    # Backup Redis
    docker-compose exec -T redis redis-cli BGSAVE
    docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis"
    
    # Backup uploaded files
    cp -r uploads "$BACKUP_DIR/"
    
    # Compress backup
    tar -czf "${BACKUP_DIR}.tar.gz" -C backups "$(basename $BACKUP_DIR)"
    rm -rf "$BACKUP_DIR"
    
    print_success "Backup created: ${BACKUP_DIR}.tar.gz"
}

# Function to restore from backup
restore() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file: ./deploy.sh restore backup-file.tar.gz"
        exit 1
    fi
    
    BACKUP_FILE="$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_status "Restoring from backup: $BACKUP_FILE"
    
    # Extract backup
    TEMP_DIR="temp_restore_$(date +%s)"
    mkdir -p "$TEMP_DIR"
    tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"
    
    # Stop services
    docker-compose down
    
    # Restore MongoDB
    if [ -d "$TEMP_DIR"/*/mongodb ]; then
        docker-compose up -d mongodb
        sleep 10
        docker cp "$TEMP_DIR"/*/mongodb/. $(docker-compose ps -q mongodb):/tmp/restore
        docker-compose exec mongodb mongorestore /tmp/restore
    fi
    
    # Restore Redis
    if [ -f "$TEMP_DIR"/*/redis/dump.rdb ]; then
        docker-compose up -d redis
        sleep 5
        docker cp "$TEMP_DIR"/*/redis/dump.rdb $(docker-compose ps -q redis):/data/dump.rdb
        docker-compose restart redis
    fi
    
    # Restore uploads
    if [ -d "$TEMP_DIR"/*/uploads ]; then
        cp -r "$TEMP_DIR"/*/uploads/* uploads/
    fi
    
    # Start all services
    docker-compose up -d
    wait_for_services
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    print_success "Restore completed successfully!"
}

# Show help
show_help() {
    echo "CodeCollab Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy      Deploy the application (default)"
    echo "  update      Update the application"
    echo "  backup      Create a backup"
    echo "  restore     Restore from backup (requires backup file)"
    echo "  status      Show deployment status"
    echo "  logs        Show logs for all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                    # Deploy the application"
    echo "  $0 backup                    # Create a backup"
    echo "  $0 restore backup.tar.gz     # Restore from backup"
    echo "  $0 logs                      # Show logs"
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    update)
        update
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    status)
        show_status
        ;;
    logs)
        docker-compose logs -f
        ;;
    stop)
        docker-compose down
        print_success "All services stopped"
        ;;
    restart)
        docker-compose restart
        print_success "All services restarted"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac