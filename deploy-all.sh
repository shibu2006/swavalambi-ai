#!/bin/bash
#
# Full Stack Deployment Script
# Deploys both backend and frontend
#
# Usage: ./deploy-all.sh
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Full Stack Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if scripts exist
if [ ! -f "deploy-backend.sh" ] || [ ! -f "deploy-frontend.sh" ]; then
    echo -e "${RED}Error: Deployment scripts not found${NC}"
    exit 1
fi

# Make scripts executable
chmod +x deploy-backend.sh
chmod +x deploy-frontend.sh

echo -e "\n${YELLOW}Deploying backend...${NC}"
./deploy-backend.sh

echo -e "\n${YELLOW}Deploying frontend...${NC}"
./deploy-frontend.sh

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Full deployment complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\nApplication URLs:"
echo -e "  Frontend: ${CLOUDFRONT_URL:-Check deploy-config.sh}"
echo -e "  Backend API: ${API_GATEWAY_URL:-Check deploy-config.sh}"
echo -e "  Health Check: ${API_GATEWAY_URL:-Check deploy-config.sh}/health"
echo ""
