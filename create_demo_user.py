#!/usr/bin/env python3
"""Create demo user in database"""
import sys
sys.path.insert(0, '/Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant/backend')

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select

# Create tables
Base.metadata.create_all(bind=engine)
print('✅ Tables created')

db = SessionLocal()
try:
    # Check if demo user exists
    result = db.execute(select(User).where(User.username == 'demo')).first()
    if not result:
        demo = User(
            username='demo',
            email='demo@example.com',
            hashed_password=get_password_hash('demo123'),
            is_active=True,
            is_admin=False
        )
        db.add(demo)
        db.commit()
        print('✅ Demo user created successfully!')
    else:
        print('ℹ️  Demo user already exists')
    
    print('\n🔐 Login credentials:')
    print('   Admin: admin / admin123')
    print('   Demo:  demo / demo123')
    
except Exception as e:
    print(f'❌ Error: {e}')
    db.rollback()
finally:
    db.close()
