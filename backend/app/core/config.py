"""
AGRISENSE Platform Configuration
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AGRISENSE"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "agrisense_super_secure_jwt_secret_key_2026_precision_agri")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/backend/agrisense.db")
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Weather API (Open-Meteo requires no API key by default; supports high reliability)
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    GEOCODING_BASE_URL: str = "https://geocoding-api.open-meteo.com/v1"
    
    class Config:
        case_sensitive = True

settings = Settings()
