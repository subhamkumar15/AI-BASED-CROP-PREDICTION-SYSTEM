"""
Soil Health Diagnostics API
AGRISENSE Platform
"""

from typing import Any
from fastapi import APIRouter
from backend.app.schemas.schemas import SoilAnalysisRequest, SoilAnalysisResponse
from backend.app.services.soil_service import analyze_soil_health

router = APIRouter(prefix="/soil", tags=["Soil Health"])

@router.post("/analyze", response_model=SoilAnalysisResponse)
def analyze_soil(req: SoilAnalysisRequest) -> Any:
    """Evaluates soil test parameters against ICAR agronomic thresholds."""
    result = analyze_soil_health(
        n=req.N,
        p=req.P,
        k=req.K,
        ph=req.ph,
        moisture=req.soil_moisture or 45.0,
        soil_type=req.soil_type or "loam",
        organic_carbon=req.organic_carbon or 0.65,
        electrical_conductivity=req.electrical_conductivity or 0.8
    )
    return result
