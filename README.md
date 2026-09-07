# CodePulse

Full-stack Codeforces analytics and AI coaching application.

## Stack

- Frontend: React + Vite + JavaScript/JSX
- Backend: Node.js + Express.js + JavaScript
- Database: MongoDB
- External data: Codeforces API
- AI service: Python + FastAPI
- LLM: Gemini API when configured, deterministic fallback otherwise
- Background sync: node-cron; can be extended with Redis/BullMQ

## Architecture

```text
React
  ↓
Node + Express
  ├── MongoDB
  ├── Codeforces API
  └── Python FastAPI
          ↓
        LLM
```

## Features connected to the existing frontend

- Account registration/login/logout
- Email OTP verification
- Password reset
- Codeforces handle validation
- Codeforces ownership verification
- Profile synchronization
- Incremental submission persistence
- Problemset synchronization
- Contest/rating synchronization
- Rating analytics
- Difficulty analytics
- Topic analytics and weakness scoring
- Personalized recommendations
- Daily practice
- Recommendation completion/skip
- Initial recommendations + AI insight generated as part of first sync
- AI insights
- AI Coach conversations
- Weekly AI report
- Progress analytics
- Contest detail lookup
- Profile/settings
- Account deletion
- Automatic sync
- Sync status

## Setup without Docker

### 1. MongoDB

Run MongoDB locally or create a MongoDB Atlas database.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend:
`http://localhost:4000`

### 3. AI service

```bash
cd ai-service
cp .env.example .env
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

AI service:
`http://localhost:8000`

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend:
`http://localhost:5173`

Set:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Environment

Backend `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/codeforces_insights
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:5173

CODEFORCES_API_URL=https://codeforces.com/api

AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_TOKEN=change-me

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="CodePulse <no-reply@example.com>"

PASSWORD_RESET_URL=http://localhost:5173/reset-password
```

AI `.env`:

```env
PORT=8000
AI_SERVICE_TOKEN=change-me
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
```

For real email verification, configure SMTP.

For real AI generation, configure `GEMINI_API_KEY` from Google AI Studio.

## Authentication flow

```text
Register
→ Email OTP
→ Email verified
→ Connect Codeforces
→ Ownership verification
→ Initial sync
→ Dashboard
```

The email OTP is hashed before persistence and expires.

## Codeforces ownership flow

The backend:

1. Checks the handle using Codeforces `user.info`.
2. Generates a verification challenge.
3. The frontend displays the challenge.
4. The user adds the challenge to the supported public Codeforces profile field.
5. The backend fetches the profile again and checks the challenge.
6. Only then is synchronization enabled.

## Synchronization

The backend stores individual submissions rather than only a solved count.

Example:

```text
Codeforces
  ↓
user.status
  ↓
MongoDB submissions
  ↓
analytics
  ↓
recommendations
  ↓
AI
```

A later sync upserts submissions by `(userId, submissionId)`, so repeated synchronization does not duplicate attempts.

The Codeforces API currently documents `user.info`, `user.status`, `user.rating`, `problemset.problems`, and `contest.standings`, and states that API requests are limited to one call every two seconds. The backend serializes Codeforces requests to respect that limit.

## AI pipeline

The backend builds a user context from:

- current rating
- max rating
- solved/submission data
- difficulty distribution
- DSA topic scores
- contest history
- recent recommendation activity
- progress

It sends that context to Python FastAPI.

Python either:

- uses the configured LLM, or
- returns a deterministic local response when no API key is configured.

The frontend never sees the Gemini key.

## Docker

Create:

```text
backend/.env
ai-service/.env
```

then:

```bash
docker compose up --build
```

Services:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:4000
AI       → http://localhost:8000
MongoDB  → localhost:27017
```

## Frontend compatibility

The backend implements the REST paths already used by the supplied frontend:

```text
/api/v1/auth/*
/api/v1/codeforces/*
/api/v1/analytics/*
/api/v1/problems/*
/api/v1/recommendations/*
/api/v1/ai/*
/api/v1/progress/*
/api/v1/contests/*
/api/v1/users/*
```

The frontend's API service layer remains the integration boundary.

## Verification

The source package is statically checked for:

- backend JavaScript syntax
- Python compilation
- frontend relative-import consistency
- route/API contract consistency

Live production transactions still require your MongoDB, SMTP, Codeforces, and optional Gemini credentials.

## Codeforces API note

Do not scrape or reproduce full third-party problem statements. Store metadata and link users to the canonical Codeforces problem page.

## Project structure

```text
codeforces-insights/
├── frontend/
├── backend/
├── ai-service/
├── docs/
├── docker-compose.yml
└── README.md
```
