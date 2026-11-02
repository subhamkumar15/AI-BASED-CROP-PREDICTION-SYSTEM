"""
Pest and Foliar Disease Diagnostics API
AGRISENSE Platform
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from backend.app.api.deps import get_current_user_optional
from backend.app.database.connection import get_db
from backend.app.models.models import AuditLog, PestScanRecord, User
from backend.app.schemas.schemas import PestDetectionResponse
from backend.app.services.pest_service import pest_service
from ml.training.train_pest_model import DISEASE_PROFILES

router = APIRouter(prefix="/pest", tags=["Pest & Disease Intelligence"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

@router.post("/detect", response_model=PestDetectionResponse)
async def detect_pest_disease(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Analyzes an uploaded crop leaf photograph using computer vision feature extraction and classification."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file.content_type}'. Please upload JPEG, PNG, or WebP images."
        )

    try:
        contents = await file.read()
        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image file exceeds 15 MB limit.")

        diagnosis = pest_service.diagnose_image(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Computer vision analysis error: {str(e)}")

    scan_id = None
    try:
        user_id = current_user.id if current_user else None
        record = PestScanRecord(
            user_id=user_id,
            crop_name=diagnosis["crop_name"],
            disease_name=diagnosis["disease_name"],
            pathogen=diagnosis["pathogen"],
            severity=diagnosis["severity"],
            confidence=diagnosis["confidence"],
            symptoms=json.dumps(diagnosis["symptoms"]),
            treatment_guidance=json.dumps(diagnosis["treatment_guidance"]),
            image_filename=file.filename
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        scan_id = record.id

        if user_id:
            audit = AuditLog(
                user_id=user_id,
                action="PEST_SCANNED",
                details=f"Scanned {diagnosis['crop_name']}: {diagnosis['disease_name']} ({diagnosis['confidence']}%)"
            )
            db.add(audit)
            db.commit()
    except Exception as db_err:
        print(f"[pest] DB error: {db_err}")

    return {
        "scan_id": scan_id,
        "crop_name": diagnosis["crop_name"],
        "disease_name": diagnosis["disease_name"],
        "pathogen": diagnosis["pathogen"],
        "severity": diagnosis["severity"],
        "confidence": diagnosis["confidence"],
        "symptoms": diagnosis["symptoms"],
        "causes": diagnosis["causes"],
        "preventive_measures": diagnosis["preventive_measures"],
        "treatment_guidance": diagnosis["treatment_guidance"],
        "analyzed_features": diagnosis["analyzed_features"],
        "scanned_at": datetime.now().isoformat()
    }

@router.get("/diseases")
def list_known_diseases() -> List[Dict[str, Any]]:
    """Returns database of recognizable foliar pathogens and botanical guides."""
    catalog = []
    for code, info in DISEASE_PROFILES.items():
        catalog.append({
            "code": code,
            "crop": info["crop"],
            "disease_name": info["disease_name"],
            "pathogen": info["pathogen"],
            "severity": info["severity"],
            "symptoms_count": len(info["symptoms"]),
            "treatment_options_count": len(info["treatment_guidance"])
        })
    return catalog
