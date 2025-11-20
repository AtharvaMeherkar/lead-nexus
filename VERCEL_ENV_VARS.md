# 🔐 Vercel Environment Variables

## Required Environment Variable

```
VITE_API_URL = https://your-backend-url.onrender.com/api
```

**⚠️ Important:** 
- Replace `your-backend-url.onrender.com` with your actual Render backend URL
- Must include `/api` at the end
- Update this AFTER backend is deployed

---

## How to Add in Vercel

1. Go to your Vercel project
2. Click "Settings" → "Environment Variables"
3. Click "Add New"
4. Key: `VITE_API_URL`
5. Value: `https://your-backend.onrender.com/api`
6. Environment: Production (and Preview if you want)
7. Click "Save"
8. Go to "Deployments" → Redeploy latest deployment

---

## Example (After Backend is Deployed)

```
VITE_API_URL = https://lead-nexus-backend.onrender.com/api
```

---

**Update this after Step 4 (Backend Deployment) in DEPLOYMENT_INSTRUCTIONS.md**

