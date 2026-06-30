"""
Seed default test user on startup.
Skips if the user already exists.
"""
from datetime import datetime
from app.models.users import User
from app.core.security import security_manager


async def seed_test_user():
    """Create a test user if one doesn't already exist."""
    test_email = "test@wisetrade.com"

    existing = await User.find_one(User.email == test_email)
    if existing:
        print(f"Test user already exists: {test_email}")
        return

    user = User(
        username="testuser",
        first_name="Test",
        last_name="User",
        email=test_email,
        hashed_password=security_manager.get_password_hash("test1234"),
        is_active=True,
        is_verified=True,
        is_super_Admin=False,
        ai_access_blocked=False,
        auth_provider="email",
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    await user.insert()
    print(f"Test user created: {test_email} / test1234")
