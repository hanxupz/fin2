#!/usr/bin/env python3
"""
Quick syntax test for the refactored backend
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    # Test core modules first
    print("🔍 Testing core modules...")
    from app.core.config import settings
    print("✅ Config imported successfully!")
    
    from app.core.security import get_password_hash, verify_password
    print("✅ Security imported successfully!")
    
    # Test database module
    print("🔍 Testing database module...")
    from app.core.database import database, metadata, engine
    print("✅ Database module imported successfully!")
    
    # Test schemas
    print("🔍 Testing schemas...")
    from app.schemas import UserCreate, User, Token
    print("✅ Schemas imported successfully!")
    
    # Test models
    print("🔍 Testing models...")
    from app.models.database_models import users_table, transactions_table, control_dates_table
    print("✅ Models imported successfully!")
    
    # Test services
    print("🔍 Testing services...")
    from app.services.user_service import UserService
    from app.services.transaction_service import TransactionService
    print("✅ Services imported successfully!")
    
    # Test routes
    print("🔍 Testing routes...")
    from app.routes import auth_router, transactions_router, control_dates_router
    print("✅ Routes imported successfully!")
    
    # Test main app
    print("🔍 Testing main app...")
    from app.main import app
    print("✅ Main app imported successfully!")
    
    print("🎉 All imports successful - no circular dependencies!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()
except SyntaxError as e:
    print(f"❌ Syntax error: {e}")
except Exception as e:
    print(f"❌ Other error: {e}")
    import traceback
    traceback.print_exc()