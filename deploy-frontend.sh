#!/bin/bash
#
# Frontend Deployment Script
# Builds and deploys frontend to S3 + CloudFront
#
# Usage: ./deploy-frontend.sh
#
# Configuration: Set these environment variables or edit deploy-config.sh
#   AWS_PROFILE - AWS CLI profile name
#   AWS_REGION - AWS region
#   S3_BUCKET_FRONTEND - S3 bucket for frontend hosting
#   CLOUDFRONT_URL - CloudFront distribution URL (optional)
#   S3_WEBSITE_URL - S3 website URL (optional)
#

set -e  # Exit on error

# Load configuration from deploy-config.sh if it exists
if [ -f "deploy-config.sh" ]; then
    source deploy-config.sh
fi

# Configuration with defaults (override via environment variables or deploy-config.sh)
AWS_PROFILE="${AWS_PROFILE:-default}"
AWS_REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET_FRONTEND="${S3_BUCKET_FRONTEND:-your-frontend-bucket}"
CLOUDFRONT_URL="${CLOUDFRONT_URL:-https://your-cloudfront-url.cloudfront.net}"
S3_WEBSITE_URL="${S3_WEBSITE_URL:-http://your-frontend-bucket.s3-website-us-east-1.amazonaws.com}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Frontend Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Validate configuration
if [ "$S3_BUCKET_FRONTEND" = "your-frontend-bucket" ]; then
    echo -e "${RED}Error: Please configure deployment settings${NC}"
    echo -e "${YELLOW}Create deploy-config.sh with your AWS settings:${NC}"
    echo -e "  cp deploy-config.example.sh deploy-config.sh"
    echo -e "  # Edit deploy-config.sh with your values"
    exit 1
fi

echo -e "\nConfiguration:"
echo -e "  AWS Profile: $AWS_PROFILE"
echo -e "  AWS Region: $AWS_REGION"
echo -e "  S3 Bucket: $S3_BUCKET_FRONTEND"

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

cd frontend

echo -e "\n${YELLOW}Step 1: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo -e "\n${YELLOW}Step 2: Building production bundle...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}✗ Build failed - dist/ directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build complete${NC}"

echo -e "\n${YELLOW}Step 3: Deploying to S3...${NC}"
aws s3 sync dist/ s3://$S3_BUCKET_FRONTEND/ \
  --delete \
  --profile $AWS_PROFILE \
  --region $AWS_REGION

echo -e "${GREEN}✓ Deployed to S3${NC}"

echo -e "\n${YELLOW}Step 4: Checking if CloudFront invalidation is needed...${NC}"
echo -e "${BLUE}Note: CloudFront caching may delay updates (5-10 min)${NC}"
echo -e "${BLUE}To force immediate refresh, run:${NC}"
echo -e "  aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths \"/*\" --profile $AWS_PROFILE"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Frontend deployment complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\nURLs:"
echo -e "  HTTPS (CloudFront): $CLOUDFRONT_URL"
echo -e "  HTTP (S3): $S3_WEBSITE_URL"
echo -e "\nNote: If changes don't appear immediately:"
echo -e "  1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo -e "  2. Wait 5-10 minutes for CloudFront cache to expire"
echo -e "  3. Or create CloudFront invalidation (see above)"
echo ""

cd ..
