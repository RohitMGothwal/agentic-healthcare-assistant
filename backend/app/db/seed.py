"""
Seed script to create initial admin user for Agentic Healthcare Assistant
Run with: python -m app.db.seed
"""
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash


def init_db():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("📦 Database tables created")


def create_admin_user(db: Session):
    """Create admin user if it doesn't exist"""
    admin = db.query(User).filter(User.username == "admin").first()
    if admin:
        print("Admin user already exists")
        return admin
    
    admin = User(
        username="admin",
        email="admin@agentichealth.com",
        hashed_password=get_password_hash("admin123"),
        is_active=True,
        is_admin=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("✅ Admin user created successfully!")
    print("   Username: admin")
    print("   Password: admin123")
    return admin


def create_demo_user(db: Session):
    """Create demo user if it doesn't exist"""
    user = db.query(User).filter(User.username == "user").first()
    if user:
        print("Demo user already exists")
        return user
    
    user = User(
        username="user",
        email="user@example.com",
        hashed_password=get_password_hash("user123"),
        is_active=True,
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print("✅ Demo user created successfully!")
    print("   Username: user")
    print("   Password: user123")
    return user


def seed_database():
    """Initialize database and seed with initial data"""
    print("🌱 Seeding database...")
    
    # Initialize database tables
    init_db()
    
    db = SessionLocal()
    try:
        create_admin_user(db)
        create_demo_user(db)
        print("\n✨ Database seeding completed!")
        print("\nLogin credentials:")
        print("  Admin:  admin / admin123")
        print("  User:   user / user123")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
