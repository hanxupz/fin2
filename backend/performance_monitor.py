#!/usr/bin/env python3
"""
Performance monitoring script to analyze database query performance.
"""

import asyncio
import logging
import sqlalchemy
from app.core.database import engine
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def analyze_performance():
    """Analyze database performance metrics."""
    try:
        with engine.connect() as conn:
            logger.info("=== Database Performance Analysis ===")
            logger.info(f"Analysis time: {datetime.now()}")
            
            # Check table sizes
            logger.info("\n📊 Table Sizes:")
            tables = ['users', 'transactions', 'credits', 'credit_payments', 
                     'budget_preferences', 'budget_preference_categories', 'control_dates']
            
            for table in tables:
                result = conn.execute(sqlalchemy.text(f"SELECT COUNT(*) FROM {table}")).fetchone()
                count = result[0] if result else 0
                logger.info(f"  {table}: {count:,} rows")
            
            # Check index usage (PostgreSQL specific)
            logger.info("\n🔍 Index Information:")
            try:
                index_query = """
                    SELECT 
                        schemaname,
                        relname as tablename,
                        indexrelname as indexname,
                        idx_scan as index_scans,
                        idx_tup_read as tuples_read,
                        idx_tup_fetch as tuples_fetched
                    FROM pg_stat_user_indexes 
                    WHERE schemaname = 'public'
                    ORDER BY idx_scan DESC
                    LIMIT 10;
                """
                result = conn.execute(sqlalchemy.text(index_query)).fetchall()
                
                if result:
                    for row in result:
                        logger.info(f"  {row[1]}.{row[2]}: {row[3]:,} scans, {row[4]:,} tuples read")
                else:
                    logger.info("  No index usage statistics available yet")
                    
            except Exception as e:
                logger.warning(f"Could not fetch index statistics: {e}")
            
            # Check for missing indexes on foreign keys
            logger.info("\n⚠️  Checking for potential performance issues:")
            
            # Check if indexes exist
            try:
                index_check_query = """
                    SELECT 
                        tablename,
                        indexname,
                        indexdef
                    FROM pg_indexes 
                    WHERE schemaname = 'public'
                    AND (
                        indexname LIKE '%user_id%' OR 
                        indexname LIKE '%control_date%' OR
                        indexname LIKE '%date%'
                    )
                    ORDER BY tablename, indexname;
                """
                indexes = conn.execute(sqlalchemy.text(index_check_query)).fetchall()
                
                if indexes:
                    logger.info("  Key performance indexes found:")
                    for idx in indexes:
                        logger.info(f"    {idx[0]}.{idx[1]}")
                else:
                    logger.warning("  ⚠️  No performance indexes found! Run migrate_performance_indexes.py")
                
            except Exception as e:
                logger.warning(f"Could not check indexes: {e}")
            
            # Sample query performance for transactions (fixed transaction handling)
            try:
                conn.commit()  # Ensure clean transaction state
                start_time = datetime.now()
                result = conn.execute(sqlalchemy.text("""
                    SELECT COUNT(*) FROM transactions 
                    WHERE user_id = (SELECT MIN(id) FROM users LIMIT 1)
                """)).fetchone()
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds() * 1000
                
                logger.info(f"  Sample transaction count query: {duration:.2f}ms")
                
            except Exception as e:
                logger.warning(f"Could not test sample query: {e}")
            
            # Connection pool stats
            logger.info(f"\n🔌 Connection Pool Status:")
            logger.info(f"  Pool size: {engine.pool.size()}")
            logger.info(f"  Checked out connections: {engine.pool.checkedout()}")
            logger.info(f"  Overflow connections: {engine.pool.overflow()}")
            
            logger.info("\n✅ Performance analysis completed!")
            
    except Exception as e:
        logger.error(f"Performance analysis failed: {e}")

def main():
    """Main entry point."""
    logger.info("Database Performance Monitor")
    
    try:
        asyncio.run(analyze_performance())
    except KeyboardInterrupt:
        logger.info("Monitoring cancelled by user")
    except Exception as e:
        logger.error(f"Monitoring failed: {e}")

if __name__ == "__main__":
    main()