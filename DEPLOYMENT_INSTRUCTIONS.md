# 🚀 Deployment Instructions - What You Need to Do

## ✅ What Has Been Prepared (Automated)

I've prepared everything that can be done automatically:

- ✅ **Frontend API configuration** - Uses environment variables
- ✅ **Backend CORS configuration** - Ready for production URLs
- ✅ **Render configuration** (`backend/render.yaml`) - Ready to use
- ✅ **Vercel configuration** (`frontend/vercel.json`) - Ready to use
- ✅ **Python runtime** (`backend/runtime.txt`) - Specified
- ✅ **Environment variable templates** - Created

---

## 📋 What YOU Need to Do (Manual Steps)

### **Step 1: Push Code to GitHub** ⚠️ REQUIRED

```powershell
cd "C:\Users\athar\OneDrive\Desktop\CV PROJECTS\leadnexus_prototype _final\lead-nexus-project"

# Add all files
git add .

# Commit
git commit -m "Prepare for production deployment"

# Push to GitHub
git push origin main
```

---

### **Step 2: Deploy Frontend to Vercel** (10 minutes)

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import** your `lead-nexus` repository
5. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
6. **Environment Variables:**
   - Click "Add" → Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` 
   - ⚠️ **Leave this for now** - we'll update after backend is deployed
7. **Click "Deploy"**
8. **Wait 2-3 minutes**
9. **Copy your frontend URL** (e.g., `https://lead-nexus-xyz.vercel.app`)

**✅ Save this URL:** `https://________________.vercel.app`

---

### **Step 3: Create Database on Render** (5 minutes)

1. **Go to:** https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +" → "PostgreSQL"**
4. **Configure:**
   - **Name:** `leadnexus-db`
   - **Database:** `leadnexus`
   - **Region:** Choose closest to you
   - **PostgreSQL Version:** 14 or 15
   - **Plan:** Free
5. **Click "Create Database"**
6. **Wait 2-3 minutes** for database to be ready
7. **Copy "Internal Database URL"** (starts with `postgresql://`)

**✅ Save this URL:** postgresql://leadnexus_user:3iCGRaiY85GNF2WN72zMaKM22SJJrRyY@dpg-d4fl9dumcj7s73aqerd0-a/leadnexus

---

### **Step 4: Deploy Backend to Render** (15 minutes)

1. **In Render, click "New +" → "Web Service"**
2. **Connect** your GitHub `lead-nexus` repository
3. **Configure:**
   - **Name:** `lead-nexus-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables:**
   ```
   DATABASE_URL = <paste Internal Database URL from Step 3>
   SECRET_KEY = <generate random string - see below>
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   CORS_ORIGINS = https://your-frontend-url.vercel.app
   ENVIRONMENT = production
   ```
   
   **Generate SECRET_KEY:**
   - Go to: https://randomkeygen.com/
   - Copy a "CodeIgniter Encryption Keys" (32 characters)
   - Or use PowerShell: `-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})`
   
5. **Click "Create Web Service"**
6. **Wait 5-10 minutes** for deployment
7. **Copy backend URL** (e.g., `https://lead-nexus-backend.onrender.com`)

**✅ Save this URL:** `https://________________.onrender.com`

---

### **Step 5: Update Frontend API URL** (2 minutes)

1. **Go to Vercel** → Your project → **Settings** → **Environment Variables**
2. **Edit `VITE_API_URL`**
3. **Update value to:** `https://your-backend.onrender.com/api` (use your actual backend URL)
4. **Save**
5. **Go to Deployments tab** → Click "..." on latest deployment → **Redeploy**

---

### **Step 6: Initialize Database** (5 minutes)

1. **Go to Render** → Your backend service → **Shell** tab
2. **Run:**
   ```bash
   python create_admin.py
   ```
3. **Enter admin credentials:**
   - Email: `admin@leadnexus.com` (or your choice)
   - Password: (choose strong password, min 8 characters)

---

### **Step 7: Test Your Live Site** (5 minutes)

1. **Visit your frontend URL:** `https://your-app.vercel.app`
2. **Test registration** - Create a new account
3. **Test login** - Login with your account
4. **Test admin login** - Login with admin credentials
5. **Test lead search** - Search for leads
6. **Test CSV upload** (as admin) - Upload a CSV file

---

## 🎉 Success!

Your Lead-Nexus platform is now live! 🌍

**Frontend:** https://your-app.vercel.app  
**Backend:** https://your-backend.onrender.com  
**API Docs:** https://your-backend.onrender.com/docs

---

## ⚠️ Important Notes

### **Render Free Tier:**
- Services **sleep after 15 minutes** of inactivity
- **First request** after sleep takes ~30 seconds to wake up
- This is normal for free tier!

### **Database:**
- Free for **90 days**
- After that, **$7/month** or migrate to Supabase (free tier)

### **Auto-Deploy:**
- Both Vercel and Render **auto-deploy** when you push to GitHub!
- Just `git push` and your site updates automatically! 🚀

---

## 🔧 Troubleshooting

### **CORS Error?**
- Make sure `CORS_ORIGINS` in Render includes your exact Vercel URL
- Restart backend service on Render

### **Database Connection Error?**
- Use "Internal Database URL" (not external)
- Check database status is "Available"

### **Frontend Can't Connect?**
- Check `VITE_API_URL` in Vercel matches your backend URL
- Make sure backend URL ends with `/api`
- Test backend directly: `https://your-backend.onrender.com/docs`

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Check build logs** in both platforms if deployment fails

---

**You're all set! Follow these steps and your site will be live! 🎊**

