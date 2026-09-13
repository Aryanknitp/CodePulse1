# Deployment Guide

## Overview

This application is deployed across multiple platforms for optimal performance and cost-efficiency:

- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express)
- **AI Service**: Railway (Python/FastAPI)
- **Database**: MongoDB Atlas

---

## Prerequisites

1. **MongoDB Atlas** - Cloud MongoDB
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string (mongodb+srv://...)

2. **Vercel Account** - https://vercel.com
3. **Render Account** - https://render.com
4. **Railway Account** - https://railway.app

---

## Step 1: Set up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a new project and cluster
3. Create a database user with username and password
4. Get the connection string in the format: `mongodb+srv://username:password@cluster.mongodb.net/codeforces?retryWrites=true&w=majority`
5. Save this for backend configuration

---

## Step 2: Deploy Backend on Render

### Using render.yaml:

```bash
git push origin main
```

Then connect your GitHub repo to Render and it will auto-deploy using `render.yaml`

### Manual Setup:

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `codeforces-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node src/server.js`)
   - **Root Directory**: `backend`

5. Add Environment Variables:

   ```
   NODE_ENV=production
   MONGODB_URI=<your_mongodb_atlas_connection_string>
   PORT=4000
   AI_SERVICE_URL=<your_railway_ai_service_url>
   JWT_SECRET=<generate_a_random_string>
   CORS_ORIGIN=<your_vercel_frontend_url>
   ```

6. Click "Create Web Service"
7. Once deployed, note the backend URL (e.g., `https://codeforces-backend.onrender.com`)

---

## Step 3: Deploy AI Service on Railway

### Using railway.json:

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your repository
5. Configure with `railway.json` (auto-detected)

### Manual Setup:

1. In Railway dashboard, create new service
2. Select "GitHub Repo"
3. Choose your repository
4. Configure:
   - **Root Directory**: `ai-service`
   - **Dockerfile**: `ai-service/Dockerfile`
   - **Port**: `8000`

5. Add Environment Variables:

   ```
   GEMINI_API_KEY=<your_gemini_api_key>  # optional
   PORT=8000
   ```

6. Deploy and note the AI Service URL (e.g., `https://ai-service-production.up.railway.app`)

---

## Step 4: Deploy Frontend on Vercel

Use one of these two configurations:

#### Recommended: set the Vercel Root Directory

### Option A: Git Push (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:

   ```
   VITE_API_BASE_URL=<your_render_backend_url>
   # e.g., https://codeforces-backend.onrender.com
   ```

6. Click "Deploy"

The repository also contains `frontend/vercel.json`, which provides the SPA
fallback for direct visits to client-side routes such as `/app/dashboard`.

#### Alternative: keep the repository root as the Root Directory

If Vercel is configured with `.` as the Root Directory, the root `vercel.json`
builds the application from `frontend/`, publishes `frontend/dist`, and applies
the same SPA fallback. In that setup, use the default Vercel build settings.

### Option B: Using vercel.json

Update `vercel.json` with your backend URL and deploy:

```bash
npm install -g vercel
cd frontend
vercel
```

---

## Environment Variables Summary

### Frontend (.env.local in Vercel)

```
VITE_API_BASE_URL=https://codeforces-backend.onrender.com
```

### Backend (.env in Render)

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codeforces
PORT=4000
AI_SERVICE_URL=https://ai-service-production.up.railway.app
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### AI Service (.env in Railway)

```
GEMINI_API_KEY=...  # optional
PORT=8000
```

---

## Monitoring & Logs

- **Vercel**: Dashboard → Deployments → Logs
- **Render**: Dashboard → Services → Logs
- **Railway**: Dashboard → Environment → Logs

---

## Rollback & Updates

### Git Workflow

1. Make changes locally
2. Commit and push to GitHub
3. All platforms auto-deploy on push to main branch
4. Rollback: Revert commit and push again

---

## Cost Estimation (Monthly)

| Service       | Plan          | Cost    |
| ------------- | ------------- | ------- |
| Vercel        | Pro           | $20     |
| Render        | Starter       | $7      |
| Railway       | Pay-as-you-go | $5-20   |
| MongoDB Atlas | Free/M0       | Free    |
| **Total**     |               | ~$32-47 |

---

## Troubleshooting

### Frontend can't connect to backend

- Check `VITE_API_BASE_URL` is set correctly
- Verify backend CORS is configured with your Vercel domain
- Check backend logs for connection errors

### Backend can't connect to MongoDB

- Verify `MONGODB_URI` connection string is correct
- Add your Railway/Render IP to MongoDB Atlas IP whitelist (Allow All: 0.0.0.0/0)
- Test connection locally first

### AI Service not responding

- Check Railway logs for errors
- Verify `AI_SERVICE_URL` in backend env vars
- Test AI Service URL directly: `curl https://your-ai-service-url/docs`

---

## Next Steps

1. ✅ Ensure MongoDB Atlas cluster is running
2. ✅ Deploy backend first
3. ✅ Deploy AI service
4. ✅ Update frontend environment variables
5. ✅ Deploy frontend
6. ✅ Test full workflow
