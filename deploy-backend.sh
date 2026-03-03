#!/bin/bash
#
# Backend Deployment Script
# Deploys backend code changes to AWS Lambda
#
# Usage: ./deploy-backend.sh
#
# Configuration: Set these environment variables or edit deploy-config.sh
#   AWS_PROFILE - AWS CLI profile name
#   AWS_REGION - AWS region
#   LAMBDA_FUNCTION - Lambda function name
#   S3_BUCKET - S3 bucket for deployment packages
#   API_GATEWAY_URL - API Gateway base URL
#

set -e  # Exit on error

# Load configuration from deploy-config.sh if it exists
if [ -f "deploy-config.sh" ]; then
    source deploy-config.sh
fi

# Configuration with defaults (override via environment variables or deploy-config.sh)
AWS_PROFILE="${AWS_PROFILE:-default}"
AWS_REGION="${AWS_REGION:-us-east-1}"
LAMBDA_FUNCTION="${LAMBDA_FUNCTION:-swavalambi-api}"
S3_BUCKET="${S3_BUCKET:-your-lambda-bucket}"
API_GATEWAY_URL="${API_GATEWAY_URL:-https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod}"
PACKAGE_NAME="deployment-minimal.zip"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Backend Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Validate configuration
if [ "$S3_BUCKET" = "your-lambda-bucket" ]; then
    echo -e "${RED}Error: Please configure deployment settings${NC}"
    echo -e "${YELLOW}Create deploy-config.sh with your AWS settings:${NC}"
    echo -e "  cp deploy-config.example.sh deploy-config.sh"
    echo -e "  # Edit deploy-config.sh with your values"
    exit 1
fi

echo -e "\nConfiguration:"
echo -e "  AWS Profile: $AWS_PROFILE"
echo -e "  AWS Region: $AWS_REGION"
echo -e "  Lambda Function: $LAMBDA_FUNCTION"
echo -e "  S3 Bucket: $S3_BUCKET"

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

cd backend

echo -e "\n${YELLOW}Step 1: Packaging backend code...${NC}"
# Remove old package if exists
rm -f $PACKAGE_NAME

# Create deployment package (code only, no dependencies)
zip -r $PACKAGE_NAME \
  main.py \
  agents/ \
  api/ \
  services/ \
  schemas/ \
  providers/ \
  -x "*.pyc" -x "__pycache__/*" -x "tests/*" -x ".env" -x "*.md"

echo -e "${GREEN}✓ Package created: $PACKAGE_NAME${NC}"

echo -e "\n${YELLOW}Step 2: Uploading to S3...${NC}"
aws s3 cp $PACKAGE_NAME s3://$S3_BUCKET/ \
  --profile $AWS_PROFILE \
  --region $AWS_REGION

echo -e "${GREEN}✓ Uploaded to S3${NC}"

echo -e "\n${YELLOW}Step 3: Deploying to Lambda...${NC}"
aws lambda update-function-code \
  --function-name $LAMBDA_FUNCTION \
  --s3-bucket $S3_BUCKET \
  --s3-key $PACKAGE_NAME \
  --profile $AWS_PROFILE \
  --region $AWS_REGION \
  --output json > /dev/null

echo -e "${GREEN}✓ Deployed to Lambda${NC}"

echo -e "\n${YELLOW}Step 4: Waiting for Lambda to update...${NC}"
sleep 3

echo -e "\n${YELLOW}Step 5: Testing health endpoint...${NC}"
HEALTH_URL="${API_GATEWAY_URL}/health"
RESPONSE=$(curl -s $HEALTH_URL)

if [[ $RESPONSE == *"ok"* ]]; then
    echo -e "${GREEN}✓ Health check passed: $RESPONSE${NC}"
else
    echo -e "${RED}✗ Health check failed: $RESPONSE${NC}"
    echo -e "${YELLOW}Check logs: aws logs tail /aws/lambda/$LAMBDA_FUNCTION --follow --profile $AWS_PROFILE --region $AWS_REGION${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Backend deployment complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\nEndpoints:"
echo -e "  Health: ${API_GATEWAY_URL}/health"
echo -e "  API: ${API_GATEWAY_URL}"
echo -e "  Docs: ${API_GATEWAY_URL}/docs"
echo -e "\nView logs:"
echo -e "  aws logs tail /aws/lambda/$LAMBDA_FUNCTION --follow --profile $AWS_PROFILE --region $AWS_REGION"
echo ""

cd ..
