#!/usr/bin/env python3
"""
Simple test script to verify the refactored backend is working correctly.
"""

import asyncio
import httpx
from app.core.config import settings

async def test_backend():
    """Test the backend endpoints."""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        try:
            # Test health endpoint
            response = await client.get(f"{base_url}/health")
            print(f"Health check: {response.status_code} - {response.json()}")
            
            # Test CORS headers
            response = await client.options(f"{base_url}/transactions/")
            print(f"OPTIONS /transactions/: {response.status_code}")
            print(f"CORS headers: {dict(response.headers)}")
            
        except Exception as e:
            print(f"Error testing backend: {e}")

if __name__ == "__main__":
    asyncio.run(test_backend())