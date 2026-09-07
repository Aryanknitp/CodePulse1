# 🚀 Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup ✅

- [ ] Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
- [ ] Create free M0 cluster
- [ ] Create database user with username and password
- [ ] Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/codeforces`
- [ ] Add IP whitelist (allow 0.0.0.0/0 for all platforms)

### 2. Account Setup ✅

- [ ] Create Vercel account: https://vercel.com
- [ ] Create Render account: https://render.com
- [ ] Create Railway account: https://railway.app
- [ ] Create a Gemini API key (optional): https://aistudio.google.com/app/apikey

### 3. Local Testing ✅

- [ ] Run `npm install` in frontend, backend
- [ ] Run `pip install -r requirements.txt` in ai-service
- [ ] Create `.env` files in each folder (copy from `.env.example`)
- [ ] Test locally: `npm run dev` (frontend), `npm run dev` (backend), `uvicorn app.main:app` (ai-service)
- [ ] Verify API connectivity between services

### 4. Git Setup ✅

- [ ] Initialize git if not done: `git init`
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial commit - ready for deployment"`
- [ ] Create GitHub repository
- [ ] Push to GitHub: `git remote add origin <your-repo-url>` && `git push -u origin main`

---

## Deployment Steps

### Backend Deployment (Render) - Step 1

- [ ] Go to https://render.com/dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure:
  - Name: `codeforces-backend`
  - Runtime: Node
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add Environment Variables:
  ```
  NODE_ENV=production
  MONGODB_URI=<your-mongodb-atlas-url>
  PORT=4000
  JWT_SECRET=<random-32-char-string>
  AI_SERVICE_URL=<railway-service-url-added-later>
  CORS_ORIGIN=<vercel-frontend-url-added-later>
  ```
- [ ] Deploy
- [ ] Note Backend URL: `https://codeforces-backend.onrender.com`

### AI Service Deployment (Railway) - Step 2

- [ ] Go to https://railway.app/dashboard
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub"
- [ ] Select your repository
- [ ] Configure:
  - Root Directory: `ai-service`
  - Use `railway.json` config
- [ ] Add Environment Variables:
  ```
  GEMINI_API_KEY=<your-gemini-key-if-available>
  PORT=8000
  ```
- [ ] Deploy
- [ ] Note AI Service URL: `https://ai-service-production.up.railway.app`
- [ ] Update Backend on Render:
  - Add `AI_SERVICE_URL=<railway-url>`

### Frontend Deployment (Vercel) - Step 3

- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import GitHub repository
- [ ] Configure:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variables:
  ```
  VITE_API_BASE_URL=https://codeforces-backend.onrender.com
  ```
- [ ] Deploy
- [ ] Note Frontend URL
- [ ] Update Backend on Render:
  - Update `CORS_ORIGIN=<vercel-url>`

---

## Post-Deployment Testing

### Testing Backend

- [ ] Test health check: `curl https://codeforces-backend.onrender.com/health`
- [ ] Test AI service call: `curl -X POST https://codeforces-backend.onrender.com/api/v1/ai/test`

### Testing Frontend

- [ ] Open: https://your-vercel-url.vercel.app
- [ ] Check browser console for errors
- [ ] Test login flow
- [ ] Test Codeforces sync

### Testing Integrations

- [ ] Frontend → Backend: Check network requests
- [ ] Backend → MongoDB: Check database logs
- [ ] Backend → AI Service: Check request logs

### Monitoring

- [ ] Enable monitoring on Render: Settings → Logs
- [ ] Enable monitoring on Railway: Environment → Logs
- [ ] Enable monitoring on Vercel: Deployments → Logs

---

## Production Configuration Checklist

### Security ✅

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Change `AI_SERVICE_TOKEN` to a secure random string
- [ ] Set `COOKIE_SECURE=true` in production
- [ ] Update `CORS_ORIGIN` to only allow your Vercel domain
- [ ] Enable HTTPS on all services (automatic)

### Database ✅

- [ ] MongoDB Atlas: Set up automated backups
- [ ] Create database user with limited permissions
- [ ] Enable IP whitelist in MongoDB

### Email (if used) ✅

- [ ] Configure SMTP settings for password reset
- [ ] Test email sending
- [ ] Set up email templates

### Monitoring ✅

- [ ] Set up error tracking (optional: Sentry, LogRocket)
- [ ] Set up uptime monitoring (optional)
- [ ] Enable Render/Railway alerts for service issues

---

## Troubleshooting

### Frontend can't connect to backend

1. Check `VITE_API_BASE_URL` is set to Render backend URL
2. Verify CORS is enabled in backend
3. Check browser DevTools Network tab for 404/500 errors
4. Check Vercel & Render logs

### Backend can't connect to MongoDB

1. Verify `MONGODB_URI` connection string
2. Add Render/Railway IP to MongoDB Atlas whitelist
3. Check network connectivity: `curl -v mongodb+srv://...`

### Backend can't reach AI service

1. Verify `AI_SERVICE_URL` in backend environment
2. Check Railway service is running
3. Verify `AI_SERVICE_TOKEN` matches in both services

---

## Files Created for Deployment

✅ **vercel.json** - Vercel configuration
✅ **render.yaml** - Render configuration  
✅ **railway.json** - Railway configuration
✅ **DEPLOYMENT_GUIDE.md** - Detailed deployment guide
✅ **CLEANUP_AND_DEPLOYMENT.md** - Cleanup recommendations
✅ **DEPLOYMENT_CHECKLIST.md** - This file

---

## Rollback Instructions

If you need to rollback a deployment:

1. **Vercel**: Go to Deployments → Select previous version → Redeploy
2. **Render**: Go to Services → Rollback to previous version
3. **Railway**: Go to Deployments → Rollback

Or simply revert commit and push:

```bash
git revert <commit-hash>
git push origin main
```

---

## Support & Documentation

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

**Last Updated**: 2026-09-01
**Status**: Ready for deployment ✅
