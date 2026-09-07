# CodePulse Backend

Node.js + Express + MongoDB backend for the existing React frontend.

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:4000`.

## Core integration

- `/api/v1/auth/*` authentication + email OTP
- `/api/v1/codeforces/*` handle verification + synchronization
- `/api/v1/analytics/*` dashboard analytics
- `/api/v1/problems/*` problem explorer/history
- `/api/v1/recommendations/*` personalized practice
- `/api/v1/ai/*` AI coach/insights/reports
- `/api/v1/progress/*` progress
- `/api/v1/contests/*` contests
- `/api/v1/users/*` profile/settings/account deletion

After a successful Codeforces verification, the initial sync imports profile, submissions, problem metadata and contests, then creates the first daily recommendations and AI insight before completing the setup flow.

## Email

Configure SMTP for real email OTP and password reset delivery. If SMTP is not configured, the server logs that email delivery is unavailable rather than silently pretending it was sent.

## Codeforces

The service uses the public Codeforces API for `user.info`, `user.status`, `user.rating`, `problemset.problems`, and lazy contest standings. Codeforces currently documents a global API request limit of one request every two seconds, so the backend serializes Codeforces calls through a throttled request queue.

## Verification

The current frontend asks the user to add the generated verification code to a Codeforces profile field and then presses Verify Ownership. The backend checks public profile fields for the challenge before enabling synchronization.

# Backend + AI Integration

The supplied frontend expects the REST paths in `backend/src/routes`.

Flow:

React → Express → MongoDB / Codeforces API
React → Express → Python FastAPI → LLM

The Node service owns authentication, persistence, Codeforces synchronization, analytics, recommendations, conversations and authorization. The Python service is stateless and receives only the authenticated user's summarized analytics/context.

Codeforces synchronization stores individual submissions and problem metadata, which allows incremental updates and user-specific analytics. The Codeforces API exposes `user.info`, `user.status`, `user.rating`, and `problemset.problems`; requests are throttled to respect the current API rate limit.
