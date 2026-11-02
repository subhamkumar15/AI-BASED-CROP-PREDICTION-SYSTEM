"""
AGRISENSE Platform — FastAPI Backend Application
"""

import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import admin, auth, chat, history, pest, predict, soil, weather
from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.database.connection import Base, SessionLocal, engine
from backend.app.models.models import AuditLog, ModelTrainingRecord, PredictionRecord, User

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables
    Base.metadata.create_all(bind=engine)
    print("[AGRISENSE] Database tables initialized.")

    # 2. Seed Default Accounts & Initial Data if needed
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@agrisense.ai").first()
        if not admin_user:
            admin_user = User(
                email="admin@agrisense.ai",
                hashed_password=hash_password("admin123"),
                full_name="Subham Kumar (Platform Architect)",
                role="admin",
                subscription="enterprise",
                region="North India",
                phone="+91 98765 43210"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("[AGRISENSE] Default Administrator account seeded (admin@agrisense.ai / admin123).")

        demo_farmer = db.query(User).filter(User.email == "farmer@agrisense.ai").first()
        if not demo_farmer:
            demo_farmer = User(
                email="farmer@agrisense.ai",
                hashed_password=hash_password("farmer123"),
                full_name="Ravi Kishan Sharma",
                role="farmer",
                subscription="pro",
                region="North India",
                phone="+91 98123 45678"
            )
            db.add(demo_farmer)
            db.commit()
            db.refresh(demo_farmer)
            print("[AGRISENSE] Default Farmer account seeded (farmer@agrisense.ai / farmer123).")

        # Seed initial prediction records if table is empty
        pred_count = db.query(PredictionRecord).count()
        if pred_count == 0:
            seed_predictions = [
                {
                    "user_id": demo_farmer.id,
                    "farm_location": "Ludhiana Block 1",
                    "state": "Punjab",
                    "district": "Ludhiana",
                    "latitude": 30.9010,
                    "longitude": 75.8573,
                    "season": "Kharif",
                    "soil_type": "alluvial",
                    "input_parameters": json.dumps({"N": 85, "P": 45, "K": 40, "temperature": 27.5, "humidity": 82, "ph": 6.8, "rainfall": 210}),
                    "predicted_crop": "rice",
                    "display_name": "Rice (Paddy)",
                    "suitability_score": 96.5,
                    "model_confidence": 98.4,
                    "model_version": "v2.4.0",
                    "full_results": json.dumps({
                        "crop": "rice",
                        "display_name": "Rice (Paddy)",
                        "category": "Cereal / Staple",
                        "suitability_score": 96.5,
                        "model_confidence": 98.4,
                        "soil_compatibility": 95.0,
                        "weather_compatibility": 98.0,
                        "top_alternatives": [
                            {"crop": "jute", "display_name": "Jute (Golden Fiber)", "category": "Commercial", "suitability_score": 88.0, "confidence": 12.0, "duration_days": 120, "market_price": 5050, "season": "Kharif"},
                            {"crop": "maize", "display_name": "Maize (Corn)", "category": "Cereal", "suitability_score": 84.5, "confidence": 8.0, "duration_days": 105, "market_price": 2090, "season": "Kharif"}
                        ],
                        "economics": {"base_yield_quintal_acre": 22.5, "market_price_quintal": 2250, "cost_per_acre": 24000, "gross_revenue": 50625, "net_profit": 26625, "roi_percent": 110.9},
                        "agronomic_advisory": {"duration_days": 135, "season": "Kharif", "preferred_soil": ["clayey", "alluvial"], "fertilizer_guidance": "Apply Urea in 3 splits.", "irrigation_guidance": "Maintain 2-5 cm standing water."}
                    })
                },
                {
                    "user_id": demo_farmer.id,
                    "farm_location": "Nagpur Black Regur Plot",
                    "state": "Maharashtra",
                    "district": "Nagpur",
                    "latitude": 21.1458,
                    "longitude": 79.0882,
                    "season": "Kharif",
                    "soil_type": "black",
                    "input_parameters": json.dumps({"N": 105, "P": 48, "K": 25, "temperature": 32.0, "humidity": 68, "ph": 7.4, "rainfall": 85}),
                    "predicted_crop": "cotton",
                    "display_name": "Cotton (White Gold)",
                    "suitability_score": 94.2,
                    "model_confidence": 97.1,
                    "model_version": "v2.4.0",
                    "full_results": json.dumps({
                        "crop": "cotton",
                        "display_name": "Cotton (White Gold)",
                        "category": "Commercial / Fiber",
                        "suitability_score": 94.2,
                        "model_confidence": 97.1,
                        "soil_compatibility": 96.0,
                        "weather_compatibility": 92.5,
                        "top_alternatives": [
                            {"crop": "maize", "display_name": "Maize (Corn)", "category": "Cereal", "suitability_score": 82.0, "confidence": 15.0, "duration_days": 105, "market_price": 2090, "season": "Kharif"}
                        ],
                        "economics": {"base_yield_quintal_acre": 10.5, "market_price_quintal": 7020, "cost_per_acre": 25000, "gross_revenue": 73710, "net_profit": 48710, "roi_percent": 194.8},
                        "agronomic_advisory": {"duration_days": 165, "season": "Kharif", "preferred_soil": ["black", "clay loam"], "fertilizer_guidance": "Apply NPK 120:60:60.", "irrigation_guidance": "Irrigate at flowering and boll formation."}
                    })
                }
            ]
            for sp in seed_predictions:
                r = PredictionRecord(**sp)
                db.add(r)
            db.commit()
            print("[AGRISENSE] Sample prediction history records seeded.")

    finally:
        db.close()

    yield
    print("[AGRISENSE] Server shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade AI-Powered Precision Agriculture Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(predict.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(soil.router, prefix=settings.API_V1_STR)
app.include_router(pest.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": "AGRISENSE",
        "description": "AI-Powered Precision Agriculture & Crop Intelligence Platform",
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
