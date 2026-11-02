"""
Pydantic Validation Schemas
AGRISENSE Platform
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: Optional[str] = "farmer"
    region: Optional[str] = "North India"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    subscription: str
    region: str
    phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PlanUpgrade(BaseModel):
    plan_id: str  # 'free', 'pro', 'enterprise'

# --- PREDICTION SCHEMAS ---
class PredictionRequest(BaseModel):
    N: float = Field(..., ge=0, le=250, description="Nitrogen content in soil (kg/ha)")
    P: float = Field(..., ge=0, le=250, description="Phosphorus content in soil (kg/ha)")
    K: float = Field(..., ge=0, le=300, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=-15, le=60, description="Temperature (°C)")
    humidity: float = Field(..., ge=5, le=100, description="Relative humidity (%)")
    ph: float = Field(..., ge=3.0, le=10.0, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=1000, description="Rainfall (mm)")
    soil_moisture: Optional[float] = Field(None, ge=5, le=100, description="Soil moisture content (%)")
    solar_radiation: Optional[float] = Field(None, ge=1.0, le=15.0, description="Solar radiation (kWh/m²/day)")
    wind_speed: Optional[float] = Field(None, ge=0.0, le=60.0, description="Wind speed (km/h)")
    soil_type: Optional[str] = "loam"
    season: Optional[str] = "Kharif"
    region: Optional[str] = "North India"
    location_name: Optional[str] = "Field Block A"
    state: Optional[str] = "Punjab"
    district: Optional[str] = "Ludhiana"
    latitude: Optional[float] = 30.9010
    longitude: Optional[float] = 75.8573

class AlternativeCrop(BaseModel):
    crop: str
    display_name: str
    category: str
    confidence: float
    suitability_score: float
    duration_days: int
    market_price: float
    season: str

class PredictionEconomics(BaseModel):
    base_yield_quintal_acre: float
    market_price_quintal: float
    cost_per_acre: float
    gross_revenue: float
    net_profit: float
    roi_percent: float

class AgronomicAdvisory(BaseModel):
    duration_days: int
    season: str
    preferred_soil: List[str]
    fertilizer_guidance: str
    irrigation_guidance: str

class PredictionResponse(BaseModel):
    prediction_id: Optional[int] = None
    crop: str
    display_name: str
    category: str
    model_confidence: float
    suitability_score: float
    soil_compatibility: float
    weather_compatibility: float
    top_alternatives: List[AlternativeCrop]
    radar_data: List[Dict[str, Any]]
    economics: PredictionEconomics
    agronomic_advisory: AgronomicAdvisory
    risk_assessment: Dict[str, Any]
    key_drivers: List[str]
    model_version: str
    model_name: str
    timestamp: str

# --- SOIL ANALYSIS SCHEMAS ---
class SoilAnalysisRequest(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    soil_moisture: Optional[float] = 45.0
    soil_type: Optional[str] = "loam"
    organic_carbon: Optional[float] = 0.65
    electrical_conductivity: Optional[float] = 0.8

class SoilParameterStatus(BaseModel):
    value: float
    status: str  # 'Low', 'Optimal', 'High', 'Acidic', 'Neutral', 'Alkaline'
    benchmark: str
    recommendation: str

class SoilAnalysisResponse(BaseModel):
    overall_health_score: float
    health_grade: str  # 'Grade A - Excellent', 'Grade B - Good', 'Grade C - Needs Amendment'
    parameters: Dict[str, SoilParameterStatus]
    fertilizer_recommendations: List[str]
    amendment_guidance: List[str]

# --- WEATHER SCHEMAS ---
class WeatherForecastDay(BaseModel):
    date: str
    day_name: str
    temp_max: float
    temp_min: float
    precipitation_sum: float
    precipitation_probability: int
    wind_speed_max: float
    weather_condition: str

class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current: Dict[str, Any]
    forecast_7days: List[WeatherForecastDay]
    climate_risks: Dict[str, Any]
    agricultural_alerts: List[str]

# --- PEST DETECTION SCHEMAS ---
class PestDetectionResponse(BaseModel):
    scan_id: Optional[int] = None
    crop_name: str
    disease_name: str
    pathogen: str
    severity: str
    confidence: float
    symptoms: List[str]
    causes: List[str]
    preventive_measures: List[str]
    treatment_guidance: List[str]
    analyzed_features: Dict[str, float]
    scanned_at: str

# --- AI CHAT SCHEMAS ---
class ChatMessageRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    farm_context: Optional[Dict[str, Any]] = None

class ChatMessageResponse(BaseModel):
    reply: str
    suggested_questions: List[str]
    referenced_topics: List[str]
