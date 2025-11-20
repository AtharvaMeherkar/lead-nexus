"""
Script to create an admin user in the database.
Run this once to create your first admin account.

Usage:
    python create_admin.py
"""
import asyncio
import selectors
import sys

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.database import async_session_maker
from app.models import User


async def create_admin():
    """Create an admin user."""
    email = input("Enter admin email: ").strip()
    password = input("Enter admin password (min 8 characters): ").strip()

    if len(password) < 8:
        print("Error: Password must be at least 8 characters long.")
        sys.exit(1)

    async with async_session_maker() as session:
        # Check if user already exists
        result = await session.execute(select(User).where(User.email == email))
        existing_user = result.scalars().first()

        if existing_user:
            # Update existing user to admin
            existing_user.role = "admin"
            existing_user.hashed_password = get_password_hash(password)
            await session.commit()
            print(f"✓ Updated user '{email}' to admin role.")
        else:
            # Create new admin user
            admin_user = User(
                email=email,
                hashed_password=get_password_hash(password),
                role="admin",
            )
            session.add(admin_user)
            await session.commit()
            print(f"✓ Created admin user '{email}'.")

    print("\nYou can now login at: http://localhost:5173")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("\nNote: Admin users will be redirected to the admin panel after login.")


if __name__ == "__main__":
    # Fix for Windows: Use SelectorEventLoop instead of ProactorEventLoop
    if sys.platform == "win32":
        loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(create_admin())
        finally:
            loop.close()
    else:
        asyncio.run(create_admin())

