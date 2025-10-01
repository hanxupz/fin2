import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.database import create_tables, connect_db, disconnect_db
from .routes import auth_router, transactions_router, control_dates_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, tags=["authentication"])
app.include_router(transactions_router, prefix="/transactions", tags=["transactions"])
app.include_router(control_dates_router, prefix="/config/control_date", tags=["control_dates"])

# Application lifecycle events
@app.on_event("startup")
async def startup():
    """Initialize application on startup."""
    logger.info("Starting up application...")
    try:
        # Create database tables
        create_tables()
        logger.info("Database tables created/verified.")
        
        # Connect to database
        await connect_db()
        logger.info("Database connection established.")
        
        logger.info(f"CORS middleware configured. Allowed origins: {settings.CORS_ORIGINS}")
        logger.info("Application startup complete.")
        
    except Exception as e:
        logger.error(f"Application startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown():
    """Cleanup on application shutdown."""
    logger.info("Shutting down application...")
    await disconnect_db()
    logger.info("Application shutdown complete.")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "app": settings.APP_NAME}
