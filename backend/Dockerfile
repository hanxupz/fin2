FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire app directory structure
COPY app/ ./app/
COPY run.py .
COPY migrate_performance_indexes.py .
COPY performance_monitor.py .

# Use the new entry point
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
