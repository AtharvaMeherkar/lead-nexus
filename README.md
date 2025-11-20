<div align="center">

# 🚀 Lead-Nexus

### **The Ultimate Lead Management & Discovery Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Transform your sales workflow with AI-powered lead discovery, intelligent scoring, and streamlined management.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Team](#-team)

---

</div>

## 📖 Table of Contents

- [✨ Overview](#-overview)
- [🎯 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [💻 Usage](#-usage)
- [🤖 AI/ML Features](#-aiml-features)
- [👥 Team](#-team)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Overview

**Lead-Nexus** is a comprehensive lead management platform designed to help sales teams discover, organize, and engage with high-quality leads efficiently. Built with modern technologies and powered by AI-driven insights, it transforms how teams find and manage prospects.

### 🎯 Key Highlights

- 🔍 **Advanced Search** - Multi-criteria search with boolean operators
- 🤖 **AI-Powered Scoring** - ML-based lead quality prediction (0-100)
- 📊 **Smart Analytics** - Real-time insights and statistics
- 📧 **Email Integration** - Templates, personalization, and alerts
- 📤 **Multiple Export Formats** - CSV, Excel, JSON, PDF
- 🔄 **Duplicate Detection** - Automatic duplicate identification and merging
- 📱 **Fully Responsive** - Works seamlessly on all devices

---

## 🎯 Features

### 🔍 **Search & Discovery**

- ✅ Multi-criteria search (job title, company, location, domain)
- ✅ Boolean operators (AND, OR, NOT)
- ✅ Multi-select filters
- ✅ Advanced sorting options
- ✅ Group by company view
- ✅ Saved searches & search history
- ✅ Filter presets (Remote, Tech, Senior Roles, Startups)

### 🤖 **AI/ML Capabilities**

- ✅ **ML-Based Lead Scoring** - Automatic quality scoring (0-100)
- ✅ Intelligent duplicate detection
- ✅ Smart lead prioritization
- ✅ Feature-based quality assessment

### 📊 **Lead Management**

- ✅ Custom lead lists (unlimited)
- ✅ Bulk operations
- ✅ Lead notes & annotations
- ✅ Expandable lead cards
- ✅ Quick actions (copy email, contact info)
- ✅ View modes (List/Grid)

### 📧 **Productivity Tools**

- ✅ Email template library
- ✅ Template personalization ({{name}}, {{company}}, etc.)
- ✅ Email alerts for new matching leads
- ✅ In-app notifications
- ✅ Quick copy to clipboard

### 📤 **Export & Integration**

- ✅ Export to CSV, Excel, JSON, PDF
- ✅ Custom field selection
- ✅ Export templates
- ✅ Export history tracking
- ✅ Bulk export support

### 👨‍💼 **Admin Features**

- ✅ CSV/Excel bulk upload
- ✅ Lead management (view, delete, bulk delete)
- ✅ User management dashboard
- ✅ Analytics & statistics
- ✅ Recent leads view

### 🎨 **User Experience**

- ✅ Modern glassmorphism UI
- ✅ Dark theme with cyan/magenta accents
- ✅ Smooth animations (Framer Motion)
- ✅ Loading states & skeletons
- ✅ Empty states with helpful messages
- ✅ Mobile-optimized design

---

## 🛠️ Tech Stack

### **Frontend**

```
React 18+          - UI Framework
TypeScript         - Type Safety
Tailwind CSS       - Styling
Framer Motion      - Animations
React Router       - Navigation
Axios              - HTTP Client
Lucide React       - Icons
```

### **Backend**

```
FastAPI            - Web Framework
Python 3.13+       - Programming Language
SQLAlchemy         - ORM
PostgreSQL         - Database
Pydantic           - Data Validation
JWT                - Authentication
Bcrypt             - Password Hashing
Pandas             - Data Processing
OpenPyXL           - Excel Support
```

### **DevOps & Tools**

```
Uvicorn            - ASGI Server
Alembic            - Database Migrations
Git                - Version Control
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+** (Backend)
- **Node.js 18+** (Frontend)
- **PostgreSQL 14+** (Database)
- **Git** (Version Control)

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/AtharvMeherkar/lead-nexus.git
cd lead-nexus

# Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

---

## 📦 Installation

### **Step 1: Clone Repository**

```bash
git clone https://github.com/AtharvaMeherkar/lead-nexus.git
cd lead-nexus
```

### **Step 2: Backend Setup**

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database (update .env file)
# DATABASE_URL=postgresql://user:password@localhost:5432/leadnexus

# Run database migrations (if needed)
# alembic upgrade head

# Create admin user
python create_admin.py
```

### **Step 3: Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL (update .env file if needed)
# VITE_API_URL=http://127.0.0.1:8000/api
```

### **Step 4: Start Servers**

**Terminal 1 - Backend:**

```bash
cd backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Terminal 3 - Create Admin (One-time):**

```bash
cd backend
.venv\Scripts\activate
python create_admin.py
```

### **Step 5: Access Application**

- **Frontend:** http://127.0.0.1:5174
- **Backend API:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/docs

---

## 💻 Usage

### **For Users**

1. **Register/Login** - Create an account or login with existing credentials
2. **Search Leads** - Use filters to find leads matching your criteria
3. **View Scores** - See AI-powered lead quality scores (0-100)
4. **Organize** - Create lists and add leads for better organization
5. **Export** - Export leads in your preferred format (CSV, Excel, JSON, PDF)
6. **Email** - Use templates for quick outreach
7. **Track** - Set up alerts for new matching leads

### **For Admins**

1. **Upload Data** - Upload CSV/Excel files with lead data
2. **Manage Leads** - View, search, and delete leads
3. **User Management** - Monitor users and subscriptions
4. **Analytics** - View platform statistics and insights

### **CSV Upload Format**

Required columns:

- `email` (required)
- `full_name` (required)

Optional columns:

- `job_title`
- `company_name`
- `location`

See [CSV_FORMAT_GUIDE.md](./CSV_FORMAT_GUIDE.md) for detailed format specifications.

---

## 🤖 AI/ML Features

### **Lead Scoring Algorithm**

Our ML-based lead scoring system evaluates leads across multiple dimensions:

- **Job Title Seniority** (25%) - CEO, Director, Manager, etc.
- **Domain Quality** (15%) - Premium domains (.com, .io) score higher
- **Location** (15%) - Major cities receive higher scores
- **Email Pattern** (20%) - Professional formats score better
- **Company Characteristics** (10%) - Established companies score higher
- **Profile Completeness** (+15 max) - Complete profiles get bonus points

**Score Ranges:**

- 🟢 **70-100:** High-quality leads (Hot)
- 🟡 **50-69:** Medium-quality leads (Warm)
- ⚪ **0-49:** Lower-quality leads (Cold)

### **Future ML Enhancements**

- 🔮 Predictive lead conversion models
- 🔮 Sentiment analysis for email/notes
- 🔮 Automated lead categorization
- 🔮 Smart matching algorithms
- 🔮 Time series forecasting

See [AI_ML_FEATURES_ROADMAP.md](./AI_ML_FEATURES_ROADMAP.md) for detailed roadmap.

## 👥 Team

<div align="center">

### **Lead-Nexus Official Project Team**

_The multidisciplinary team powering engineering, AI and operations._

</div>

### **Internal Guide**

**Prof. Aarti Bhargav Patel**  
_Academic mentor providing supervision and domain guidance across software engineering, ethics, and data compliance._

### **Team Members**

| Role                      | Name             | Focus Area                                                 |
| ------------------------- | ---------------- | ---------------------------------------------------------- |
| 💻 **Frontend Lead**      | Atharva Meherkar | React-based dashboards, UX optimization, component library |
| ⚙️ **Backend Developer**  | Akash Mirande    | FastAPI services, PostgreSQL, data processing              |
| 🤖 **AI/ML Specialist**   | Usman Khan       | Lead scoring algorithms, feature extraction, ML systems    |
| ☁️ **DevOps Lead**        | Yash Joshi       | Environment setup, database migrations, system stability   |
| 🔒 **QA & Security Lead** | Vedant Telgar    | Authentication, data validation, code quality              |

---

## 📚 Documentation

- 📘 [Project Overview](./PROJECT_OVERVIEW.md) - Complete project documentation
- 🚀 [Quick Start Guide](./START_COMMANDS.md) - Setup instructions
- 🔐 [Authentication Guide](./AUTHENTICATION_GUIDE.md) - Auth system details
- 📊 [CSV Format Guide](./CSV_FORMAT_GUIDE.md) - Data upload specifications
- 🤖 [ML Features Roadmap](./AI_ML_FEATURES_ROADMAP.md) - AI/ML feature plans
- 📈 [ML Implementation](./ML_LEAD_SCORING_IMPLEMENTATION.md) - Lead scoring details
- 💼 [Investor Pitch](./INVESTOR_PITCH_SUMMARY.md) - Business overview

---

## 🏗️ Project Structure

```
lead-nexus/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core configuration
│   │   ├── db/           # Database setup
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities (CSV loader, etc.)
│   ├── requirements.txt
│   └── create_admin.py
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── types/        # TypeScript types
│   │   └── utils/         # Utilities
│   └── package.json
└── README.md
```

---

## 🔧 Configuration

### **Backend Environment Variables**

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/leadnexus
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://127.0.0.1:5174,http://localhost:5174
```

### **Frontend Environment Variables**

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## 🧪 Testing

### **Backend Testing**

```bash
cd backend
.venv\Scripts\activate
python test_backend.py
```

### **Frontend Testing**

```bash
cd frontend
npm run test
```

---

## 🚀 Deployment

### **Backend Deployment**

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `alembic upgrade head`
4. Start server: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### **Frontend Deployment**

1. Build: `npm run build`
2. Deploy `dist/` folder to hosting service (Vercel, Netlify, etc.)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Contribution Guidelines**

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

---

## 📊 Project Statistics

- **30+ Features** implemented
- **100% Mobile Responsive**
- **AI-Powered** lead scoring
- **4 Export Formats** (CSV, Excel, JSON, PDF)
- **Zero Breaking Changes** in recent updates

---

## 🐛 Known Issues

- None currently! 🎉

If you find any issues, please [open an issue](https://github.com/AtharvaMeherkar/lead-nexus/issues).

---

## 🔮 Roadmap

- [ ] Advanced ML models for lead scoring
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Email tracking (opens, clicks)
- [ ] Team collaboration features
- [ ] Mobile apps (iOS, Android)
- [ ] API marketplace
- [ ] Advanced analytics dashboard

See [AI_ML_FEATURES_ROADMAP.md](./AI_ML_FEATURES_ROADMAP.md) for detailed feature plans.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Prof. Aarti Bhargav Patel** - For academic mentorship and guidance
- **FastAPI** - For the amazing web framework
- **React Team** - For the powerful UI library
- **PostgreSQL** - For reliable database management
- **All Contributors** - For making this project better

---

## 📞 Contact & Support

- **Project Link:** [https://github.com/AtharvaMeherkar/lead-nexus](https://github.com/AtharvaMeherkar/lead-nexus)
- **Issues:** [GitHub Issues](https://github.com/AtharvaMeherkar/lead-nexus/issues)
- **Email:** atharvameherkar@gmail.com

---

<div align="center">

### ⭐ If you like this project, give it a star! ⭐

**Made with ❤️ by the Lead-Nexus Team**

[⬆ Back to Top](#-lead-nexus)

</div>
