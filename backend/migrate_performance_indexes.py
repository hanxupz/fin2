#!/usr/bin/env python3
"""
Performance optimization migration script.
Adds indexes to improve query performance.
"""

import sys
import asyncio
import logging
import sqlalchemy
from app.core.database import engine, database_url

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SQL statements to create performance indexes
PERFORMANCE_INDEXES = [
    # User-related indexes
    "CREATE INDEX IF NOT EXISTS idx_control_dates_user_id ON control_dates(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_budget_preferences_user_id ON budget_preferences(user_id);",
    
    # Transaction indexes for common queries
    "CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);",
    "CREATE INDEX IF NOT EXISTS idx_transactions_control_date ON transactions(control_date);",
    "CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);",
    "CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account);",
    
    # Composite indexes for common query patterns
    "CREATE INDEX IF NOT EXISTS idx_transactions_user_control_date ON transactions(user_id, control_date);",
    "CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);",
    
    # Credit payment indexes
    "CREATE INDEX IF NOT EXISTS idx_credit_payments_credit_id ON credit_payments(credit_id);",
    "CREATE INDEX IF NOT EXISTS idx_credit_payments_date ON credit_payments(date);",
    
    # Budget preference category indexes
    "CREATE INDEX IF NOT EXISTS idx_budget_preference_categories_bp_id ON budget_preference_categories(budget_preference_id);",
    "CREATE INDEX IF NOT EXISTS idx_budget_preference_categories_category ON budget_preference_categories(category);",
]

async def run_migration():
    """Run the performance optimization migration."""
    try:
        # Create synchronous connection for DDL operations
        with engine.connect() as conn:
            logger.info("Starting performance optimization migration...")
            
            for i, sql in enumerate(PERFORMANCE_INDEXES, 1):
                try:
                    logger.info(f"Creating index {i}/{len(PERFORMANCE_INDEXES)}...")
                    conn.execute(sqlalchemy.text(sql))
                    conn.commit()
                    logger.info(f"✓ Index {i} created successfully")
                except Exception as e:
                    logger.warning(f"⚠ Index {i} creation failed (may already exist): {e}")
            
            logger.info("Performance optimization migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)

def main():
    """Main entry point."""
    logger.info("Performance Optimization Migration Script")
    logger.info("This script will add indexes to improve query performance")
    
    try:
        asyncio.run(run_migration())
        logger.info("All indexes created successfully!")
    except KeyboardInterrupt:
        logger.info("Migration cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()