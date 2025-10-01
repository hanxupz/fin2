import os
from typing import List

class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://user:password@db:5432/transactions")
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkey")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS - Production-ready configuration
    CORS_ORIGINS: List[str] = [
        "https://finance.theonet.uk",
        "https://finance-backend.theonet.uk", 
        "http://192.168.1.97:3000",
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    # App
    APP_NAME: str = "Finance Tracker API"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
settings = Settings()
