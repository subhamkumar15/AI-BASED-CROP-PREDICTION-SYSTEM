"""
Crop Recommendation and Precision Prediction API
AGRISENSE Platform
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
import numpy as np
from sqlalchemy.orm import Session
from backend.app.api.deps import get_current_user_optional
from backend.app.database.connection import get_db
from backend.app.models.models import AuditLog, PredictionRecord, User
from backend.app.schemas.schemas import PredictionRequest, PredictionResponse
from ml.inference.predictor import CROP_AGRONOMIC_KNOWLEDGE, engine

router = APIRouter(prefix="/predict", tags=["Crop Intelligence"])

# Real-world authentic agronomic benchmark presets for one-click testing
SAMPLE_PRESETS = [
    {
        "id": "punjab_paddy",
        "title": "Punjab Indo-Gangetic Basin",
        "description": "High fertility alluvial soil with intensive irrigation during Kharif monsoon.",
        "data": {
            "N": 85, "P": 45, "K": 40, "temperature": 27.5, "humidity": 82.0,
            "ph": 6.8, "rainfall": 210.0, "soil_moisture": 72.0, "solar_radiation": 6.0,
            "wind_speed": 7.0, "soil_type": "alluvial", "season": "Kharif",
            "region": "North India", "location_name": "Ludhiana Farm Block 2",
            "state": "Punjab", "district": "Ludhiana", "latitude": 30.9010, "longitude": 75.8573
        }
    },
    {
        "id": "haryana_wheat",
        "title": "Haryana Rabi Wheat Belt",
        "description": "Cool winter conditions with balanced loam and moderate moisture.",
        "data": {
            "N": 115, "P": 52, "K": 42, "temperature": 18.5, "humidity": 58.0,
            "ph": 6.6, "rainfall": 65.0, "soil_moisture": 48.0, "solar_radiation": 7.5,
            "wind_speed": 6.0, "soil_type": "loam", "season": "Rabi",
            "region": "North India", "location_name": "Karnal Experimental Plot",
            "state": "Haryana", "district": "Karnal", "latitude": 29.6857, "longitude": 76.9905
        }
    },
    {
        "id": "maharashtra_cotton",
        "title": "Vidarbha Black Cotton Soil",
        "description": "Rich black regur soil with high moisture capacity and warm climate.",
        "data": {
            "N": 105, "P": 48, "K": 25, "temperature": 32.0, "humidity": 68.0,
            "ph": 7.4, "rainfall": 85.0, "soil_moisture": 52.0, "solar_radiation": 8.0,
            "wind_speed": 8.5, "soil_type": "black", "season": "Kharif",
            "region": "West India", "location_name": "Nagpur Agro Field",
            "state": "Maharashtra", "district": "Nagpur", "latitude": 21.1458, "longitude": 79.0882
        }
    },
    {
        "id": "himachal_apple",
        "title": "Himachal Apple Orchard Zone",
        "description": "Mountain loam with cool temperate climate and high humidity.",
        "data": {
            "N": 25, "P": 135, "K": 200, "temperature": 21.0, "humidity": 90.0,
            "ph": 6.0, "rainfall": 115.0, "soil_moisture": 60.0, "solar_radiation": 6.2,
            "wind_speed": 6.5, "soil_type": "mountain loam", "season": "Whole Year",
            "region": "North India", "location_name": "Shimla Valley Terraces",
            "state": "Himachal Pradesh", "district": "Shimla", "latitude": 31.1048, "longitude": 77.1734
        }
    },
    {
        "id": "kerala_coffee",
        "title": "Western Ghats Coffee & Spice Belt",
        "description": "Acidic red forest loam with heavy monsoon showers and mild temperatures.",
        "data": {
            "N": 100, "P": 30, "K": 32, "temperature": 24.5, "humidity": 65.0,
            "ph": 5.8, "rainfall": 165.0, "soil_moisture": 68.0, "solar_radiation": 5.8,
            "wind_speed": 5.5, "soil_type": "red loam", "season": "Whole Year",
            "region": "South India", "location_name": "Wayanad Highland Estate",
            "state": "Kerala", "district": "Wayanad", "latitude": 11.6854, "longitude": 76.1320
        }
    }
]

@router.post("/recommend", response_model=PredictionResponse)
def generate_crop_recommendation(
    req: PredictionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """
    Executes the trained ML model inference engine combined with agronomic suitability rules.
    Stores the prediction in the user history ledger if authenticated.
    """
    # Compute auto-derived climate indices if not manually specified
    moisture = req.soil_moisture
    if moisture is None:
        moisture = float(np.clip(40.0 + (req.rainfall * 0.10) + (req.humidity * 0.20), 15.0, 95.0))

    solar_rad = req.solar_radiation
    if solar_rad is None:
        solar_rad = float(np.clip(6.5 + (req.temperature - 25.0)*0.08 - (req.rainfall/350.0)*0.5, 3.0, 10.5))

    wind = req.wind_speed
    if wind is None:
        wind = 7.5

    # Calculate risk logits
    hw_logit = (req.temperature - 37.0) / 3.0 - (req.humidity - 50.0) / 40.0
    hw_risk = float(np.clip(1.0 / (1.0 + np.exp(-hw_logit)), 0.0, 1.0))

    drought_logit = (100.0 - req.rainfall) / 30.0 + (req.temperature - 28.0) / 6.0
    drought_risk = float(np.clip(1.0 / (1.0 + np.exp(-drought_logit)), 0.0, 1.0))

    flood_logit = (req.rainfall - 220.0) / 40.0
    flood_risk = float(np.clip(1.0 / (1.0 + np.exp(-flood_logit)), 0.0, 1.0))

    frost_logit = (14.0 - req.temperature) / 3.0
    frost_risk = float(np.clip(1.0 / (1.0 + np.exp(-frost_logit)), 0.0, 1.0))

    # Features for trained model
    input_features = {
        "N": req.N,
        "P": req.P,
        "K": req.K,
        "temperature": req.temperature,
        "humidity": req.humidity,
        "ph": req.ph,
        "rainfall": req.rainfall,
        "soil_moisture": moisture,
        "solar_radiation": solar_rad,
        "wind_speed": wind,
        "heatwave_risk": hw_risk,
        "drought_risk": drought_risk,
        "flood_risk": flood_risk,
        "frost_risk": frost_risk
    }

    try:
        results = engine.predict(input_features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    timestamp_str = datetime.now().isoformat()
    prediction_record_id = None

    # Persist in Database
    try:
        user_id = current_user.id if current_user else None
        record = PredictionRecord(
            user_id=user_id,
            farm_location=req.location_name or "Field Block A",
            state=req.state,
            district=req.district,
            latitude=req.latitude,
            longitude=req.longitude,
            season=req.season or "Kharif",
            soil_type=req.soil_type or "loam",
            input_parameters=json.dumps(req.model_dump()),
            predicted_crop=results["crop"],
            display_name=results["display_name"],
            suitability_score=results["suitability_score"],
            model_confidence=results["model_confidence"],
            model_version=results["model_version"],
            full_results=json.dumps(results)
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        prediction_record_id = record.id

        if user_id:
            audit = AuditLog(
                user_id=user_id,
                action="CROP_PREDICTED",
                details=f"Crop predicted: {results['display_name']} ({results['suitability_score']}%)"
            )
            db.add(audit)
            db.commit()
    except Exception as db_err:
        print(f"[predict] DB persistence notice: {db_err}")

    response_dict = {
        **results,
        "prediction_id": prediction_record_id,
        "timestamp": timestamp_str
    }
    return response_dict

@router.get("/presets")
def get_sample_farm_presets() -> List[Dict[str, Any]]:
    """Returns curated authentic agricultural farm scenarios for instant testing."""
    return SAMPLE_PRESETS

@router.get("/crops-list")
def get_all_supported_crops() -> List[Dict[str, Any]]:
    """Returns the encyclopedia of 22 scientifically supported crops."""
    crops_info = []
    for crop_key, data in CROP_AGRONOMIC_KNOWLEDGE.items():
        crops_info.append({
            "key": crop_key,
            "display_name": data["display_name"],
            "category": data["category"],
            "season": data["season"],
            "duration_days": data["duration_days"],
            "base_yield_quintal_acre": data["base_yield_quintal_acre"],
            "market_price_quintal": data["market_price_quintal"],
            "cost_per_acre": data["cost_per_acre"],
            "optimal_ranges": data["optimal_ranges"]
        })
    return sorted(crops_info, key=lambda x: x["display_name"])
