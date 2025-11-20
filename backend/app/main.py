from contextlib import asynccontextmanager
import sys

# Python 3.13 compatibility patch for aioredis (must be before any aioredis imports)
if sys.version_info >= (3, 13):
    try:
        # Patch aioredis exceptions before it's imported
        import importlib.util
        import pathlib
        import importlib
        
        # Find aioredis package
        aioredis_spec = importlib.util.find_spec("aioredis")
        if aioredis_spec and aioredis_spec.origin:
            aioredis_path = pathlib.Path(aioredis_spec.origin).parent
            exceptions_file = aioredis_path / "exceptions.py"
            
            if exceptions_file.exists():
                # Read the file
                content = exceptions_file.read_text(encoding="utf-8")
                # Fix the duplicate base class issue
                if "class TimeoutError(asyncio.TimeoutError, builtins.TimeoutError, RedisError):" in content:
                    content = content.replace(
                        "class TimeoutError(asyncio.TimeoutError, builtins.TimeoutError, RedisError):",
                        "class TimeoutError(asyncio.TimeoutError, RedisError):"
                    )
                    exceptions_file.write_text(content, encoding="utf-8")
                    # Clear any cached bytecode
                    importlib.invalidate_caches()
    except Exception:
        # If patching fails, continue anyway - might already be patched
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.admin.setup import admin, admin_router, init_admin
from app.api.routes import auth, invoices, leads, public, subscription
from app.core.config import get_settings
from app.db.database import Base, engine

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await init_admin(app)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CORS configuration - supports both development and production
# Note: Cannot use allow_origins=["*"] with allow_credentials=True
cors_origins = settings.cors_origins_list

# Add default development origins if in development and no CORS configured
if settings.environment == "development" and not cors_origins:
    cors_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

# Ensure we have at least one origin (required for allow_credentials=True)
if not cors_origins:
    # In production, if no CORS_ORIGINS is set, allow all (but this won't work with credentials)
    # Better to set CORS_ORIGINS in environment variables
    print("Warning: No CORS origins configured. Setting to empty list (may cause CORS issues).")
    cors_origins = ["*"]  # This will be converted to allow all, but credentials won't work

# Check if any Vercel production URL is configured
has_vercel_production = any("vercel.app" in origin for origin in cors_origins) if cors_origins != ["*"] else False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=cors_origins != ["*"],  # Disable credentials if allowing all
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to handle Vercel preview URLs
# If any Vercel production URL is configured, allow all Vercel preview URLs
from starlette.requests import Request

if has_vercel_production:
    @app.middleware("http")
    async def vercel_preview_cors_handler(request: Request, call_next):
        """Allow all Vercel preview URLs if production Vercel URL is configured"""
        origin = request.headers.get("origin")
        
        if origin and "vercel.app" in origin:
            # This is a Vercel URL (production or preview)
            # Allow it if we have any Vercel production URL configured
            response = await call_next(request)
            # Override CORS headers to allow this origin
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            return response
        
        return await call_next(request)


app.include_router(public.router, prefix=settings.api_v1_prefix)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(subscription.router, prefix=settings.api_v1_prefix)
app.include_router(leads.router, prefix=settings.api_v1_prefix)
app.include_router(invoices.router, prefix=settings.api_v1_prefix)
app.include_router(admin_router)
# Admin is mounted via admin.configure() in init_admin()


@app.get("/")
async def root():
    return {
        "message": "Lead-Nexus API",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}


