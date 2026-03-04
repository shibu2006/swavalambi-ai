# Swavalambi — AI-Powered Platform for Skilled Workers

**Swavalambi** helps Indian artisans and skilled workers find jobs, access government schemes/loans, and validate their skills using AI.

> Built for the **AWS AI for Bharat Hackathon** by Team Algonauts.

---

## Features

- 🤖 **AI Profiling Chat** — Conversational agent (Claude via Bedrock/Anthropic) collects skill, intent, experience, and preferred job location
- 📸 **Vision Skill Assessment** — Upload a work photo; AI scores it and saves a `skill_rating` to your profile
- 💼 **Personalised Job Search** — Filtered by skill + preferred city/state via NCS (National Career Service) API
- 📚 **Training Centers** — Matched by skill using live Skill India API with local JSON fallback
- 🏛️ **Government Schemes** — Searched via myScheme.gov.in API
- 🔐 **Dual Authentication** — Email/password (Cognito) or OTP (mock, for testing)
- 🌐 **Voice Support** — Hindi voice input/output with AWS Transcribe / Polly / Sarvam AI
- 🎯 **Personalized Greeting** — AI addresses user by name and skips asking for it if already known
- 🔒 **Skill-gated Access** — Application buttons locked below Level 3 skill rating

---

## Project Structure

```
swavalmbi-ai/
├── backend/
│   ├── agents/
│   │   ├── profiling_agent.py     # AI chat — collects skill, intent, location
│   │   └── vision_agent.py        # Score work sample photos
│   ├── api/
│   │   ├── routes_auth.py         # Register, login, OTP, Cognito
│   │   ├── routes_chat.py         # POST /chat/chat-profile
│   │   ├── routes_users.py        # User CRUD + delete from DynamoDB & Cognito
│   │   ├── routes_recommendations.py  # Jobs, schemes, training centers
│   │   ├── routes_vision.py       # Photo skill assessment
│   │   └── routes_voice.py        # Voice transcription / synthesis
│   ├── services/
│   │   ├── dynamodb_service.py    # DynamoDB CRUD helpers
│   │   ├── cognito_service.py     # Cognito register / login / admin delete
│   │   └── live_data.py           # NCS jobs, myScheme, SkillIndia APIs
│   ├── schemas/
│   │   └── models.py              # Pydantic request/response models
│   ├── data/
│   │   └── upskill-agent/
│   │       └── skill_india_training_centers.json  # Local fallback (~25MB)
│   └── scripts/
│       ├── setup_dynamodb.py
│       ├── setup_cognito.py
│       └── setup_voice_services.py
└── frontend/
    └── src/pages/
        ├── Login.tsx       # OTP + email/password auth
        ├── Register.tsx    # Email/password registration
        ├── Home.tsx        # Dashboard + recommendations
        ├── Assistant.tsx   # AI chat interface
        ├── Upskill.tsx     # Training center listings
        ├── Schemes.tsx     # Government scheme listings
        └── Profile.tsx     # User profile + skill level
```

---

## Prerequisites

- **Python 3.10+** (conda env: `ai4bharat`)
- **Node.js 18+** & **npm**
- **AWS credentials** with access to:
  - **Amazon Bedrock** (Claude Sonnet — ProfilingAgent + VisionAgent)
  - **Amazon DynamoDB** (`us-east-1`)
  - **Amazon Cognito** (User Pools — email/password auth)
  - **Amazon S3** (voice audio files)
  - **Amazon Transcribe, Polly, Translate** (voice features)

---

## First-Time Setup

### 1. Create AWS Resources

```bash
cd backend
conda activate ai4bharat

python scripts/setup_dynamodb.py      # Creates swavalambi_users table
python scripts/setup_cognito.py       # Creates Cognito User Pool + Client
python scripts/setup_voice_services.py  # Creates S3 bucket
```

> ⚠️ If your AWS session token has expired, run `aws sso login` first.

### 2. Configure `backend/.env`

```env
# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...        # optional — only if using SSO/temporary credentials
AWS_DEFAULT_REGION=us-east-1

# DynamoDB
DYNAMODB_TABLE=swavalambi_users

# Cognito (from setup_cognito.py output)
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# LLM — pick one
USE_ANTHROPIC=true
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL_ID=claude-3-5-sonnet-latest

# or Bedrock
USE_ANTHROPIC=false
BEDROCK_MODEL_ID=global.anthropic.claude-sonnet-4-5-20250929-v1:0

# Voice (optional)
VOICE_PROVIDER=aws
AWS_S3_BUCKET=swavalambi-voice
AWS_POLLY_VOICE_ID=Aditi
```

---

## Running Locally

### Backend

```bash
cd backend
conda activate ai4bharat
pip install -r requirements.txt   # first time only
python -m uvicorn main:app --reload --port 8000
```

Swagger UI → `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install       # first time only
npm run dev
```

App → `http://localhost:3000`

---

## API Endpoints

### Authentication

| Method | Path                        | Description                                              |
| ------ | --------------------------- | -------------------------------------------------------- |
| POST   | `/api/auth/register`        | Register with email + password → verification email sent |
| POST   | `/api/auth/verify-email`    | Confirm email with 6-digit code                          |
| POST   | `/api/auth/login`           | Login with email + password → JWT tokens                 |
| POST   | `/api/auth/resend-code`     | Resend verification code                                 |
| POST   | `/api/auth/forgot-password` | Start password reset                                     |
| POST   | `/api/auth/reset-password`  | Confirm reset with code                                  |
| POST   | `/api/auth/send-otp`        | Legacy OTP send (mock `123456`, testing only)            |
| POST   | `/api/auth/verify-otp`      | Legacy OTP verify (testing only)                         |

### User Management

| Method | Path                                | Description                     |
| ------ | ----------------------------------- | ------------------------------- |
| POST   | `/api/users/register`               | Upsert user profile in DynamoDB |
| GET    | `/api/users/{user_id}`              | Fetch user profile              |
| DELETE | `/api/users/{user_id}?email=...`    | Delete from DynamoDB + Cognito  |
| GET    | `/api/users/{user_id}/chat-history` | Fetch chat history              |
| DELETE | `/api/users/{user_id}/chat-history` | Clear chat history              |

### AI Services

| Method | Path                         | Description                                               |
| ------ | ---------------------------- | --------------------------------------------------------- |
| POST   | `/api/chat/chat-profile`     | Profiling conversation — collects skill, intent, location |
| POST   | `/api/vision/analyze-vision` | Score work sample photo                                   |
| POST   | `/api/recommendations/fetch` | Jobs / schemes / training centers (location-filtered)     |

### Voice Services

| Method | Path                    | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| POST   | `/api/voice/transcribe` | Audio → text (Transcribe / Sarvam) |
| POST   | `/api/voice/synthesize` | Text → speech (Polly / Sarvam)     |
| POST   | `/api/voice/translate`  | Translate text                     |

### Health

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

---

## User Flow

```
Register (email + password)  →  Verify email
    ↓
Login  →  Dashboard
    ↓
AI Chat Assistant:
  1. Greets by name (already known from DB)
  2. Asks profession/skill
  3. Asks intent: Job / Upskill / Loan
  4. If Job → asks preferred city/state
  5. Assesses experience (beginner / intermediate / advanced)
  6. If intermediate/advanced → asks to upload work photo
    ↓
Vision Agent scores photo  →  skill_rating saved to DynamoDB
    ↓
Dashboard shows personalised:
  - Jobs (filtered by skill + location via NCS)
  - Government Schemes (via myScheme.gov.in)
  - Training Centers (live Skill India API + local JSON fallback)
```

### Skill Lock Logic

| Skill Rating                | Access                                           |
| --------------------------- | ------------------------------------------------ |
| < 3 (Beginner)              | View-only — apply buttons locked                 |
| ≥ 3 (Intermediate/Advanced) | Full access — can apply for jobs, loans, schemes |

---

## Deleting a Test User

To fully reset a user (remove from both DynamoDB **and** Cognito):

```bash
# Via curl
curl -X DELETE "http://localhost:8000/api/users/9898989898?email=test@example.com"

# Or open Swagger UI → DELETE /api/users/{user_id}
```

---

## Recommendation Data Sources

| Data Type        | Source                                 | Fallback                           |
| ---------------- | -------------------------------------- | ---------------------------------- |
| Jobs             | NCS API (filtered by skill + location) | None                               |
| Schemes          | myScheme.gov.in API                    | None                               |
| Training Centers | Skill India Digital Hub API            | Local JSON (`data/upskill-agent/`) |

> The local JSON fallback is used when the live Skill India API returns no skill-matched centers (e.g. for "Plumber", the JSON has "Plumber - General" courses).

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | React 18, Vite, TypeScript, Vanilla CSS             |
| Backend        | FastAPI, Python 3.10+, Uvicorn                      |
| AI Agents      | AWS Bedrock / Anthropic Claude (Strands Agents SDK) |
| Authentication | AWS Cognito (User Pools, JWT)                       |
| Database       | Amazon DynamoDB (`swavalambi_users`)                |
| Voice          | AWS Transcribe + Polly + Translate / Sarvam AI      |
| Storage        | Amazon S3                                           |
| Jobs API       | NCS — National Career Service                       |
| Schemes API    | myScheme.gov.in                                     |
| Training API   | Skill India Digital Hub + local JSON fallback       |
