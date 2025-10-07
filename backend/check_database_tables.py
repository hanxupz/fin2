"""
Database Tables Check Script

This script checks if all required tables exist in the database.
Use this to diagnose missing tables causing 500 errors.
"""

import asyncio
from app.core.database import database

async def check_database_tables():
    """Check if all required tables exist."""
    try:
        await database.connect()
        print("Connected to database successfully.")
        
        # List of required tables
        required_tables = [
            'users',
            'transactions', 
            'control_dates',
            'credits',
            'credit_payments',
            'budget_preferences',
            'budget_preference_categories'
        ]
        
        print("\nChecking database tables:")
        print("-" * 40)
        
        existing_tables = []
        missing_tables = []
        
        for table in required_tables:
            query = """
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = :table_name
            );
            """
            
            result = await database.fetch_one(query, {"table_name": table})
            exists = result[0] if result else False
            
            if exists:
                print(f"✅ {table}")
                existing_tables.append(table)
            else:
                print(f"❌ {table} (MISSING)")
                missing_tables.append(table)
        
        print("-" * 40)
        print(f"Total tables: {len(required_tables)}")
        print(f"Existing: {len(existing_tables)}")
        print(f"Missing: {len(missing_tables)}")
        
        if missing_tables:
            print(f"\n⚠️  Missing tables causing 500 errors: {', '.join(missing_tables)}")
            print("Run the migration script to create missing tables.")
        else:
            print("\n✅ All required tables exist!")
            
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
    finally:
        await database.disconnect()

if __name__ == "__main__":
    asyncio.run(check_database_tables())