"""
Seed database with demo users
Run this to create demo accounts for testing
"""
import sys
sys.path.insert(0, '/Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant/backend')

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash

def seed_demo_users():
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Creating demo admin user...")
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user created: admin / admin123")
        else:
            print("✅ Admin user already exists")
        
        # Check if demo user exists
        demo = db.query(User).filter(User.username == "demo").first()
        if not demo:
            print("Creating demo user...")
            demo = User(
                username="demo",
                email="demo@example.com",
                hashed_password=get_password_hash("demo123"),
                is_active=True
            )
            db.add(demo)
            db.commit()
            print("✅ Demo user created: demo / demo123")
        else:
            print("✅ Demo user already exists")
            
        # Check if test user exists
        test = db.query(User).filter(User.username == "test").first()
        if not test:
            print("Creating test user...")
            test = User(
                username="test",
                email="testuser@example.com",
                hashed_password=get_password_hash("test123"),
                is_active=True
            )
            db.add(test)
            db.commit()
            print("✅ Test user created: test / test123")
        else:
            print("✅ Test user already exists")
            
        print("\n🎉 Demo users ready!")
        print("   admin / admin123")
        print("   demo / demo123")
        print("   test / test123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_users()
