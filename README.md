<<<<<<< HEAD

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
`http://localhost:3000`

Set:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Environment

Backend `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/codeforces_insights
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:3000

CODEFORCES_API_URL=https://codeforces.com/api

AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_TOKEN=change-me

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="CodePulse <no-reply@example.com>"

PASSWORD_RESET_URL=http://localhost:3000/reset-password
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
Frontend → http://localhost:3000
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

=======

<div align="center">

# 🚀 CodePulse

### AI Powered Competitive Programming Analytics Platform

Track • Analyze • Compare • Improve

<img src="https://img.shields.io/badge/MERN-Stack-success?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js"/>
<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react"/>
<img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb"/>
<img src="https://img.shields.io/badge/Express.js-REST%20API-black?style=for-the-badge&logo=express"/>
<img src="https://img.shields.io/badge/Open%20Source-Welcome-blue?style=for-the-badge"/>

</div>

---

# 📖 Overview

CodePulse is a full-stack Competitive Programming Analytics Platform that aggregates coding statistics from multiple competitive programming platforms into a single intelligent dashboard.

Instead of opening Codeforces, LeetCode, CodeChef, and GeeksforGeeks individually, users can connect all their accounts and visualize their complete coding journey in one place.

The platform provides advanced analytics, topic-wise progress, contest history, AI-powered recommendations, coding streaks, leaderboards, and personalized learning insights.

---

# ✨ Key Features

## 👤 User Dashboard

- Secure Authentication (JWT)
- Connect Multiple Coding Profiles
- Personalized Dashboard
- Dark / Light Theme
- Responsive UI
- Multi-device Support

---

# 🌍 Supported Platforms

✅ Codeforces

✅ LeetCode

✅ CodeChef

✅ GeeksforGeeks

✅ HackerRank

🚧 AtCoder

🚧 HackerEarth

---

# 📊 Analytics Dashboard

The dashboard provides complete coding insights.

### General Statistics

- Total Problems Solved
- Total Contests
- Current Rating
- Maximum Rating
- Global Rank
- Country Rank
- Acceptance Rate
- Coding Streak
- Longest Streak
- Activity Score

---

### Rating Analytics

- Current Rating
- Maximum Rating
- Rating Progress
- Rating Distribution
- Rating Prediction
- Best Contest
- Worst Contest
- Average Rating Gain
- Average Rating Loss

Interactive Charts

- Rating Timeline
- Rating Growth
- Contest Performance

---

### Contest Analytics

- Contest History
- Contest Ranking
- Contest Rating Change
- Best Rank
- Worst Rank
- Average Rank
- Rating Gain
- Rating Loss
- Participation Heatmap

---

### Problem Analytics

- Total Problems Solved
- Solved by Difficulty
- Solved by Platform
- Solved by Contest
- Recently Solved
- Hardest Solved Problems
- Most Attempted Problems

---

### Difficulty Distribution

Visualize solved questions by rating.

```
800
900
1000
1100
1200
1300
1400
...
3500
```

---

### Topic Analytics

Track every topic individually.

- Arrays
- Strings
- Math
- Binary Search
- Prefix Sum
- Sliding Window
- Two Pointer
- HashMap
- Greedy
- Stack
- Queue
- Linked List
- Tree
- BST
- Graph
- DFS
- BFS
- Dynamic Programming
- Bitmask
- Number Theory
- Geometry
- Segment Tree
- Fenwick Tree
- Trie
- Backtracking
- Constructive Algorithms
- Interactive
- Implementation
- Probability
- Flows

Each topic includes

- Questions Solved
- Average Difficulty
- Acceptance Rate
- Growth Graph

---

### Submission Analytics

Track

- Accepted
- Wrong Answer
- Time Limit Exceeded
- Runtime Error
- Compilation Error
- Memory Limit Exceeded
- Hacked
- Skipped

Visualized using Pie Charts.

---

### Programming Language Analytics

Languages Used

- GNU C++17
- C++
- Python
- Java
- Kotlin
- Rust
- Go

Statistics

- Most Used Language
- Success Rate
- Average Runtime

---

### Coding Activity

GitHub-style Heatmap

Daily Activity

Weekly Activity

Monthly Progress

Yearly Progress

Longest Streak

Current Streak

---

# 🤖 AI Features

The AI module analyzes user performance and generates personalized recommendations.

Example

```
Your strongest topic is Binary Search.

Weakest Topic:

Dynamic Programming

Recommendation

Solve

20 DP Problems

15 Segment Tree Problems

10 Bitmask Problems

Expected Rating Increase

+120
```

---

# 📈 Comparison Dashboard

Compare two users.

Example

```
Aryan

VS

Tourist
```

Comparison includes

- Rating
- Max Rating
- Problems Solved
- Contest Rank
- Tags
- Difficulty Distribution
- Contest History
- Activity Heatmap

---

# 🏆 Leaderboard

Global Website Leaderboard

- Highest Rating
- Most Solved
- Longest Streak
- Most Active
- Fastest Growing

---

# 📚 Problem Explorer

Search problems by

- Rating
- Difficulty
- Tags
- Contest
- Platform

Bookmark problems for future practice.

---

# 📅 Contest Calendar

Upcoming contests from

- Codeforces
- CodeChef
- LeetCode
- AtCoder

One-click registration links.

---

# 🎯 Company Interview Tracker

Track progress for

- Amazon
- Google
- Microsoft
- Adobe
- Atlassian
- Uber
- Flipkart

Also includes

- Blind 75
- NeetCode 150
- Striver A2Z
- CP31 Sheet

---

# 📂 Folder Structure

```
CodePulse

client

│── src
│    ├── assets
│    ├── components
│    ├── pages
│    ├── charts
│    ├── services
│    ├── hooks
│    ├── context
│    ├── redux
│    └── utils

server

│── config
│── controllers
│── middleware
│── routes
│── models
│── services
│── analytics
│── cache
│── jobs
│── utils

README.md
```

---

# ⚙️ Tech Stack

## Frontend

- React
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios
- React Query
- Recharts
- Framer Motion

---

## Backend

- Node.js
- Express.js
- JWT Authentication
- REST API
- Cron Jobs

---

## Database

- MongoDB
- Mongoose

---

## External APIs

### Codeforces API

- User Profile
- Rating History
- Contest History
- Submission History

### LeetCode GraphQL

- User Profile
- Solved Problems
- Contest Data

### CodeChef

- User Statistics

### GeeksforGeeks

- Coding Profile

---

# 🔐 Authentication

- JWT Authentication
- Refresh Tokens
- Protected Routes
- Password Hashing
- Secure Cookies

---

# 🚀 Future Roadmap

- AI Chat Assistant
- Daily Coding Planner
- Resume Generator
- Interview Readiness Score
- Company Recommendation Engine
- Coding Partner Matching
- Team Contests
- Live Notifications
- Progressive Web App
- Mobile App

---

# 🖥️ Installation

Clone Repository

```bash
git clone https://github.com/yourusername/CodePulse.git
```

Install Frontend

```bash
cd client

npm install

npm run dev
```

Install Backend

```bash
cd server

npm install

npm run dev
```

---

# 🔑 Environment Variables

```
PORT=

MONGO_URI=

JWT_SECRET=

CODEFORCES_API=

LEETCODE_API=

CODECHEF_API=

GFG_API=
```

---

# 🤝 Contributing

Contributions are welcome.

Fork the repository.

Create a feature branch.

Commit your changes.

Push to your branch.

Open a Pull Request.

---

# ⭐ Support

If you like this project

⭐ Star the repository

🍴 Fork it

🐞 Report issues

💡 Suggest new features

---

# 📄 License

Distributed under the MIT License.

---

# 👨‍💻 Author

## Aryan Kumar

B.Tech Computer Science & Engineering

National Institute of Technology Patna

Competitive Programmer

AI & Machine Learning Enthusiast

Full Stack Developer

---

<div align="center">

### ⭐ If you found this project helpful, don't forget to star the repository ⭐

Made with ❤️ by Aryan Kumar

</div>
>>>>>>> 9d8603a449b4b312cf015d262c85603b91d008e9
