"""
Budget Preferences Database Migration Script

This script creates the required tables for budget preferences functionality.
Run this in the Docker container to add budget preferences support.

Usage:
- Inside Docker container: python migrate_budget_preferences.py
- From host: docker exec -it transactions_backend python migrate_budget_preferences.py
"""

import asyncio
import os
import sys
sys.path.insert(0, '/app')

from app.core.database import database, metadata
from app.models.database_models import budget_preferences_table, budget_preference_categories_table

async def create_budget_preferences_tables():
    """Create budget preferences tables if they don't exist."""
    try:
        # Connect to database
        await database.connect()
        print("Connected to database successfully.")
        
        # Create tables
        print("Creating budget preferences tables...")
        
        # This will create tables that don't exist
        async with database.transaction():
            # Create budget_preferences table
            create_budget_preferences_sql = """
            CREATE TABLE IF NOT EXISTS budget_preferences (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                percentage FLOAT NOT NULL,
                user_id INTEGER NOT NULL,
                create_by INTEGER NOT NULL,
                create_date TIMESTAMP NOT NULL,
                update_by INTEGER NOT NULL,
                update_date TIMESTAMP NOT NULL
            );
            """
            
            # Create budget_preference_categories table
            create_categories_sql = """
            CREATE TABLE IF NOT EXISTS budget_preference_categories (
                id SERIAL PRIMARY KEY,
                budget_preference_id INTEGER NOT NULL,
                category VARCHAR NOT NULL,
                create_by INTEGER NOT NULL,
                create_date TIMESTAMP NOT NULL,
                CONSTRAINT uq_budget_preference_category UNIQUE (budget_preference_id, category)
            );
            """
            
            await database.execute(create_budget_preferences_sql)
            print("✅ Created budget_preferences table")
            
            await database.execute(create_categories_sql)
            print("✅ Created budget_preference_categories table")
            
        print("✅ Budget preferences tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise
    finally:
        await database.disconnect()
        print("Disconnected from database.")

if __name__ == "__main__":
    asyncio.run(create_budget_preferences_tables())