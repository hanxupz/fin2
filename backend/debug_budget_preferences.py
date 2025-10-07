#!/usr/bin/env python3
"""
Debug script for budget preferences 500 error.
This script will help identify the cause of the 500 Internal Server Error.
"""

import asyncio
import sys
import traceback
from app.core.database import database, metadata, engine
from app.models.database_models import budget_preferences_table, budget_preference_categories_table
from app.services.budget_preference_service import budget_preference_service
from sqlalchemy import text

async def debug_budget_preferences():
    """Debug budget preferences functionality."""
    
    try:
        print("🔍 Starting budget preferences debug...")
        
        # 1. Test database connection
        print("\n1. Testing database connection...")
        await database.connect()
        print("✅ Database connected successfully")
        
        # 2. Check if tables exist
        print("\n2. Checking if tables exist...")
        
        # Check budget_preferences table
        try:
            result = await database.execute(text("SELECT 1 FROM budget_preferences LIMIT 1"))
            print("✅ budget_preferences table exists")
        except Exception as e:
            print(f"❌ budget_preferences table issue: {e}")
        
        # Check budget_preference_categories table
        try:
            result = await database.execute(text("SELECT 1 FROM budget_preference_categories LIMIT 1"))
            print("✅ budget_preference_categories table exists")
        except Exception as e:
            print(f"❌ budget_preference_categories table issue: {e}")
        
        # 3. Test basic query on budget preferences
        print("\n3. Testing basic queries...")
        
        try:
            # Test simple select
            query = "SELECT COUNT(*) as count FROM budget_preferences"
            result = await database.fetch_one(text(query))
            count = result['count'] if result else 0
            print(f"✅ Found {count} budget preferences in database")
        except Exception as e:
            print(f"❌ Error querying budget_preferences: {e}")
            traceback.print_exc()
        
        try:
            # Test categories table
            query = "SELECT COUNT(*) as count FROM budget_preference_categories"
            result = await database.fetch_one(text(query))
            count = result['count'] if result else 0
            print(f"✅ Found {count} budget preference categories in database")
        except Exception as e:
            print(f"❌ Error querying budget_preference_categories: {e}")
            traceback.print_exc()
        
        # 4. Test the service method that's failing
        print("\n4. Testing budget preference service...")
        
        # Test with a dummy user ID (1)
        test_user_id = 1
        try:
            summary = await budget_preference_service.get_user_budget_preferences(test_user_id)
            print(f"✅ Service method works! Found {len(summary.budget_preferences)} preferences for user {test_user_id}")
            print(f"   Total percentage: {summary.total_percentage}%")
            print(f"   Is complete: {summary.is_complete}")
            print(f"   Missing percentage: {summary.missing_percentage}%")
            print(f"   Overlapping categories: {summary.overlapping_categories}")
        except Exception as e:
            print(f"❌ Error in budget preference service: {e}")
            traceback.print_exc()
        
        # 5. Test with different user IDs to find which one has data
        print("\n5. Testing with different user IDs...")
        
        try:
            # Get all unique user IDs from budget_preferences table
            query = "SELECT DISTINCT user_id FROM budget_preferences ORDER BY user_id"
            user_results = await database.fetch_all(text(query))
            
            if user_results:
                print(f"✅ Found budget preferences for users: {[row['user_id'] for row in user_results]}")
                
                # Test the service with the first user that has data
                first_user_id = user_results[0]['user_id']
                summary = await budget_preference_service.get_user_budget_preferences(first_user_id)
                print(f"✅ Service works for user {first_user_id}!")
                print(f"   Budget preferences: {len(summary.budget_preferences)}")
                for bp in summary.budget_preferences:
                    print(f"   - {bp.name}: {bp.percentage}% ({len(bp.categories)} categories)")
            else:
                print("ℹ️  No budget preferences found in database")
        except Exception as e:
            print(f"❌ Error testing with existing users: {e}")
            traceback.print_exc()
        
        print("\n6. Testing table structure...")
        try:
            # Check table structure
            query = """
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'budget_preferences' 
            ORDER BY ordinal_position
            """
            columns = await database.fetch_all(text(query))
            print("✅ budget_preferences table structure:")
            for col in columns:
                print(f"   {col['column_name']}: {col['data_type']} ({'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'})")
        except Exception as e:
            print(f"❌ Error checking table structure: {e}")
        
    except Exception as e:
        print(f"❌ Critical error during debug: {e}")
        traceback.print_exc()
    finally:
        try:
            await database.disconnect()
            print("\n✅ Database disconnected")
        except:
            pass

def main():
    """Main function."""
    print("Budget Preferences Debug Tool")
    print("=" * 40)
    
    try:
        asyncio.run(debug_budget_preferences())
    except KeyboardInterrupt:
        print("\n❌ Debug interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Debug failed: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    print("\n🎉 Debug completed!")

if __name__ == "__main__":
    main()