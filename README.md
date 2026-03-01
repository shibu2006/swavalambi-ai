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

---

## First-Time Setup

### 1. Create the DynamoDB Table

```bash
cd backend
conda activate ai4bharat
python scripts/setup_dynamodb.py
```

This creates the `swavalambi_users` table (on-demand billing, idempotent — safe to re-run).

> ⚠️ If your AWS session token has expired, run `aws sso login` first.

### 2. Configure `.env`

Make sure `backend/.env` contains:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...         # if using SSO/temporary credentials
AWS_DEFAULT_REGION=us-east-1
BEDROCK_MODEL_ID=global.anthropic.claude-sonnet-4-5-20250929-v1:0
DYNAMODB_TABLE=swavalambi_users
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

| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/api/auth/send-otp`         | Send OTP (mock: `123456`)                    |
| POST   | `/api/auth/verify-otp`       | Verify OTP → upsert user in DynamoDB         |
| POST   | `/api/users/register`        | Register / update user profile               |
| GET    | `/api/users/{user_id}`       | Fetch user profile from DynamoDB             |
| POST   | `/api/chat/chat-profile`     | AI profiling conversation (Bedrock Claude)   |
| POST   | `/api/vision/analyze-vision` | Skill assessment from photo (Bedrock Vision) |
| POST   | `/api/recommendations/fetch` | Get jobs / schemes / training centers        |
| GET    | `/health`                    | Health check                                 |

---

## User Flow

1. **Login** — Enter name + phone → OTP (`123456`) → user saved to DynamoDB
2. **AI Chat** — Profiling agent determines skill + intent (job / upskill / loan)
3. **Photo Upload** — VisionAgent scores the work sample → saves `skill_rating` to DynamoDB
4. **Home Dashboard** — Shows jobs, schemes, or training centres based on intent
5. **Profile** — Displays real name + skill level fetched from DynamoDB

### Lock Logic

| Level     | Access                                           |
| --------- | ------------------------------------------------ |
| < Level 3 | View-only — application buttons locked           |
| Level 3+  | Full access — can apply for jobs, loans, schemes |

---

## Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| Frontend     | React 18, Vite, TypeScript, Tailwind CSS           |
| Backend      | FastAPI, Python 3.10+, Uvicorn                     |
| AI           | AWS Bedrock (Claude Sonnet 4.5) via Strands Agents |
| Database     | Amazon DynamoDB (single table: `swavalambi_users`) |
| Jobs API     | NCS (National Career Service)                      |
| Schemes API  | myScheme.gov.in                                    |
| Training API | Skill India Digital Hub                            |
