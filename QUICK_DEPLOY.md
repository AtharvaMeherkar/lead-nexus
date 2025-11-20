# ⚡ Quick Deploy Guide - 30 Minutes to Live!

## 🎯 Recommended: Vercel (Frontend) + Render (Backend + DB)

**100% Free | No Credit Card | Easy Setup**

---

## 📋 Step 1: Deploy Frontend to Vercel (10 min)

### **Via Website (Easiest):**

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Click "Add New Project"**
4. **Import** your `lead-nexus` repository
5. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **Environment Variables:**
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - (We'll update this after backend is deployed)
7. **Click "Deploy"**
8. **Copy your frontend URL** (e.g., `https://lead-nexus-xyz.vercel.app`)

✅ **Frontend URL:** `https://________________.vercel.app`

---

## 📋 Step 2: Create Database on Render (5 min)

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click "New +" → "PostgreSQL"**
4. **Settings:**
   - Name: `leadnexus-db`
   - Database: `leadnexus`
   - Region: (choose closest)
   - Plan: **Free**
5. **Click "Create Database"**
6. **Wait 2-3 minutes**
7. **Copy "Internal Database URL"** (starts with `postgresql://`)

✅ **Database URL:** `postgresql://...` (save this!)

---

## 📋 Step 3: Deploy Backend to Render (15 min)

1. **In Render, click "New +" → "Web Service"**
2. **Connect** your GitHub `lead-nexus` repository
3. **Configure:**
   - Name: `lead-nexus-backend`
   - Region: (same as database)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables:**
   ```
   DATABASE_URL = <paste Internal Database URL>
   SECRET_KEY = <generate random string - use: openssl rand -hex 32>
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   CORS_ORIGINS = https://your-frontend.vercel.app
   ```
5. **Click "Create Web Service"**
6. **Wait 5-10 minutes** for deployment
7. **Copy backend URL** (e.g., `https://lead-nexus-backend.onrender.com`)

✅ **Backend URL:** `https://________________.onrender.com`

---

## 📋 Step 4: Update Frontend API URL

1. **Go to Vercel** → Your project → Settings → Environment Variables
2. **Update `VITE_API_URL`** to: `https://your-backend.onrender.com/api`
3. **Redeploy** (or wait for auto-redeploy)

---

## 📋 Step 5: Initialize Database & Create Admin

1. **Go to Render** → Your backend service → **Shell** tab
2. **Run:**
   ```bash
   python create_admin.py
   ```
3. **Enter admin email and password**

---

## ✅ Done! Your Site is Live!

**Frontend:** https://your-app.vercel.app  
**Backend:** https://your-backend.onrender.com  
**API Docs:** https://your-backend.onrender.com/docs

---

## 🔧 Generate Secret Key

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Or use online:** https://randomkeygen.com/

---

## ⚠️ Important Notes

- **Render free tier:** Services sleep after 15 min (wake on first request - takes ~30 seconds)
- **Database:** Free for 90 days, then $7/month (or migrate to Supabase free tier)
- **Auto-deploy:** Both platforms auto-deploy on `git push`!

---

## 🎉 That's It!

Your Lead-Nexus platform is now live and accessible worldwide! 🌍

**Need detailed instructions?** See [FREE_HOSTING_GUIDE.md](./FREE_HOSTING_GUIDE.md)

