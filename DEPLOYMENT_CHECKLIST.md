# ✅ Production Deployment Checklist

## 🎯 Pre-Deployment Checklist

### **Code Preparation:**

- [x] All features tested and working
- [x] No console errors
- [x] Environment variables configured
- [x] CORS settings updated for production
- [x] Database migrations ready
- [x] Admin user creation script ready

### **Security:**

- [x] Strong SECRET_KEY set
- [x] No hardcoded credentials
- [x] .env files in .gitignore
- [x] CORS properly configured
- [x] Password hashing working

### **Configuration:**

- [x] Frontend API URL uses environment variable
- [x] Backend CORS accepts production frontend URL
- [x] Database URL configured
- [x] All environment variables documented

---

## 🚀 Deployment Steps

### **1. Frontend (Vercel) - 10 minutes**

1. [ ] Push code to GitHub
2. [ ] Go to https://vercel.com
3. [ ] Sign up/Login with GitHub
4. [ ] Click "Add New Project"
5. [ ] Import `lead-nexus` repository
6. [ ] Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. [ ] Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
8. [ ] Click "Deploy"
9. [ ] Wait for deployment (2-3 minutes)
10. [ ] Copy frontend URL (e.g., `https://lead-nexus.vercel.app`)

**✅ Frontend URL:** `https://________________.vercel.app`

---

### **2. Database (Render) - 5 minutes**

1. [ ] Go to https://render.com
2. [ ] Sign up/Login with GitHub
3. [ ] Click "New +" → "PostgreSQL"
4. [ ] Configure:
   - Name: `leadnexus-db`
   - Database: `leadnexus`
   - Region: (choose closest)
   - Plan: Free
5. [ ] Click "Create Database"
6. [ ] Wait for database (2-3 minutes)
7. [ ] Copy "Internal Database URL"

**✅ Database URL:** `postgresql://...` (save this!)

---

### **3. Backend (Render) - 15 minutes**

1. [ ] Go to Render dashboard
2. [ ] Click "New +" → "Web Service"
3. [ ] Connect GitHub repository: `lead-nexus`
4. [ ] Configure:
   - Name: `lead-nexus-backend`
   - Region: (same as database)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. [ ] Add Environment Variables:
   ```
   DATABASE_URL = <paste Internal Database URL>
   SECRET_KEY = <generate random string>
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   CORS_ORIGINS = https://your-frontend.vercel.app
   ```
6. [ ] Click "Create Web Service"
7. [ ] Wait for deployment (5-10 minutes)
8. [ ] Copy backend URL

**✅ Backend URL:** `https://________________.onrender.com`

---

### **4. Update Frontend API URL**

1. [ ] Go to Vercel project settings
2. [ ] Environment Variables
3. [ ] Update `VITE_API_URL` to: `https://your-backend.onrender.com/api`
4. [ ] Redeploy frontend

---

### **5. Create Admin User**

**✅ Database tables are created automatically on first startup** (no manual initialization needed)

**🎯 RECOMMENDED: Using API Endpoint (Works on Free Plan - No Shell Needed!)**

1. [ ] Go to your backend API docs: `https://lead-nexus-backend.onrender.com/docs`
2. [ ] Find **`POST /api/public/create-admin`** endpoint
3. [ ] Click **"Try it out"**
4. [ ] Enter in request body:
   ```json
   {
     "email": "admin@yourdomain.com",
     "password": "yourpassword123"
   }
   ```
5. [ ] Click **"Execute"**
6. [ ] You should see: `"Admin user 'admin@yourdomain.com' created successfully"`

**Alternative: Using cURL (Command Line)**

```bash
curl -X POST https://lead-nexus-backend.onrender.com/api/public/create-admin \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@yourdomain.com\", \"password\": \"yourpassword123\"}"
```

**📖 See `CREATE_ADMIN_VIA_API.md` for detailed instructions and other methods**

---

**⚠️ Note:** Render's free plan doesn't support shell access. Use the API endpoint method above instead!

---

### **6. Final Testing**

1. [ ] Visit frontend URL
2. [ ] Test registration
3. [ ] Test login
4. [ ] Test lead search
5. [ ] Test admin panel (login as admin)
6. [ ] Test CSV upload
7. [ ] Verify all features work

---

## 🎉 Success!

Your application is now live and accessible worldwide!

**Frontend:** https://your-app.vercel.app  
**Backend API:** https://your-backend.onrender.com  
**API Docs:** https://your-backend.onrender.com/docs

---

## 📝 Important Notes

- **Render free tier:** Services sleep after 15 min inactivity (wake on first request)
- **Database:** Free tier lasts 90 days, then $7/month (or migrate to Supabase)
- **Vercel:** Unlimited deployments, 100GB bandwidth/month
- **Auto-deploy:** Both platforms auto-deploy on git push!

---

## 🔄 Updating Your Live Site

1. Make changes locally
2. `git add .`
3. `git commit -m "Your changes"`
4. `git push`
5. Vercel & Render auto-deploy! 🚀

---

**Need help? Check FREE_HOSTING_GUIDE.md for detailed instructions!**
