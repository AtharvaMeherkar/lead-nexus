"""
Quick test script to diagnose backend startup issues.
Run this to check if all dependencies and connections work.
"""
import asyncio
import sys

print("🔍 Testing Backend Configuration...\n")

# Test 1: Check Python version
print("1. Python Version:")
print(f"   ✓ Python {sys.version}\n")

# Test 2: Check imports
print("2. Testing Imports...")
try:
    from app.core.config import get_settings
    print("   ✓ Config imported")
except Exception as e:
    print(f"   ✗ Config import failed: {e}")
    sys.exit(1)

try:
    from app.db.database import engine, async_session_maker
    print("   ✓ Database module imported")
except Exception as e:
    print(f"   ✗ Database import failed: {e}")
    sys.exit(1)

try:
    from app.models import User, Lead
    print("   ✓ Models imported")
except Exception as e:
    print(f"   ✗ Models import failed: {e}")
    sys.exit(1)

try:
    from app.api.routes import auth
    print("   ✓ API routes imported")
except Exception as e:
    print(f"   ✗ API routes import failed: {e}")
    sys.exit(1)

# Test 3: Check settings
print("\n3. Testing Settings...")
try:
    settings = get_settings()
    print(f"   ✓ App name: {settings.app_name}")
    print(f"   ✓ Database URL: {settings.database_url[:50]}...")
except Exception as e:
    print(f"   ✗ Settings failed: {e}")
    sys.exit(1)

# Test 4: Check database connection
print("\n4. Testing Database Connection...")
async def test_db():
    try:
        async with async_session_maker() as session:
            # Try a simple query
            from sqlalchemy import text
            result = await session.execute(text("SELECT 1"))
            result.scalar()
            print("   ✓ Database connection successful")
            return True
    except Exception as e:
        print(f"   ✗ Database connection failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

# Run async test
if sys.platform == "win32":
    import selectors
    loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(test_db())
    finally:
        loop.close()
else:
    result = asyncio.run(test_db())

if not result:
    print("\n❌ Database connection failed!")
    print("\nTroubleshooting:")
    print("   1. Make sure PostgreSQL is running")
    print("   2. Check database 'lead_nexus' exists")
    print("   3. Verify credentials in app/core/config.py")
    print("   4. Default: localhost:5432, user: postgres, password: postgres")
    sys.exit(1)

print("\n✅ All tests passed! Backend should start successfully.")
print("\nTo start the backend, run:")
print("   python -m uvicorn app.main:app --reload --port 8000")

