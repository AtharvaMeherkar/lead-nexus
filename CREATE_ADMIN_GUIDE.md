# 👤 How to Create Admin User on Render

## ✅ Quick Answer

**🎯 BEST METHOD FOR FREE PLAN: Use API Endpoint (No Shell Needed!)**

Since Render's free plan doesn't support shell access, use the **API endpoint method** instead:

1. Go to: `https://lead-nexus-backend.onrender.com/docs`
2. Find `POST /api/public/create-admin`
3. Click "Try it out" and enter email/password
4. Click "Execute"
5. Done! ✅

**See `CREATE_ADMIN_VIA_API.md` for detailed instructions!**

---

## 📋 Alternative Methods (If You Have Shell Access)

**The steps in the deployment checklist were partially incorrect.** Here's the corrected version:

### ❌ What Was Wrong:
- Step 3 (manual database initialization) is **NOT needed** - tables are created automatically
- The database initialization command was overly complex

### ✅ Correct Steps:

1. **Database tables are created automatically** when the backend starts (via `lifespan` function)
2. **Just create the admin user** using one of the methods below

---

## 🚀 Method 1: Using Render Shell (Easiest)

1. Go to your Render dashboard
2. Click on your backend service
3. Click the **"Shell"** tab (or find "Open Shell" button)
4. Navigate to backend directory:
   ```bash
   cd backend
   ```
5. Run the admin creation script:
   ```bash
   python create_admin.py
   ```
6. When prompted, enter:
   - **Email:** `admin@yourdomain.com` (or any email you want)
   - **Password:** (minimum 8 characters)
7. You should see: `✓ Created admin user 'your-email@example.com'`

---

## 🔧 Method 2: Using Environment Variables (Non-Interactive)

If the interactive prompt doesn't work in Render's shell:

1. Go to Render Shell
2. Run:
   ```bash
   cd backend
   ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=yourpassword123 python create_admin.py
   ```
   (Replace with your actual email and password)

---

## 🌐 Method 3: Via Frontend Registration + Upgrade

1. Register a regular user through the frontend registration page
2. Go to Render Shell
3. Run `python create_admin.py` and use the **same email** you registered with
4. The script will upgrade that user to admin role

---

## ✅ Verification

After creating the admin user:

1. Go to your frontend URL
2. Click "Login"
3. Enter the admin email and password
4. You should be redirected to `/admin` dashboard

---

## 🐛 Troubleshooting

### "Module not found" error:
- Make sure you're in the `backend` directory: `cd backend`
- Or use: `python backend/create_admin.py` from project root

### "Database connection error":
- Verify `DATABASE_URL` environment variable is set correctly in Render
- Check that PostgreSQL service is running

### "User already exists":
- The script will update the existing user to admin role
- This is normal if you registered via frontend first

### Interactive input not working:
- Use Method 2 (environment variables) instead
- Or use Method 3 (register via frontend, then upgrade)

---

## 📝 Notes

- **Database initialization is automatic** - no manual table creation needed
- The `lifespan` function in `app/main.py` creates all tables on startup
- You can create multiple admin users by running the script multiple times
- Admin users can access `/admin` dashboard and manage leads

---

**Last Updated:** Script now supports both interactive and non-interactive modes! ✅

