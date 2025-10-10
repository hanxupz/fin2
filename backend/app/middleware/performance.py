"""
Performance monitoring middleware for FastAPI.
"""

import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware to monitor API endpoint performance."""
    
    def __init__(self, app, slow_query_threshold: float = 1.0):
        super().__init__(app)
        self.slow_query_threshold = slow_query_threshold
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Process the request
        response: Response = await call_next(request)
        
        # Calculate response time
        process_time = time.time() - start_time
        
        # Log slow requests
        if process_time > self.slow_query_threshold:
            logger.warning(
                f"Slow request: {request.method} {request.url.path} "
                f"took {process_time:.3f}s (threshold: {self.slow_query_threshold}s)"
            )
        
        # Add performance header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response