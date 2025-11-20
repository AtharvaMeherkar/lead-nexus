# 🚀 Free Hosting Guide - Lead-Nexus

## 🎯 Best Free Hosting Options

### **Recommended Stack (100% Free):**

- **Frontend:** Vercel (Best for React)
- **Backend:** Render (Free tier)
- **Database:** Render PostgreSQL (Free tier) or Supabase (Free tier)

---

## 📋 Option 1: Vercel (Frontend) + Render (Backend + Database) ⭐ RECOMMENDED

### **Why This Combination?**

- ✅ **100% Free** (with generous limits)
- ✅ **Easy setup**
- ✅ **Automatic deployments**
- ✅ **Fast performance**
- ✅ **No credit card required**

---

## 🎨 Part 1: Deploy Frontend to Vercel

### **Step 1: Prepare Frontend for Production**

1. **Update API URL for production:**

Create/update `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

2. **Update `frontend/src/utils/api.ts`** to use environment variable:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  // ... rest of config
});
```

### **Step 2: Deploy to Vercel**

**Method A: Via Vercel Website (Easiest)**

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import your GitHub repository:**
   - Select `lead-nexus` repository
   - Click "Import"
5. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. **Add Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (we'll get this after backend deploy)
7. **Click "Deploy"**

**Method B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? lead-nexus-frontend
# - Directory? ./
# - Override settings? No
```

### **Step 3: Get Frontend URL**

After deployment, Vercel will give you a URL like:

- `https://lead-nexus.vercel.app`

**Save this URL** - you'll need it for backend CORS configuration.

---

## ⚙️ Part 2: Deploy Backend to Render

### **Step 1: Prepare Backend for Production**

1. **Create `backend/render.yaml`** (optional, for easier setup):

```yaml
services:
  - type: web
    name: lead-nexus-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: leadnexus-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: ALGORITHM
        value: HS256
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: 30
      - key: CORS_ORIGINS
        value: https://lead-nexus.vercel.app,https://your-frontend-url.vercel.app
```

2. **Update `backend/app/main.py`** CORS settings:

```python
# Make sure CORS allows your Vercel domain
origins = [
    "https://lead-nexus.vercel.app",
    "https://your-frontend-url.vercel.app",
    "http://localhost:5174",  # For local development
    "http://127.0.0.1:5174",
]
```

### **Step 2: Create PostgreSQL Database on Render**

1. **Go to:** https://render.com
2. **Sign up/Login** (use GitHub)
3. **Click "New +" → "PostgreSQL"**
4. **Configure Database:**
   - **Name:** `leadnexus-db`
   - **Database:** `leadnexus`
   - **User:** (auto-generated)
   - **Region:** Choose closest to you
   - **PostgreSQL Version:** 14 or 15
   - **Plan:** Free
5. **Click "Create Database"**
6. **Wait for database to be ready** (2-3 minutes)
7. **Copy the "Internal Database URL"** - you'll need this!

### **Step 3: Deploy Backend to Render**

1. **Click "New +" → "Web Service"**
2. **Connect your GitHub repository:**
   - Select `lead-nexus` repository
   - Click "Connect"
3. **Configure Service:**
   - **Name:** `lead-nexus-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables:**
   ```
   DATABASE_URL = <paste Internal Database URL from step above>
   SECRET_KEY = <generate a random secret key>
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 30
   CORS_ORIGINS = https://lead-nexus.vercel.app,https://your-frontend-url.vercel.app
   ```
5. **Click "Create Web Service"**
6. **Wait for deployment** (5-10 minutes)

### **Step 4: Run Database Migrations**

After backend is deployed:

1. **Go to your Render backend service**
2. **Click "Shell" tab**
3. **Run:**

   ```bash
   alembic upgrade head
   ```

   (If you have migrations)

   Or manually create tables:

   ```bash
   python -c "from app.db.database import engine, Base; Base.metadata.create_all(bind=engine)"
   ```

### **Step 5: Create Admin User**

1. **In Render Shell, run:**
   ```bash
   python create_admin.py
   ```
2. **Enter admin credentials when prompted**

### **Step 6: Get Backend URL**

After deployment, Render will give you a URL like:

- `https://lead-nexus-backend.onrender.com`

**Update your Vercel environment variable:**

1. Go to Vercel project settings
2. Environment Variables
3. Update `VITE_API_URL` to: `https://lead-nexus-backend.onrender.com/api`
4. Redeploy frontend

---

## 🔧 Part 3: Update Configuration Files

### **Update Backend CORS (if not done)**

Edit `backend/app/main.py`:

```python
# In your CORS middleware
origins = [
    "https://lead-nexus.vercel.app",  # Your Vercel URL
    "https://your-frontend-url.vercel.app",
    "http://localhost:5174",  # Keep for local dev
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Update Frontend API URL**

Make sure `frontend/src/utils/api.ts` uses environment variable:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## 🗄️ Alternative: Supabase (Database) - Easier Option

If Render PostgreSQL is too complex, use Supabase:

### **Step 1: Create Supabase Project**

1. **Go to:** https://supabase.com
2. **Sign up/Login**
3. **Click "New Project"**
4. **Fill details:**
   - **Name:** `lead-nexus`
   - **Database Password:** (choose strong password)
   - **Region:** Choose closest
5. **Click "Create new project"**
6. **Wait 2-3 minutes** for setup

### **Step 2: Get Database URL**

1. **Go to Project Settings → Database**
2. **Copy "Connection string" → "URI"**
3. **Use this as `DATABASE_URL` in Render**

---

## 📝 Complete Deployment Checklist

### **Before Deployment:**

- [ ] Update CORS origins in backend
- [ ] Set up environment variables
- [ ] Test locally with production-like settings
- [ ] Remove any hardcoded localhost URLs

### **Frontend (Vercel):**

- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Set `VITE_API_URL` environment variable
- [ ] Deploy and verify

### **Backend (Render):**

- [ ] Create PostgreSQL database
- [ ] Create web service
- [ ] Set all environment variables
- [ ] Deploy backend
- [ ] Run database migrations
- [ ] Create admin user

### **After Deployment:**

- [ ] Test frontend → backend connection
- [ ] Test login/registration
- [ ] Test lead search
- [ ] Verify CORS is working
- [ ] Check all features work

---

## 🔍 Troubleshooting

### **CORS Errors**

**Error:** `Access-Control-Allow-Origin header is missing`

**Fix:**

1. Check backend CORS origins include your Vercel URL
2. Make sure `allow_credentials=True` matches CORS config
3. Restart backend service on Render

### **Database Connection Errors**

**Error:** `Could not connect to database`

**Fix:**

1. Use "Internal Database URL" from Render (not external)
2. Check database is running (green status)
3. Verify `DATABASE_URL` environment variable is correct

### **Frontend Can't Connect to Backend**

**Error:** `Network Error` or `Failed to fetch`

**Fix:**

1. Check `VITE_API_URL` in Vercel environment variables
2. Verify backend URL is correct (ends with `/api`)
3. Check backend is running (green status on Render)
4. Test backend URL directly: `https://your-backend.onrender.com/docs`

### **Build Failures**

**Frontend Build Fails:**

- Check Node.js version (should be 18+)
- Check all dependencies in `package.json`
- Review build logs in Vercel

**Backend Build Fails:**

- Check Python version (should be 3.13+)
- Check all dependencies in `requirements.txt`
- Review build logs in Render

---

## 🎯 Quick Deployment Commands

### **For Vercel (Frontend):**

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### **For Render (Backend):**

Just connect GitHub repository - Render auto-deploys on push!

---

## 📊 Free Tier Limits

### **Vercel:**

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Perfect for frontend hosting

### **Render:**

- ✅ 750 hours/month (free tier)
- ✅ Auto-sleeps after 15 min inactivity (wakes on request)
- ✅ Free PostgreSQL database (90 days, then $7/month or migrate)

### **Supabase:**

- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ Perfect for small projects

---

## 🔄 Continuous Deployment

Both Vercel and Render automatically deploy when you push to GitHub!

**Workflow:**

1. Make changes locally
2. Commit: `git commit -m "Your changes"`
3. Push: `git push`
4. Vercel & Render auto-deploy! 🚀

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Backend API docs accessible at `/docs`
- [ ] Can register new user
- [ ] Can login
- [ ] Can search leads
- [ ] Can upload CSV (admin)
- [ ] All features work

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

## 🚀 Alternative Free Hosting Options

### **Frontend Alternatives:**

- **Netlify** - Similar to Vercel
- **GitHub Pages** - Free but needs build setup
- **Cloudflare Pages** - Fast and free

### **Backend Alternatives:**

- **Railway** - Free tier with $5 credit
- **Fly.io** - Free tier available
- **PythonAnywhere** - Free tier (limited)

### **Database Alternatives:**

- **Neon** - Serverless PostgreSQL (free tier)
- **ElephantSQL** - Free PostgreSQL (20MB)
- **Supabase** - Free tier (500MB)

---

**Your project will be live and accessible worldwide! 🌍**
