"""
Weather Intelligence and Climate Risk Endpoints
AGRISENSE Platform
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.schemas import WeatherResponse
from backend.app.services.weather_service import PRESET_REGIONS, weather_service

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

@router.get("/live", response_model=WeatherResponse)
async def get_live_weather(
    lat: float = Query(30.9010, description="Latitude"),
    lon: float = Query(75.8573, description="Longitude"),
    location: Optional[str] = Query("Ludhiana, Punjab", description="Location name")
) -> Any:
    """Retrieves real-time weather and 7-day agro-climatic forecast."""
    try:
        data = await weather_service.get_live_weather(lat, lon, location)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

@router.get("/search")
async def search_location(query: str = Query(..., min_length=2, description="Location search query")) -> Any:
    """Geocodes a location name (district, city, state) to geographical coordinates."""
    result = await weather_service.geocode_location(query)
    if not result:
        raise HTTPException(status_code=404, detail="Location not found.")
    return result

@router.get("/regions")
def get_preset_regions() -> List[Dict[str, Any]]:
    """Returns curated agricultural hub regions across India."""
    return list(PRESET_REGIONS.values())
