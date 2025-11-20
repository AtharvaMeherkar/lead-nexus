# 🔐 Render Environment Variables

Copy these environment variables when setting up your Render backend service:

## Required Environment Variables

```
DATABASE_URL = <paste Internal Database URL from Render PostgreSQL>
```

```
SECRET_KEY = <generate random 32-character string>
```

**Generate SECRET_KEY:**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" (32 characters)
- Or PowerShell: `-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})`

```
ALGORITHM = HS256
```

```
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
```

```
CORS_ORIGINS = https://your-frontend-url.vercel.app
```

**⚠️ Important:** Replace `your-frontend-url.vercel.app` with your actual Vercel URL after deploying frontend!

```
ENVIRONMENT = production
```

---

## How to Add in Render

1. Go to your Render backend service
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable one by one
5. Click "Save Changes"
6. Service will automatically redeploy

---

## Example (After Frontend is Deployed)

```
DATABASE_URL = postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/leadnexus
SECRET_KEY = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
CORS_ORIGINS = https://lead-nexus-abc123.vercel.app
ENVIRONMENT = production
```

---

**Save this file for reference!**

