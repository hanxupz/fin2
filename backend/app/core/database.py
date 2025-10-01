import databases
import sqlalchemy
import asyncio
import logging
import time
from .config import settings

logger = logging.getLogger(__name__)

# Database setup with error handling
def get_database_url():
    \"\"\"Get database URL with proper format.\"\"\"
    url = settings.DATABASE_URL
    # Ensure we're using the correct PostgreSQL driver
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql+psycopg2://', 1)
    elif url.startswith('postgresql://') and '+psycopg2' not in url:
        url = url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    return url

# Database connection
database_url = get_database_url()
logger.info(\"Using database URL with PostgreSQL driver\")

database = databases.Database(database_url)
metadata = sqlalchemy.MetaData()

# Create engine with connection pooling and retry
engine = sqlalchemy.create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

def create_tables():
    \"\"\"Create all tables in the database.\"\"\"
    metadata.create_all(engine)

async def connect_db():
    \"\"\"Connect to the database.\"\"\"
    await database.connect()

async def disconnect_db():
    \"\"\"Disconnect from the database.\"\"\"
    await database.disconnect()
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

# Create engine with connection pooling and retry
engine = sqlalchemy.create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

def create_tables():
    """Create all tables in the database with retry mechanism."""
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to create database tables (attempt {attempt + 1}/{max_retries})")
            metadata.create_all(engine)
            logger.info("Database tables created successfully")
            return
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.error("All database connection attempts failed")
                raise

async def connect_db():
    """Connect to the database with retry mechanism."""
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to database (attempt {attempt + 1}/{max_retries})")
            await database.connect()
            logger.info("Database connected successfully")
            return
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                retry_delay *= 2
            else:
                logger.error("All database connection attempts failed")
                raise

async def disconnect_db():
    """Disconnect from the database."""
    try:
        await database.disconnect()
        logger.info("Database disconnected successfully")
    except Exception as e:
        logger.warning(f"Error during database disconnect: {e}")
import sqlalchemdef create_tables():
    \"\"\"Create all tables in the database with retry mechanism.\"\"\"\n    max_retries = 5\n    retry_delay = 2\n    \n    for attempt in range(max_retries):\n        try:\n            logger.info(f\"Attempting to create database tables (attempt {attempt + 1}/{max_retries})\")\n            metadata.create_all(engine)\n            logger.info(\"Database tables created successfully\")\n            return\n        except Exception as e:\n            logger.warning(f\"Database connection attempt {attempt + 1} failed: {e}\")\n            if attempt < max_retries - 1:\n                logger.info(f\"Retrying in {retry_delay} seconds...\")\n                time.sleep(retry_delay)\n                retry_delay *= 2  # Exponential backoff\n            else:\n                logger.error(\"All database connection attempts failed\")\n                raise\n\nasync def connect_db():\n    \"\"\"Connect to the database with retry mechanism.\"\"\"\n    max_retries = 5\n    retry_delay = 2\n    \n    for attempt in range(max_retries):\n        try:\n            logger.info(f\"Attempting to connect to database (attempt {attempt + 1}/{max_retries})\")\n            await database.connect()\n            logger.info(\"Database connected successfully\")\n            return\n        except Exception as e:\n            logger.warning(f\"Database connection attempt {attempt + 1} failed: {e}\")\n            if attempt < max_retries - 1:\n                logger.info(f\"Retrying in {retry_delay} seconds...\")\n                await asyncio.sleep(retry_delay)\n                retry_delay *= 2\n            else:\n                logger.error(\"All database connection attempts failed\")\n                raise\n\nasync def disconnect_db():\n    \"\"\"Disconnect from the database.\"\"\"\n    try:\n        await database.disconnect()\n        logger.info(\"Database disconnected successfully\")\n    except Exception as e:\n        logger.warning(f\"Error during database disconnect: {e}\")ogging
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
logger.info(f"Using database URL: {database_url.split('@')[0]}@***")

database = databases.Database(database_url)
metadata = sqlalchemy.MetaData()

# Create engine with connection pooling and retry
engine = sqlalchemy.create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=300,
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
