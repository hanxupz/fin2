import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.database import create_tables, connect_db, disconnect_db
from .routes import auth_router, transactions_router, control_dates_router, credits_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# Configure CORS with enhanced settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "*",
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["*"],
    max_age=86400,  # 24 hours
)

# Include routers
app.include_router(auth_router, tags=["authentication"])
app.include_router(transactions_router, prefix="/transactions", tags=["transactions"])
app.include_router(control_dates_router, prefix="/config/control_date", tags=["control_dates"])
app.include_router(credits_router, prefix="/credits", tags=["credits"])

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
        
        # Log CORS configuration
        cors_origins = ["*"] if settings.DEBUG else settings.CORS_ORIGINS
        logger.info(f"CORS middleware configured. Debug mode: {settings.DEBUG}")
        logger.info(f"Allowed origins: {cors_origins}")
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

# Explicit OPTIONS handler for CORS preflight
@app.options("/{path:path}")
async def options_handler():
    """Handle CORS preflight requests."""
    return {"message": "OK"}
