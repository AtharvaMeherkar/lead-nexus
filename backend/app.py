"""
Lead-Nexus Backend Application

A Flask-based REST API for B2B lead management with mock payment processing.
"""

from __future__ import annotations

from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

from auth import create_access_token, hash_password, verify_password
from config import settings
from models import SessionLocal, User, init_db
from routes.leads import bp as leads_bp
from routes.payments import payments_bp
from routes.orders import bp as orders_bp
from routes.dashboard import bp as dashboard_bp
from routes.workflows import workflows_bp
from routes.profile import bp as profile_bp
from routes.communications import communications_bp
from routes.advanced_features import advanced_features_bp
from routes.platform_features import platform_features_bp
from routes.security import security_bp


def create_app() -> Flask:
    """
    Create and configure the Flask application.
    
    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Configure CORS - Allow all origins for development
    CORS(
        app,
        origins=["*"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Content-Type", "Authorization"],
    )

    # Register health check endpoint
    @app.get("/health")
    def health_check() -> Dict[str, str]:
        """Health check endpoint."""
        return {"status": "ok", "service": "lead-nexus-api"}

    # Register authentication routes
    _register_auth_routes(app)
    
    # Register API blueprints
    app.register_blueprint(leads_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(workflows_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(communications_bp)
    app.register_blueprint(advanced_features_bp)
    app.register_blueprint(platform_features_bp)
    app.register_blueprint(security_bp)

    return app


def _get_cors_origins() -> List[str]:
    """
    Parse and validate CORS origins from configuration.
    
    Returns:
        List of allowed CORS origins
    """
    if isinstance(settings.cors_origins, str):
        origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
    else:
        origins = settings.cors_origins
    
    # Ensure localhost development URLs are included
    dev_origins = [
        "http://127.0.0.1:5173", 
        "http://localhost:5173", 
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]
    for dev_origin in dev_origins:
        if dev_origin not in origins:
            origins.append(dev_origin)
    
    return origins


def _register_auth_routes(app: Flask) -> None:
    """
    Register authentication routes.
    
    Args:
        app: Flask application instance
    """
    
    @app.post("/api/auth/register")
    @cross_origin()
    def register() -> tuple[Dict[str, Any], int]:
        """
        Register a new user account.
        
        Expected JSON payload:
        {
            "email": "user@example.com",
            "password": "secure_password",
            "role": "client|vendor|admin"
        }
        """
        data = request.get_json(force=True)
        
        # Validate input
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        role = (data.get("role") or "client").strip().lower()
        
        # Input validation
        if role not in {"client", "vendor", "admin"}:
            return jsonify({"error": "Invalid role. Must be 'client', 'vendor', or 'admin'"}), 400
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        # Check for existing user and create new account
        with SessionLocal() as db:
            existing_user = db.query(User).filter_by(email=email).first()
            if existing_user:
                return jsonify({"error": "Email already registered"}), 400
            
            # Create new user
            user = User(
                email=email,
                password_hash=hash_password(password),
                role=role
            )
            db.add(user)
            db.commit()
            
            # Generate access token
            token = create_access_token(user.id, user.role)
        
        return jsonify({
            "token": token,
            "role": role,
            "message": "Account created successfully"
        }), 201

    @app.post("/api/auth/login")
    @cross_origin()
    def login() -> tuple[Dict[str, Any], int]:
        """
        Authenticate user and return access token.
        
        Expected JSON payload:
        {
            "email": "user@example.com",
            "password": "secure_password"
        }
        """
        data = request.get_json(force=True)
        
        # Extract credentials
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Authenticate user
        with SessionLocal() as db:
            user = db.query(User).filter_by(email=email).first()
            
            if not user or not verify_password(password, user.password_hash):
                return jsonify({"error": "Invalid email or password"}), 401
            
            if not user.is_active:
                return jsonify({"error": "Account is deactivated"}), 401
            
            # Generate access token
            token = create_access_token(user.id, user.role)
        
        return jsonify({
            "token": token,
            "role": user.role,
            "message": "Login successful"
        }), 200


# Create the Flask application instance
app = create_app()

if __name__ == "__main__":
    # Initialize database and start application
    print("🚀 Starting Lead-Nexus API Server...")
    init_db()
    
    print("✅ Database initialized")
    print("✅ CORS configured")
    print("✅ Routes registered")
    print(f"🌐 Server running at http://localhost:5001")
    
    app.run(host="0.0.0.0", port=5001, debug=True)


