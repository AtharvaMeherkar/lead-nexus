# Lead-Nexus: AI-Driven B2B Lead Management Portal

## Overview

Lead-Nexus is a comprehensive B2B lead marketplace platform that connects vendors with potential clients through a secure, scalable, and user-friendly interface. This repository contains a full-stack MVP built with modern technologies and best practices.

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Redux Toolkit + Material-UI v5 + Framer Motion
- **Backend**: Python 3.10+ + Flask + SQLAlchemy + JWT Authentication + Flask-CORS
- **Database**: SQLite (development) / PostgreSQL (production) - Compatible with Supabase
- **Payment System**: Mock payment gateway (Stripe integration removed for simplicity)
- **UI/UX**: Responsive design, dark/light theme, animations, mobile-optimized

## 🚀 Key Features

### 🔐 Authentication & Security

- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** (Client, Vendor, Admin)
- **Secure session management** with automatic token refresh
- **Protected routes** and API endpoints

### 📊 Enhanced CSV Lead Upload System

- **Smart data extraction** with automatic field mapping
- **Comprehensive validation** (email format, phone numbers, pricing limits)
- **Interactive vendor review interface** for pricing and lead details
- **Duplicate detection** and detailed error reporting
- **Flexible column naming** support (e.g., `title`/`lead_title`, `company`/`company_name`)

### 🛒 Client Marketplace

- **Advanced search and filtering** by industry, price range, location
- **Detailed lead view pages** with comprehensive information
- **Shopping cart functionality** for multiple lead purchases
- **Realistic mock payment interface** with billing address collection
- **Order history and tracking** system

### 📈 Real-time Dashboards

- **Interactive analytics** with MUI X Charts
- **KPIs and performance metrics** for both clients and vendors
- **Sales trends and industry breakdown** visualizations
- **Real-time data updates** and refresh capabilities

### 🎨 Professional UI/UX

- **Marketing pages** (Landing, Features, Pricing, Team, Contact Sales)
- **Responsive design** optimized for all devices
- **Dark/Light theme** toggle with persistent preferences
- **Smooth animations** using Framer Motion
- **Mobile-first approach** with touch-friendly interfaces

### 🔔 Notification System

- **Real-time in-app notifications** for lead approvals, purchases, payments
- **Email templates** for welcome, lead purchase, and approval notifications
- **Notification center** with read/unread status management
- **Bulk notification operations** (mark all read, delete)

### 👤 User Profile Management

- **Complete profile CRUD operations** with validation
- **Password change functionality** with security checks
- **Account deletion** with data cleanup
- **Profile picture and personal information** management

## 🛠️ Quick Start

### Prerequisites

- **Backend**: Python 3.10+, pip
- **Frontend**: Node.js 18+, npm

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python init_database.py

# Start the server
python app.py
```

**Backend runs at**: http://localhost:5001

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API configuration

# Start development server
npm run dev
```

**Frontend runs at**: http://localhost:5173

## ⚙️ Environment Configuration

### Backend (.env)

```bash
# Security
SECRET_KEY=your-secret-key-here

# Database (SQLite for development)
DATABASE_URL=sqlite:///lead_nexus.db
# For PostgreSQL: postgresql://user:pass@host:5432/dbname

# CORS Configuration
CORS_ORIGINS=http://localhost:5173

# Payment System (Mock Only)
PAYMENTS_PROVIDER=mock

# Email Configuration (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@leadnexus.com
FROM_NAME=Lead Nexus
```

### Frontend (.env)

```bash
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:5001
```

## 👥 Default Accounts

The system comes with pre-configured test accounts:

- **Client**: `client@example.com` / `password123`
- **Vendor**: `vendor@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## 📋 CSV Upload Format

The system supports flexible column naming. Use this template:

```csv
title,industry,price,contact_email,company_name,contact_name,contact_phone,location,description
Tech Startup Lead,technology,150.00,john@techstartup.com,TechStartup Inc,John Smith,(555) 123-4567,San Francisco CA,High-growth SaaS company
Healthcare Provider,healthcare,200.00,mary@healthcorp.com,HealthCorp Medical,Mary Johnson,(555) 234-5678,New York NY,Large hospital network
```

### Supported Field Variations

| Standard Field  | Alternative Names  |
| --------------- | ------------------ |
| `title`         | `lead_title`       |
| `company_name`  | `company`          |
| `contact_name`  | `contact`          |
| `contact_email` | `email`            |
| `contact_phone` | `phone`            |
| `location`      | `city`, `address`  |
| `description`   | `notes`, `details` |

## 🗄️ Database Configuration

### Development (SQLite)

- **Default**: Automatically uses SQLite database
- **File**: `lead_nexus.db` in backend directory
- **No additional setup required**

### Production (PostgreSQL)

```bash
# Set DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Compatible with Supabase, Railway, AWS RDS, etc.
```

## 🚀 Production Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting platform
```

### Backend Deployment (Render/Heroku/Railway)

```bash
# Set environment variables in your hosting platform
# Deploy with: python app.py
```

### Environment Variables for Production

```bash
# Required
SECRET_KEY=your-production-secret-key
DATABASE_URL=your-production-database-url
CORS_ORIGINS=https://yourdomain.com

# Optional
SMTP_SERVER=your-smtp-server
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
```

## 📁 Project Structure

```
lead-nexus/
├── backend/
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── models.py         # Database models
│   ├── auth.py           # Authentication middleware
│   ├── app.py            # Main Flask application
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── features/     # Redux slices
│   │   ├── contexts/     # React contexts
│   │   ├── theme/        # Material-UI theme
│   │   └── styles/       # CSS styles
│   ├── package.json      # Node dependencies
│   └── vite.config.ts    # Vite configuration
└── README.md
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Leads

- `GET /api/leads` - Get marketplace leads
- `POST /api/leads/upload` - Upload CSV leads
- `POST /api/leads/upload/confirm` - Confirm lead upload
- `GET /api/leads/{id}` - Get lead details

### Payments

- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/mock-cart-intent` - Create cart payment intent
- `POST /api/payments/mock-cart-confirm` - Confirm cart payment

### Dashboard

- `GET /api/dashboard/client/*` - Client dashboard data
- `GET /api/dashboard/vendor/*` - Vendor dashboard data

### Workflows

- `GET /api/workflows/notifications` - Get user notifications
- `POST /api/workflows/notifications/{id}/read` - Mark notification read
- `GET /api/workflows/leads/pending-approval` - Get pending leads (admin)

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/change-password` - Change password

## 🎯 Feature Walkthrough

### 1. User Registration & Authentication

- Register as Client or Vendor with email/password
- JWT tokens stored securely in localStorage
- Role-based access control throughout the application

### 2. Vendor Lead Upload Process

- Upload CSV file with lead data
- System automatically maps and validates fields
- Interactive review interface to set pricing
- Confirmation step before publishing to marketplace

### 3. Client Marketplace Experience

- Browse leads with advanced filtering options
- View detailed lead information and company details
- Add leads to shopping cart for bulk purchase
- Complete mock payment process with billing details

### 4. Dashboard Analytics

- **Client Dashboard**: Purchase trends, industry breakdown, recent orders
- **Vendor Dashboard**: Sales performance, lead uploads, revenue metrics
- Real-time charts and KPIs with refresh capabilities

### 5. Order Management

- Complete order history with status tracking
- Lead delivery and contact information access
- Payment confirmation and receipt generation

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password hashing** using bcrypt
- **CORS protection** with configurable origins
- **Input validation** and sanitization
- **SQL injection prevention** with SQLAlchemy ORM
- **XSS protection** with proper content encoding

## 🎨 UI/UX Features

- **Responsive Design** optimized for all screen sizes
- **Dark/Light Theme** with persistent user preferences
- **Smooth Animations** using Framer Motion
- **Material-UI Components** for consistent design
- **Mobile-First Approach** with touch-friendly interfaces
- **Loading States** and error handling throughout

## 📱 Mobile Optimization

- **Touch-friendly buttons** and form elements
- **Responsive navigation** with hamburger menu
- **Optimized typography** for mobile screens
- **Gesture support** for common interactions
- **Progressive Web App** ready

## 🚀 Performance Optimizations

- **Code splitting** with React.lazy()
- **Bundle optimization** with Vite
- **Database query optimization** with SQLAlchemy
- **Caching strategies** for API responses
- **Image optimization** and lazy loading

## 🔧 Development Tools

- **TypeScript** for type safety
- **ESLint & Prettier** for code formatting
- **Redux DevTools** for state management debugging
- **Hot reload** for rapid development
- **Error boundaries** for graceful error handling

## 📄 License

This project is for educational and internal project use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please refer to the project documentation or create an issue in the repository.

---

**Lead-Nexus** - Connecting vendors with quality leads through a modern, secure, and scalable platform.
