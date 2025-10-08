import databases
import sqlalchemy
import asyncio
import logging
import time
from .config import settings

logger = logging.getLogger(__name__)

# Database setup with error handling
def get_database_url():
    """Get database URL with proper format."""
    url = settings.DATABASE_URL
    # Ensure we're using the correct PostgreSQL driver
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql+psycopg2://', 1)
    elif url.startswith('postgresql://') and '+psycopg2' not in url:
        url = url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    return url

# Database connection
database_url = get_database_url()
logger.info("Using database URL with PostgreSQL driver")

database = databases.Database(database_url)
metadata = sqlalchemy.MetaData()

# Create engine with optimized connection pooling
engine = sqlalchemy.create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=3600,  # 1 hour instead of 5 minutes for better performance
    pool_size=20,       # Explicit pool size for better resource management
    max_overflow=30,    # Allow overflow connections for peak loads
    pool_timeout=30,    # Connection timeout
    echo=settings.DEBUG
)

def create_tables():
    """Create all tables in the database."""
    metadata.create_all(engine)

async def connect_db():
    """Connect to the database."""
    await database.connect()

async def disconnect_db():
    """Disconnect from the database."""
    await database.disconnect()