# Quick Deployment Guide

Minimal steps to deploy backend and frontend changes using automated scripts.

---

## Prerequisites

- AWS CLI configured with your profile
- Python 3.12 environment (e.g., `conda activate your-env`)
- Node.js 18+
- Deployment config set up (see below)

---

## First Time Setup

### 1. Configure Deployment Settings

```bash
# Copy example config
cp deploy-config.example.sh deploy-config.sh

# Edit with your AWS resource values
nano deploy-config.sh
```

### 2. Configure Frontend Environment

```bash
cd frontend
cp .env.production.example .env.production
nano .env.production
cd ..
```

### 3. Make Scripts Executable

```bash
chmod +x deploy-backend.sh deploy-frontend.sh deploy-all.sh
```

---

## Deploy Backend (Code Changes)

```bash
./deploy-backend.sh
```

**What it does:**
- Packages code only (no dependencies)
- Uploads to S3
- Deploys to Lambda
- Tests health endpoint

**Verify:** Check the health endpoint URL shown in output

---

## Deploy Frontend (UI Changes)

```bash
./deploy-frontend.sh
```

**What it does:**
- Builds production bundle
- Deploys to S3
- Shows URLs

**Verify:** Open the frontend URL shown in output

**Note:** CloudFront caching may delay updates (5-10 min). To force refresh:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*" \
  --profile YOUR_PROFILE
```

---

## Deploy Everything

```bash
./deploy-all.sh
```

Deploys both backend and frontend in one command.

---

## Manual Deployment (If Scripts Don't Work)

### Backend

```bash
cd backend

# Package code
zip -r deployment-minimal.zip \
  main.py agents/ api/ services/ schemas/ \
  -x "*.pyc" -x "__pycache__/*" -x "tests/*" -x ".env"

# Upload to S3
aws s3 cp deployment-minimal.zip s3://YOUR_LAMBDA_BUCKET/ \
  --profile YOUR_PROFILE --region YOUR_REGION

# Deploy to Lambda
aws lambda update-function-code \
  --function-name YOUR_LAMBDA_FUNCTION \
  --s3-bucket YOUR_LAMBDA_BUCKET \
  --s3-key deployment-minimal.zip \
  --profile YOUR_PROFILE --region YOUR_REGION
```

### Frontend

```bash
cd frontend

# Build
npm run build

# Deploy
aws s3 sync dist/ s3://YOUR_FRONTEND_BUCKET/ \
  --delete \
  --profile YOUR_PROFILE --region YOUR_REGION
```

---

## Update Lambda Dependencies (Rare)

Only needed if you add new Python packages to `requirements.txt`.

```bash
cd backend

# Rebuild layer
rm -rf lambda-layer
mkdir -p lambda-layer/python
pip install -r requirements.txt \
  --platform manylinux2014_x86_64 \
  --only-binary=:all: \
  --target lambda-layer/python \
  --python-version 3.12

# Package and upload
cd lambda-layer
zip -r layer.zip python/
aws s3 cp layer.zip s3://YOUR_LAMBDA_BUCKET/lambda-layer.zip \
  --profile YOUR_PROFILE --region YOUR_REGION

# Publish new layer version
aws lambda publish-layer-version \
  --layer-name YOUR_LAYER_NAME \
  --description "Python 3.12 dependencies" \
  --content S3Bucket=YOUR_LAMBDA_BUCKET,S3Key=lambda-layer.zip \
  --compatible-runtimes python3.12 \
  --profile YOUR_PROFILE --region YOUR_REGION

# Update Lambda to use new layer (replace VERSION with output from above)
aws lambda update-function-configuration \
  --function-name YOUR_LAMBDA_FUNCTION \
  --layers arn:aws:lambda:YOUR_REGION:YOUR_ACCOUNT_ID:layer:YOUR_LAYER_NAME:VERSION \
  --profile YOUR_PROFILE --region YOUR_REGION
```

---

## View Logs

```bash
# Lambda logs (backend errors)
aws logs tail /aws/lambda/YOUR_LAMBDA_FUNCTION \
  --follow \
  --profile YOUR_PROFILE --region YOUR_REGION
```

---

## Endpoints

After deployment, your endpoints will be:

- **Frontend (HTTPS):** Your CloudFront URL (from deploy-config.sh)
- **Frontend (HTTP):** Your S3 website URL (from deploy-config.sh)
- **Backend API:** Your API Gateway URL (from deploy-config.sh)
- **Health Check:** Your API Gateway URL + `/health`

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Please configure deployment settings" | Run: `cp deploy-config.example.sh deploy-config.sh` and edit |
| Backend changes not reflecting | Redeploy: `./deploy-backend.sh` |
| Frontend changes not showing | Clear browser cache or wait 5-10 min for CloudFront |
| 500 errors | Check Lambda logs (see above) |
| Import errors | Update Lambda layer with new dependencies |

---

## Configuration Files

- `deploy-config.sh` - Your AWS resource IDs (gitignored)
- `frontend/.env.production` - Your frontend config (gitignored)
- `deploy-config.example.sh` - Template (committed to repo)
- `frontend/.env.production.example` - Template (committed to repo)

**Never commit the actual config files - only the `.example` versions!**

---

**For detailed documentation, see:**
- [DEPLOYMENT_SCRIPTS.md](DEPLOYMENT_SCRIPTS.md) - Script usage guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment guide

---

**That's it!** Most deployments only need `./deploy-all.sh`
