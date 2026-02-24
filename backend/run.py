"""
run.py
------
Convenience script to launch the Uvicorn server.
Reads HOST / PORT / LOG_LEVEL from environment (or .env via dotenv).

Usage:
    python run.py
"""

import os

import uvicorn
from dotenv import load_dotenv

load_dotenv()  # load .env if present

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        log_level=os.getenv("LOG_LEVEL", "info"),
        reload=os.getenv("RELOAD", "false").lower() == "true",
    )
