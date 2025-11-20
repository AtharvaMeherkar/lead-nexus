# 🔧 Backend Troubleshooting Guide

## Issue: "Cannot GET /" or "Cannot GET /docs"

This usually means the backend is crashing during startup. Here's how to fix it:

---

## ✅ Step 1: Check Render Logs

1. **Go to Render** → Your backend service
2. **Click "Logs" tab**
3. **Look for error messages** (especially red text)
4. **Copy the full error** and check below

---

## 🔍 Common Issues & Fixes

### **Issue 1: Database Connection Error**

**Error:** `Could not connect to database` or `psycopg` errors

**Fix:**
1. Go to Render → Your **database** service
2. Copy the **"Internal Database URL"** (NOT external)
3. Go to Render → Your **backend** service → **Environment** tab
4. Update `DATABASE_URL` with the **Internal Database URL**
5. Save and redeploy

**Important:** Use "Internal Database URL" - it looks like:
```
postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/leadnexus
```

---

### **Issue 2: CORS Configuration Error**

**Error:** `CORS_ORIGINS` parsing errors

**Fix:**
1. Go to Render → Your **backend** service → **Environment** tab
2. Check `CORS_ORIGINS` value
3. It should be: `https://your-frontend.vercel.app`
   - Replace `your-frontend` with your actual Vercel URL
   - No quotes, no spaces
4. Save and redeploy

**Example:**
```
CORS_ORIGINS = https://lead-nexus-abc123.vercel.app
```

---

### **Issue 3: Missing Environment Variables**

**Error:** `SECRET_KEY` or other env vars missing

**Fix:**
1. Go to Render → Your **backend** service → **Environment** tab
2. Make sure these are set:
   ```
   DATABASE_URL = <Internal Database URL>
   SECRET_KEY = <random 32-char string>
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   CORS_ORIGINS = https://your-frontend.vercel.app
   ENVIRONMENT = production
   ```
3. Save and redeploy

---

### **Issue 4: Backend Crashes on Startup**

**Error:** Backend starts but crashes immediately

**Fix:**
1. Check Render logs for the exact error
2. Common causes:
   - Database connection failing
   - Missing environment variables
   - Import errors
3. Check the "Events" tab in Render to see if it's restarting

---

## 🧪 Test Your Backend

After fixing issues, test these URLs:

1. **Root:** `https://your-backend.onrender.com/`
   - Should return: `{"message": "Lead-Nexus API", ...}`

2. **Health:** `https://your-backend.onrender.com/health`
   - Should return: `{"status": "ok"}`

3. **Docs:** `https://your-backend.onrender.com/docs`
   - Should show FastAPI documentation page

4. **API:** `https://your-backend.onrender.com/api/public/stats`
   - Should return lead statistics

---

## 📋 Quick Checklist

- [ ] Database is running (green status)
- [ ] Using "Internal Database URL" (not external)
- [ ] All environment variables are set
- [ ] `CORS_ORIGINS` includes your Vercel URL
- [ ] Backend service shows "Live" status
- [ ] No errors in Render logs

---

## 🆘 Still Not Working?

1. **Check Render Logs** - Look for the exact error message
2. **Check Backend Status** - Is it "Live" or "Failed"?
3. **Try Manual Restart** - Click "Manual Deploy" → "Deploy latest commit"
4. **Check Database** - Is it "Available" (green)?

---

**Share the error from Render logs if you need more help!**

