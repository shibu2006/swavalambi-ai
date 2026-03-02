# Swavalambi — AI-Powered Platform for Skilled Workers

**Swavalambi** helps Indian artisans and skilled workers find jobs, access government schemes/loans, and validate their skills using AI.

---

## Project Structure

```
algonauts-ai4bharat/
├── backend/          # FastAPI — AI agents, DynamoDB, recommendations API
│   ├── agents/       # ProfilingAgent (Bedrock Claude), VisionAgent
│   ├── api/          # Route handlers (auth, chat, vision, users, recommendations)
│   ├── services/     # live_data.py (NCS, myScheme, SkillIndia), dynamodb_service.py
│   ├── schemas/      # Pydantic models
│   └── scripts/      # setup_dynamodb.py — one-time DB setup
└── frontend/         # React + Vite + TypeScript + Tailwind — mobile-first UI
    └── src/pages/    # Login, Home, Assistant, Schemes, Profile, Status
```

---

## Prerequisites

- **Python 3.10+** (conda environment: `ai4bharat`)
- **Node.js 18+** & **npm**
- **AWS credentials** with access to:
  - **Amazon Bedrock** (Claude Sonnet — for ProfilingAgent + VisionAgent)
  - **Amazon DynamoDB** (us-east-1 — for user profiles)
  - **Amazon Cognito** (for user authentication)
  - **Amazon S3** (for voice services)
  - **Amazon Transcribe, Polly, Translate** (for voice features)

---

## First-Time Setup

### 1. Create AWS Resources

Run these setup scripts to create required AWS resources:

```bash
cd backend
conda activate ai4bharat

# Create DynamoDB table for user profiles
python scripts/setup_dynamodb.py

# Create Cognito User Pool for authentication
python scripts/setup_cognito.py

# Create S3 bucket for voice services
python scripts/setup_voice_services.py
```

> ⚠️ If your AWS session token has expired, run `aws sso login` first.

### 2. Configure `.env`

After running the setup scripts, update `backend/.env` with the output values:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...         # if using SSO/temporary credentials
AWS_DEFAULT_REGION=us-east-1

# DynamoDB
DYNAMODB_TABLE=swavalambi_users

# Cognito (from setup_cognito.py output)
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Bedrock / Anthropic
USE_ANTHROPIC=true
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL_ID=claude-sonnet-4-6
BEDROCK_MODEL_ID=us.amazon.nova-pro-v1:0

# Voice Services
VOICE_PROVIDER=aws
AWS_S3_BUCKET=swavalambi-voice
AWS_POLLY_VOICE_ID=Aditi
```

---

## Running Locally

### Backend (FastAPI)

```bash
cd backend
conda activate ai4bharat
pip install -r requirements.txt   # first time only
uvicorn main:app --reload --port 8000
```

API docs → `http://localhost:8000/docs`

### Frontend (Vite + React)

```bash
cd frontend
npm install       # first time only
npm run dev
```

App → `http://localhost:3000`

---

## API Endpoints

### Authentication (Cognito-based)
| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/api/auth/register`         | Register new user with email/password        |
| POST   | `/api/auth/verify-email`     | Verify email with 6-digit code               |
| POST   | `/api/auth/login`            | Login with email/password → JWT tokens       |
| POST   | `/api/auth/resend-code`      | Resend verification code                     |
| POST   | `/api/auth/forgot-password`  | Initiate password reset                      |
| POST   | `/api/auth/reset-password`   | Reset password with code                     |
| GET    | `/api/auth/me`               | Get current user info from token             |

### Legacy Authentication (OTP - Deprecated)
| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/api/auth/send-otp`         | Send OTP (mock: `123456`)                    |
| POST   | `/api/auth/verify-otp`       | Verify OTP → upsert user in DynamoDB         |

### User Management
| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/api/users/register`        | Register / update user profile               |
| GET    | `/api/users/{user_id}`       | Fetch user profile from DynamoDB             |
| GET    | `/api/users/{user_id}/chat-history` | Get chat history                      |
| DELETE | `/api/users/{user_id}/chat-history` | Clear chat history                    |

### AI Services
| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/api/chat/chat-profile`     | AI profiling conversation (Bedrock Claude)   |
| POST   | `/api/vision/analyze-vision` | Skill assessment from photo (Bedrock Vision) |
| POST   | `/api/recommendations/fetch` | Get jobs / schemes / training centers        |

### Voice Services
| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/api/voice/transcribe`      | Transcribe audio to text (AWS/Sarvam)        |
| POST   | `/api/voice/synthesize`      | Text to speech (AWS/Sarvam)                  |
| POST   | `/api/voice/translate`       | Translate text (AWS/Sarvam)                  |

### Health Check
| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| GET    | `/health`                    | Health check                                 |

---

## User Flow

1. **Registration** — Enter email, password, name → Verification code sent to email
2. **Email Verification** — Enter 6-digit code → Account activated
3. **Login** — Email + password → JWT tokens → Authenticated session
4. **AI Chat** — Profiling agent determines skill + intent (job / upskill / loan)
5. **Photo Upload** — VisionAgent scores the work sample → saves `skill_rating` to DynamoDB
6. **Dashboard** — Shows profile + recommendations based on intent
7. **Jobs/Upskill/Schemes** — Browse opportunities based on skill and level
8. **Voice Support** — Hindi voice input/output with AWS Transcribe/Polly/Translate

### Lock Logic

| Level     | Access                                           |
| --------- | ------------------------------------------------ |
| < Level 3 | View-only — application buttons locked           |
| Level 3+  | Full access — can apply for jobs, loans, schemes |

---

## Tech Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| Frontend       | React 18, Vite, TypeScript, Tailwind CSS           |
| Backend        | FastAPI, Python 3.10+, Uvicorn                     |
| AI             | AWS Bedrock / Anthropic Claude (via Strands Agents) |
| Authentication | AWS Cognito (User Pools, JWT tokens)               |
| Database       | Amazon DynamoDB (single table: `swavalambi_users`) |
| Voice Services | AWS Transcribe, Polly, Translate / Sarvam AI       |
| Storage        | Amazon S3 (voice files)                            |
| Jobs API       | NCS (National Career Service)                      |
| Schemes API    | myScheme.gov.in                                    |
| Training API   | Skill India Digital Hub                            |
