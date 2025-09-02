# Lead-Nexus: Technical Specifications Document

## System Overview

Lead-Nexus is a full-stack B2B lead marketplace platform built with modern web technologies. The system consists of a React frontend, Flask backend API, and SQLite/PostgreSQL database, designed for scalability and enterprise deployment.

---

## Frontend Technical Specifications

### Technology Stack

- **Framework**: React 18.2.0
- **Language**: TypeScript 5.4.5
- **Build Tool**: Vite 5.2.12
- **State Management**: Redux Toolkit 2.2.5
- **UI Framework**: Material-UI v5.15.20
- **Routing**: React Router DOM 6.23.1
- **HTTP Client**: Axios 1.7.2
- **Animations**: Framer Motion 11.18.2
- **Charts**: MUI X Charts 7.29.1

### Project Structure

```
frontend/
├── src/
│   ├── api/              # API client configuration
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (Theme)
│   ├── features/         # Redux slices
│   ├── pages/           # Page components
│   ├── store/           # Redux store configuration
│   ├── styles/          # CSS styles
│   ├── theme/           # Material-UI theme
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

### Key Components

#### Authentication System

- **JWT Token Management**: Secure token storage and refresh
- **Role-Based Access Control**: Client, Vendor, Admin roles
- **Protected Routes**: Route-level access control
- **Session Management**: Automatic token refresh

#### State Management

- **Redux Toolkit**: Centralized state management
- **Auth Slice**: User authentication state
- **Cart Slice**: Shopping cart functionality
- **Async Operations**: Proper async/await patterns

#### UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: User preference persistence
- **Material Design**: Consistent design system
- **Animations**: Smooth transitions and interactions

### Performance Optimizations

- **Code Splitting**: React.lazy() for route-based splitting
- **Bundle Optimization**: Vite build optimization
- **Image Optimization**: Lazy loading and compression
- **Caching**: API response caching strategies

---

## Backend Technical Specifications

### Technology Stack

- **Framework**: Flask 3.0.2
- **Language**: Python 3.10+
- **Database ORM**: SQLAlchemy 2.0.36
- **Authentication**: PyJWT 2.8.0 + passlib[bcrypt] 1.7.4
- **CORS**: Flask-CORS 4.0.0
- **Configuration**: python-dotenv 1.0.1

### Project Structure

```
backend/
├── routes/              # API endpoint modules
│   ├── leads.py         # Lead management endpoints
│   ├── payments.py      # Payment processing
│   ├── dashboard.py     # Analytics endpoints
│   ├── workflows.py     # Notification system
│   ├── profile.py       # User profile management
│   └── orders.py        # Order management
├── services/            # Business logic services
│   ├── email_service.py # Email functionality
│   ├── lead_validation.py # Lead validation logic
│   ├── notification_service.py # Notification system
│   ├── scoring.py       # Lead scoring algorithms
│   └── validation.py    # Data validation utilities
├── models.py            # Database models
├── auth.py              # Authentication utilities
├── config.py            # Configuration management
├── app.py               # Main Flask application
└── requirements.txt     # Python dependencies
```

### API Architecture

#### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

#### Lead Management Endpoints

```http
GET /api/leads
POST /api/leads/upload
POST /api/leads/upload/confirm
GET /api/leads/{id}
```

#### Payment Endpoints

```http
POST /api/payments/create-intent
POST /api/payments/mock-cart-intent
POST /api/payments/mock-cart-confirm
```

#### Dashboard Endpoints

```http
GET /api/dashboard/client
GET /api/dashboard/vendor
GET /api/dashboard/client/purchase-trends
GET /api/dashboard/vendor/sales-trends
```

#### Workflow Endpoints

```http
GET /api/workflows/notifications
POST /api/workflows/notifications/{id}/read
GET /api/workflows/leads/pending-approval
```

### Security Implementation

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: ORM-based queries

---

## Database Specifications

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL,  -- client, vendor, admin
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Leads Table

```sql
CREATE TABLE leads (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    industry VARCHAR NOT NULL,
    price FLOAT NOT NULL,
    status VARCHAR DEFAULT 'available',
    contact_name VARCHAR,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    company_name VARCHAR,
    location VARCHAR,
    extra JSON,
    lead_score FLOAT DEFAULT 0.5,
    validation_status VARCHAR DEFAULT 'pending',
    approval_status VARCHAR DEFAULT 'pending',
    vendor_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Purchases Table

```sql
CREATE TABLE purchases (
    id INTEGER PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id),
    buyer_id INTEGER REFERENCES users(id),
    vendor_id INTEGER REFERENCES users(id),
    amount FLOAT NOT NULL,
    status VARCHAR DEFAULT 'pending',
    payment_intent_id VARCHAR,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Notifications Table

```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Database Relationships

- **Users → Leads**: One-to-many (vendor relationship)
- **Users → Purchases**: One-to-many (buyer relationship)
- **Leads → Purchases**: One-to-many (lead sales)
- **Users → Notifications**: One-to-many (user notifications)

### Indexing Strategy

- **Primary Keys**: Auto-incrementing integers
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: Email, industry, location indexes
- **Status Fields**: Status-based filtering indexes

---

## API Response Formats

### Standard Response Structure

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message",
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### Error Response Structure

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### Lead Object Structure

```json
{
  "id": 1,
  "title": "Tech Startup Lead",
  "industry": "technology",
  "price": 150.0,
  "lead_score": 0.85,
  "validation_status": "validated",
  "approval_status": "approved",
  "contact_email": "john@techstartup.com",
  "company_name": "TechStartup Inc",
  "contact_name": "John Smith",
  "contact_phone": "(555) 123-4567",
  "location": "San Francisco CA",
  "description": "High-growth SaaS company seeking enterprise solutions",
  "extra": {
    "annual_revenue": "$1M-5M",
    "employee_count": "10-50",
    "website": "https://techstartup.com"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Environment Configuration

### Backend Environment Variables

```bash
# Security
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///lead_nexus.db
# For PostgreSQL: postgresql://user:pass@host:5432/dbname

# CORS Configuration
CORS_ORIGINS=http://localhost:5173

# Payment System
PAYMENTS_PROVIDER=mock

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@leadnexus.com
FROM_NAME=Lead Nexus
```

### Frontend Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:5001
```

---

## Performance Specifications

### Frontend Performance Targets

- **Initial Load Time**: < 3 seconds
- **Page Transitions**: < 500ms
- **Bundle Size**: < 2MB (gzipped)
- **Time to Interactive**: < 5 seconds

### Backend Performance Targets

- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 100ms (95th percentile)
- **Concurrent Users**: 10,000+ support
- **Uptime**: 99.9% availability

### Database Performance

- **Query Optimization**: Indexed queries for common operations
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Redis integration ready
- **Backup Strategy**: Automated daily backups

---

## Security Specifications

### Authentication Security

- **JWT Token Expiry**: 24 hours (access), 7 days (refresh)
- **Password Requirements**: Minimum 8 characters, complexity rules
- **Session Management**: Secure token storage and refresh
- **Rate Limiting**: API rate limiting implementation

### Data Protection

- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries via ORM
- **XSS Protection**: Content encoding and sanitization
- **CSRF Protection**: Token-based CSRF protection

### API Security

- **CORS Configuration**: Restrictive cross-origin policies
- **Authentication Headers**: Bearer token authentication
- **Error Handling**: Secure error messages
- **Logging**: Comprehensive security event logging

---

## Scalability Specifications

### Horizontal Scaling

- **Stateless Backend**: Flask application stateless design
- **Load Balancing**: Ready for load balancer integration
- **Database Scaling**: PostgreSQL production readiness
- **Microservices Ready**: Modular architecture for service separation

### Vertical Scaling

- **Resource Optimization**: Efficient memory and CPU usage
- **Database Optimization**: Query optimization and indexing
- **Caching Strategy**: Multi-level caching implementation
- **CDN Integration**: Static asset delivery optimization

---

## Deployment Specifications

### Development Environment

- **Node.js**: 18+ for frontend development
- **Python**: 3.10+ for backend development
- **Database**: SQLite for development
- **Memory**: 4GB+ RAM recommended
- **Storage**: 10GB+ available space

### Production Environment

- **Web Server**: Nginx/Apache
- **Application Server**: Gunicorn/uWSGI
- **Database**: PostgreSQL 13+
- **Cache**: Redis (recommended)
- **CDN**: CloudFront/Akamai (recommended)
- **SSL**: HTTPS with valid certificates

### Containerization

- **Docker Support**: Dockerfile and docker-compose ready
- **Environment Isolation**: Separate dev/staging/prod environments
- **Health Checks**: Application health monitoring
- **Logging**: Centralized logging system

---

## Testing Specifications

### Frontend Testing

- **Unit Tests**: Component testing with Jest/React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end testing with Cypress
- **Performance Tests**: Lighthouse performance testing

### Backend Testing

- **Unit Tests**: Function and class testing with pytest
- **Integration Tests**: API endpoint testing
- **Database Tests**: Database operation testing
- **Security Tests**: Security vulnerability testing

### Test Coverage Targets

- **Code Coverage**: > 80% for critical paths
- **API Coverage**: 100% endpoint testing
- **Security Coverage**: Comprehensive security testing
- **Performance Coverage**: Load and stress testing

---

## Monitoring & Analytics

### Application Monitoring

- **Performance Monitoring**: Response time and throughput tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **User Analytics**: User behavior and engagement tracking
- **Business Metrics**: Key performance indicators

### Infrastructure Monitoring

- **Server Monitoring**: CPU, memory, disk usage
- **Database Monitoring**: Query performance and connection pools
- **Network Monitoring**: API response times and availability
- **Security Monitoring**: Security event detection and alerting

---

## Documentation Requirements

### Technical Documentation

- **API Documentation**: OpenAPI/Swagger specification
- **Database Schema**: Complete schema documentation
- **Deployment Guide**: Step-by-step deployment instructions
- **Development Guide**: Development environment setup

### User Documentation

- **User Manual**: End-user feature documentation
- **Admin Guide**: Administrative functions documentation
- **API Reference**: Developer API documentation
- **Troubleshooting**: Common issues and solutions

---

## Compliance & Standards

### Code Standards

- **Frontend**: ESLint + Prettier configuration
- **Backend**: PEP 8 Python style guide
- **TypeScript**: Strict type checking enabled
- **Security**: OWASP security guidelines

### Data Standards

- **Data Privacy**: GDPR compliance considerations
- **Data Security**: Industry-standard encryption
- **Data Retention**: Configurable data retention policies
- **Audit Trail**: Comprehensive audit logging

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Technical Lead**: Development Team  
**Review Cycle**: Quarterly updates
