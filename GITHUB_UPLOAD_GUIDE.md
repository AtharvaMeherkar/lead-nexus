# 📤 GitHub Upload Guide - Step by Step

## 🎯 Complete Guide to Upload Lead-Nexus to GitHub

---

## 📋 Prerequisites

- ✅ Git installed on your computer
- ✅ GitHub account created
- ✅ Project files ready

**Check if Git is installed:**

```bash
git --version
```

If not installed, download from: https://git-scm.com/downloads

---

## 🚀 Step-by-Step Instructions

### **Step 1: Create GitHub Repository**

1. **Go to GitHub:** https://github.com
2. **Sign in** to your account
3. **Click the "+" icon** (top right) → **"New repository"**
4. **Fill in the details:**
   - **Repository name:** `lead-nexus` (or your preferred name)
   - **Description:** `The Ultimate Lead Management & Discovery Platform`
   - **Visibility:** Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README" (we already have one)
   - **DO NOT** add .gitignore or license (we'll do it manually)
5. **Click "Create repository"**

---

### **Step 2: Initialize Git in Your Project**

Open **PowerShell** or **Terminal** in your project folder:

```powershell
# Navigate to your project folder
cd "C:\Users\athar\OneDrive\Desktop\CV PROJECTS\leadnexus_prototype _final\lead-nexus-project"

# Initialize git repository
git init
```

---

### **Step 3: Create .gitignore File**

Create a `.gitignore` file in the root of your project to exclude unnecessary files:

```powershell
# Create .gitignore file
New-Item -Path .gitignore -ItemType File
```

Then add this content to `.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
ENV/
env/
*.egg-info/
dist/
build/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/

# Database
*.db
*.sqlite
*.sqlite3

# Temporary files
*.tmp
*.temp
.cache/

# Excel/CSV (if you don't want to commit sample data)
# Uncomment if needed:
# *.xlsx
# *.csv
# realdata.xlsx
# sample_leads.csv
```

---

### **Step 4: Add All Files to Git**

```powershell
# Add all files to staging
git add .

# Check what will be committed
git status
```

---

### **Step 5: Create Initial Commit**

```powershell
# Create your first commit
git commit -m "Initial commit: Lead-Nexus - Complete lead management platform with AI scoring"
```

---

### **Step 6: Connect to GitHub Repository**

Replace `AtharvaMeherkar` with your GitHub username:

```powershell
# Add remote repository
git remote add origin https://github.com/AtharvaMeherkar/lead-nexus.git

# Verify remote was added
git remote -v
```

**If you get an error that remote already exists:**

```powershell
# Remove existing remote
git remote remove origin

# Add again
git remote add origin https://github.com/AtharvaMeherkar/lead-nexus.git
```

---

### **Step 7: Rename Main Branch (if needed)**

```powershell
# Check current branch name
git branch

# If it's 'master', rename to 'main'
git branch -M main
```

---

### **Step 8: Push to GitHub**

```powershell
# Push to GitHub (first time)
git push -u origin main
```

**If you get authentication error:**

**Option A: Use GitHub Personal Access Token**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Lead-Nexus Upload"
4. Select scopes: Check `repo` (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When prompted for password, paste the token instead

**Option B: Use GitHub CLI**

```powershell
# Install GitHub CLI (if not installed)
# Then authenticate:
gh auth login
```

---

### **Step 9: Verify Upload**

1. **Go to your GitHub repository:** https://github.com/AtharvaMeherkar/lead-nexus
2. **Refresh the page**
3. **You should see all your files!**

---

## 🔄 Future Updates (After Initial Upload)

When you make changes and want to update GitHub:

```powershell
# Navigate to project folder
cd "C:\Users\athar\OneDrive\Desktop\CV PROJECTS\leadnexus_prototype _final\lead-nexus-project"

# Check what changed
git status

# Add changed files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

---

## 📝 Common Commands Reference

```powershell
# Check status
git status

# See what files changed
git diff

# Add specific file
git add filename.txt

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# See commit history
git log

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

## ⚠️ Troubleshooting

### **Error: "remote origin already exists"**

```powershell
git remote remove origin
git remote add origin https://github.com/AtharvaMeherkar/lead-nexus.git
```

### **Error: "Authentication failed"**

- Use Personal Access Token instead of password
- Or use GitHub CLI: `gh auth login`

### **Error: "Permission denied"**

- Check your GitHub username is correct
- Verify repository exists on GitHub
- Check you have write access to the repository

### **Error: "Large files"**

If you have large files (>100MB), GitHub might reject them. Add them to `.gitignore`:

```gitignore
# Large files
*.xlsx
realdata.xlsx
```

### **Want to remove a file from Git but keep it locally?**

```powershell
git rm --cached filename.txt
git commit -m "Remove file from Git"
```

---

## 🎯 Quick Summary (Copy-Paste Commands)

```powershell
# 1. Navigate to project
cd "C:\Users\athar\OneDrive\Desktop\CV PROJECTS\leadnexus_prototype _final\lead-nexus-project"

# 2. Initialize Git
git init

# 3. Add all files
git add .

# 4. First commit
git commit -m "Initial commit: Lead-Nexus platform"

# 5. Add remote (replace with your username)
git remote add origin https://github.com/AtharvaMeherkar/lead-nexus.git

# 6. Rename branch to main
git branch -M main

# 7. Push to GitHub
git push -u origin main
```

---

## ✅ Verification Checklist

After uploading, verify:

- [ ] All files are visible on GitHub
- [ ] README.md displays correctly
- [ ] Project structure is correct
- [ ] No sensitive files (like .env) are uploaded
- [ ] node_modules and .venv are excluded
- [ ] Repository is accessible

---

## 🎉 You're Done!

Your project is now on GitHub! 🚀

**Next Steps:**

1. Add a description to your repository
2. Add topics/tags (e.g., `react`, `fastapi`, `lead-management`, `ai`)
3. Enable GitHub Pages (if you want a website)
4. Add collaborators (if working with a team)

---

## 📞 Need Help?

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Help:** https://docs.github.com
- **GitHub Desktop:** https://desktop.github.com (GUI alternative)

---

**Good luck with your GitHub upload! 🎊**
