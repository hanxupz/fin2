#!/usr/bin/env python3
"""
Entry point for the refactored Finance Tracker API.
This replaces the old main.py file.
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )