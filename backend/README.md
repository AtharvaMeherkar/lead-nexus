# Lead-Nexus Backend API

Flask-based REST API for B2B lead management with mock payment processing.

## Quick Start

1. **Setup Virtual Environment**

   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # macOS/Linux
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**

   ```bash
   copy ENV.example .env  # Windows
   # cp ENV.example .env  # macOS/Linux
   ```

4. **Start Server**
   ```bash
   python app.py
   ```
   Server runs at `http://localhost:5001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user `{email, password, role}`
- `POST /api/auth/login` - User login `{email, password}`

### Lead Management

- `POST /api/leads/upload` - Upload CSV file (multipart/form-data)
- `POST /api/leads/upload/confirm` - Confirm parsed leads `{leads: []}`
- `GET /api/leads` - List available leads `?industry=&min_price=&max_price=`
- `GET /api/leads/<id>` - Get lead details
- `GET /api/leads/my` - Vendor's leads

### Payments (Mock System)

- `POST /api/payments/create-intent` - Create payment intent `{lead_id}`
- `POST /api/payments/webhook` - Confirm payment `{payment_intent_id}`
- `POST /api/payments/mock-cart-intent` - Cart checkout `{lead_ids: []}`
- `POST /api/payments/mock-cart-confirm` - Confirm cart payment

### Orders & Analytics

- `GET /api/orders/my` - User's purchase history
- `GET /api/dashboard/client` - Client dashboard data
- `GET /api/dashboard/vendor` - Vendor dashboard data

## Configuration

- **Database**: SQLite (development) or PostgreSQL (production)
- **CORS**: Configurable origins for frontend integration
- **Payments**: Mock system only (Stripe removed for simplicity)

## Features

- JWT-based authentication with role-based access control
- Enhanced CSV upload with field mapping and validation
- Mock payment processing with realistic UI
- Real-time dashboard analytics
- Comprehensive error handling and logging
