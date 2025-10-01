#!/usr/bin/env python3
"""
Quick syntax test for the refactored backend
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    # Test importing the main app
    from app.main import app
    print("✅ Syntax check passed - app imported successfully!")
    
    # Test importing database module
    from app.core.database_clean import database, metadata, engine
    print("✅ Database module imported successfully!")
    
    # Test importing models
    from app.models.database_models import users_table, transactions_table, control_dates_table
    print("✅ Models imported successfully!")
    
    print("🎉 All imports successful - backend should start correctly!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except SyntaxError as e:
    print(f"❌ Syntax error: {e}")
except Exception as e:
    print(f"❌ Other error: {e}")