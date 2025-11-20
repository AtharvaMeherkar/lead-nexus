# 👤 Create Admin User via API (No Shell Needed!)

## ✅ Perfect Solution for Free Render Plan!

Since Render's free plan doesn't support shell access, you can create an admin user **directly via HTTP request** - no shell needed!

---

## 🚀 Method 1: Using Browser (Easiest)

### Step 1: Go to API Documentation

1. Open your backend URL in browser:
   ```
   https://lead-nexus-backend.onrender.com/docs
   ```

2. Find the **`POST /api/public/create-admin`** endpoint

3. Click **"Try it out"**

4. Fill in the request body:
   ```json
   {
     "email": "admin@yourdomain.com",
     "password": "yourpassword123"
   }
   ```

5. Click **"Execute"**

6. You should see: `"Admin user 'admin@yourdomain.com' created successfully"`

---

## 🔧 Method 2: Using cURL (Command Line)

Open your terminal (PowerShell, CMD, or Git Bash) and run:

```bash
curl -X POST https://lead-nexus-backend.onrender.com/api/public/create-admin \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@yourdomain.com\", \"password\": \"yourpassword123\"}"
```

**Replace:**
- `admin@yourdomain.com` with your desired admin email
- `yourpassword123` with your desired password (min 8 characters)

---

## 🌐 Method 3: Using Postman or Insomnia

1. **Method:** POST
2. **URL:** `https://lead-nexus-backend.onrender.com/api/public/create-admin`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (JSON):**
   ```json
   {
     "email": "admin@yourdomain.com",
     "password": "yourpassword123"
   }
   ```
5. Click **Send**

---

## 🔒 Method 4: Using PowerShell (Windows)

Open PowerShell and run:

```powershell
$body = @{
    email = "admin@yourdomain.com"
    password = "yourpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://lead-nexus-backend.onrender.com/api/public/create-admin" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## 🛡️ Security Features

### First-Time Setup (No Token Required)
- If **no admin exists**, you can create the first admin **without any token**
- This is safe for initial setup

### Additional Admins (Token Required)
- To create **additional admin users**, set `ADMIN_SETUP_TOKEN` in Render:
  1. Go to Render → Your backend service → Environment
  2. Add: `ADMIN_SETUP_TOKEN = your-secret-token-here`
  3. Use the token in your request:
     ```json
     {
       "email": "admin2@yourdomain.com",
       "password": "password123",
       "setup_token": "your-secret-token-here"
     }
     ```
  Or use header: `X-Setup-Token: your-secret-token-here`

---

## ✅ Verification

After creating the admin:

1. Go to your frontend URL
2. Click **"Login"**
3. Enter the admin email and password
4. You should be redirected to `/admin` dashboard

---

## 🐛 Troubleshooting

### "Admin user already exists"
- **Solution:** Set `ADMIN_SETUP_TOKEN` in Render environment variables
- Then use the token in your request (see Method 4 above)

### "Invalid setup token"
- Check that `ADMIN_SETUP_TOKEN` in Render matches the token you're sending
- Or remove `ADMIN_SETUP_TOKEN` if you want to allow first-time setup

### "Password must be at least 8 characters"
- Use a password with 8+ characters

### "Email already registered"
- The user exists but isn't admin
- The endpoint will **upgrade** existing users to admin automatically
- Just call it again with the same email

---

## 📝 Example Responses

### Success (New Admin):
```json
{
  "message": "Admin user 'admin@example.com' created successfully",
  "email": "admin@example.com",
  "role": "admin"
}
```

### Success (Upgraded Existing User):
```json
{
  "message": "User 'admin@example.com' updated to admin role",
  "email": "admin@example.com",
  "role": "admin"
}
```

---

## 🎯 Quick Start (Recommended)

**Easiest way:** Use the API documentation at `/docs`:

1. Visit: `https://lead-nexus-backend.onrender.com/docs`
2. Find `POST /api/public/create-admin`
3. Click "Try it out"
4. Enter email and password
5. Click "Execute"
6. Done! ✅

---

**No shell access needed! This works perfectly on Render's free plan!** 🎉

