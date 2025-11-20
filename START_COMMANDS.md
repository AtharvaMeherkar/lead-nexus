# 🚀 Complete Startup Commands

## Step-by-Step Instructions

---

## 📋 **TERMINAL 1: Backend Server**

Open your first PowerShell terminal and run:

```powershell
cd "C:\Users\athar\OneDrive\Desktop\CV PROJECTS\leadnexus_prototype _final\lead-nexus-project\backend"
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
```

**✅ Expected Output:**

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
Info: Admin panel setup skipped. Basic API endpoints are available.
```

**⏸️ Keep this terminal running!** Don't close it.

---

## 📋 **TERMINAL 2: Frontend Server**

Open a **NEW** PowerShell terminal and run:

```powershell
cd "C:\Users\athar\OneDrive\Desktop\CV PROJECTS\leadnexus_prototype _final\lead-nexus-project\frontend"
npm run dev
```

**✅ Expected Output:**

```
VITE v7.2.2  ready in 785 ms
➜  Local:   http://127.0.0.1:5174/
```

**⏸️ Keep this terminal running!** Don't close it.

---

## 📋 **TERMINAL 3: Create Admin User**

Open a **THIRD** PowerShell terminal and run:

```powershell
cd "C:\Users\athar\OneDrive\Desktop\CV PROJECTS\leadnexus_prototype _final\lead-nexus-project\backend"
.\.venv\Scripts\Activate.ps1
python create_admin.py
```

**When prompted, enter:**

- **Email:** `admin@leadnexus.com`
- **Password:** `12345678` (or your preferred password, min 8 characters)

**✅ Expected Output:**

```
✓ Created admin user 'admin@leadnexus.com'.
You can now login at: http://localhost:5173
Email: admin@leadnexus.com
Password: 12345678
```

**✅ This terminal can be closed after creating the admin.**

---

## 🌐 **Access the Application**

1. **Open your browser** and go to: `http://127.0.0.1:5174`
2. **You should see the landing page**
3. **Click "Login"** button (top right)
4. **Enter credentials:**
   - Email: `admin@leadnexus.com`
   - Password: `12345678` (or what you set)
5. **Click "Login"**

**✅ You should be redirected to the admin panel!**

---

## 🧪 **Test Registration (Optional)**

1. On the landing page, click **"Get Started"** or **"Register here"**
2. Enter a new email (e.g., `client@example.com`)
3. Enter a password (min 8 characters)
4. Click **"Register"**
5. You should be redirected to the dashboard or pricing page

---

## ⚠️ **Troubleshooting**

### Backend not starting?

- Make sure PostgreSQL is running
- Check if port 8000 is already in use
- Verify `.venv` is activated (you should see `(.venv)` in prompt)

### Frontend not starting?

- Make sure Node.js is installed
- Try deleting `node_modules` and running `npm install` again
- Check if port 5173/5174 is already in use

### Admin login not working?

- Make sure you ran `create_admin.py` successfully
- Verify the email and password are correct
- Check backend terminal for any errors

### "401 Unauthorized" error?

- Make sure backend is running
- Recreate admin user with `python create_admin.py`
- Check that password is at least 8 characters

---

## 📝 **Quick Reference**

| Service          | URL                        | Status Check                 |
| ---------------- | -------------------------- | ---------------------------- |
| **Frontend**     | http://127.0.0.1:5174      | Open in browser              |
| **Backend API**  | http://127.0.0.1:8000      | http://127.0.0.1:8000/health |
| **Backend Docs** | http://127.0.0.1:8000/docs | Open in browser              |

---

## ✅ **Verification Checklist**

- [ ] Backend terminal shows "Application startup complete"
- [ ] Frontend terminal shows "VITE ready"
- [ ] Admin user created successfully
- [ ] Can access http://127.0.0.1:5174 in browser
- [ ] Can login with admin credentials
- [ ] Can register a new client user

---

**🎉 Once all checkboxes are done, your application is fully operational!**
