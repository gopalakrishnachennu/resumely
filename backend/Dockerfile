# Multi-stage build for optimized image size
FROM rust:1.83-slim as tectonic-builder

# Install Tectonic
RUN cargo install tectonic

# Final stage
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu-dev \
    libpng16-16 \
    && rm -rf /var/lib/apt/lists/*

# Copy Tectonic from builder
COPY --from=tectonic-builder /usr/local/cargo/bin/tectonic /usr/local/bin/tectonic

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create cache directory
RUN mkdir -p .cache

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
