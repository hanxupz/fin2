import databases
import sqlalchemy
from .config import settings

# Database setup
database = databases.Database(settings.DATABASE_URL)
metadata = sqlalchemy.MetaData()
engine = sqlalchemy.create_engine(settings.DATABASE_URL)

def create_tables():
    """Create all tables in the database."""
    metadata.create_all(engine)

async def connect_db():
    """Connect to the database."""
    await database.connect()

async def disconnect_db():
    """Disconnect from the database."""
    await database.disconnect()
