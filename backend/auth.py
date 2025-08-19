from datetime import datetime, timedelta
from functools import wraps
from typing import Optional

import jwt
from flask import request, jsonify
from passlib.hash import bcrypt

from config import settings
from models import SessionLocal, User


JWT_ALG = "HS256"
JWT_EXP_MINUTES = 60 * 24


def hash_password(plain_password: str) -> str:
    return bcrypt.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.verify(plain_password, password_hash)


def create_access_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALG)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[JWT_ALG])
    except Exception:
        return None


def token_required(roles: Optional[list[str]] = None):
    roles = roles or []

    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid Authorization header"}), 401
            token = auth_header.split(" ", 1)[1]
            payload = decode_access_token(token)
            if not payload:
                return jsonify({"error": "Invalid or expired token"}), 401
            user_id = int(payload.get("sub", 0))
            role = payload.get("role")
            if roles and role not in roles:
                return jsonify({"error": "Forbidden"}), 403

            with SessionLocal() as db:
                user = db.get(User, user_id)
                if not user or not user.is_active:
                    return jsonify({"error": "User inactive or not found"}), 401
            request.user_id = user_id  # type: ignore[attr-defined]
            request.user_role = role  # type: ignore[attr-defined]
            return f(*args, **kwargs)

        return wrapper

    return decorator


