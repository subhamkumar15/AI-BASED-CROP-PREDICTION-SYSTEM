"""
SQLAlchemy Database Models
AGRISENSE Agriculture Intelligence Platform
"""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="farmer")  # 'farmer', 'researcher', 'admin'
    subscription = Column(String(50), default="free")  # 'free', 'pro', 'enterprise'
    phone = Column(String(50), nullable=True)
    region = Column(String(100), default="North India")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    predictions = relationship("PredictionRecord", back_populates="user", cascade="all, delete-orphan")
    pest_scans = relationship("PestScanRecord", back_populates="user", cascade="all, delete-orphan")
    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String(255), nullable=False)
    state = Column(String(100), default="Punjab")
    district = Column(String(100), default="Ludhiana")
    latitude = Column(Float, default=30.9010)
    longitude = Column(Float, default=75.8573)
    acreage = Column(Float, default=5.0)
    primary_soil_type = Column(String(100), default="Alluvial Loam")
    irrigation_type = Column(String(100), default="Canal / Tube Well")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="farms")

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    farm_location = Column(String(255), default="Field Block A")
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    season = Column(String(50), default="Kharif")
    soil_type = Column(String(50), default="loam")
    input_parameters = Column(Text, nullable=False)  # JSON
    predicted_crop = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=False)
    suitability_score = Column(Float, nullable=False)
    model_confidence = Column(Float, nullable=False)
    model_version = Column(String(50), default="v2.4.0")
    full_results = Column(Text, nullable=False)  # JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="predictions")

class PestScanRecord(Base):
    __tablename__ = "pest_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    crop_name = Column(String(100), nullable=False)
    disease_name = Column(String(150), nullable=False)
    pathogen = Column(String(150), nullable=False)
    severity = Column(String(50), default="Moderate")
    confidence = Column(Float, nullable=False)
    symptoms = Column(Text, nullable=False)  # JSON array
    treatment_guidance = Column(Text, nullable=False)  # JSON array
    image_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="pest_scans")

class ModelTrainingRecord(Base):
    __tablename__ = "model_trainings"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    cv_accuracy = Column(Float, nullable=False)
    test_accuracy = Column(Float, nullable=False)
    test_f1 = Column(Float, nullable=False)
    dataset_size = Column(Integer, nullable=False)
    is_deployed = Column(Boolean, default=False)
    training_duration_sec = Column(Float, default=0.0)
    metrics_json = Column(Text, nullable=False)  # JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
