"""
Prediction History and Report Generation API
AGRISENSE Platform
"""

import json
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_current_user_optional
from backend.app.database.connection import get_db
from backend.app.models.models import AuditLog, PredictionRecord, User
from backend.app.services.pdf_service import generate_prediction_pdf

router = APIRouter(prefix="/history", tags=["Prediction History"])

@router.get("")
def list_prediction_history(
    limit: int = 25,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Lists recent prediction history records."""
    query = db.query(PredictionRecord)
    if current_user and current_user.role != "admin":
        # Filter by current user or show recent public demo predictions if user has none
        user_records = query.filter(PredictionRecord.user_id == current_user.id).order_by(PredictionRecord.created_at.desc()).limit(limit).all()
        if user_records:
            records = user_records
        else:
            records = query.order_by(PredictionRecord.created_at.desc()).limit(limit).all()
    else:
        records = query.order_by(PredictionRecord.created_at.desc()).limit(limit).all()

    output = []
    for r in records:
        try:
            inputs = json.loads(r.input_parameters) if r.input_parameters else {}
            full_res = json.loads(r.full_results) if r.full_results else {}
        except Exception:
            inputs, full_res = {}, {}

        output.append({
            "id": r.id,
            "user_id": r.user_id,
            "farm_location": r.farm_location,
            "state": r.state,
            "district": r.district,
            "season": r.season,
            "soil_type": r.soil_type,
            "predicted_crop": r.predicted_crop,
            "display_name": r.display_name,
            "suitability_score": r.suitability_score,
            "model_confidence": r.model_confidence,
            "model_version": r.model_version,
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "inputs": inputs,
            "full_results": full_res
        })
    return output

@router.get("/{prediction_id}")
def get_prediction_detail(prediction_id: int, db: Session = Depends(get_db)) -> Any:
    """Retrieves full details of a specific prediction."""
    rec = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    try:
        inputs = json.loads(rec.input_parameters) if rec.input_parameters else {}
        full_res = json.loads(rec.full_results) if rec.full_results else {}
    except Exception:
        inputs, full_res = {}, {}

    return {
        "id": rec.id,
        "farm_location": rec.farm_location,
        "state": rec.state,
        "district": rec.district,
        "season": rec.season,
        "soil_type": rec.soil_type,
        "predicted_crop": rec.predicted_crop,
        "display_name": rec.display_name,
        "suitability_score": rec.suitability_score,
        "model_confidence": rec.model_confidence,
        "model_version": rec.model_version,
        "created_at": rec.created_at.isoformat() if rec.created_at else "",
        "inputs": inputs,
        "results": full_res
    }

@router.delete("/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Deletes a prediction record."""
    rec = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found.")

    if current_user and current_user.role != "admin" and rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied to delete this record.")

    db.delete(rec)
    db.commit()
    return {"message": "Prediction record successfully deleted.", "id": prediction_id}

@router.get("/{prediction_id}/pdf")
def download_prediction_pdf(prediction_id: int, db: Session = Depends(get_db)) -> Any:
    """Generates and downloads an agronomic dossier PDF report for the prediction."""
    rec = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    try:
        inputs = json.loads(rec.input_parameters) if rec.input_parameters else {}
        full_res = json.loads(rec.full_results) if rec.full_results else {}
    except Exception:
        inputs, full_res = {}, {}

    pdf_payload = {
        **full_res,
        "prediction_id": rec.id,
        "farm_location": rec.farm_location,
        "crop": rec.predicted_crop,
        "display_name": rec.display_name,
        "suitability_score": rec.suitability_score,
        "model_confidence": rec.model_confidence,
        "model_version": rec.model_version,
        "inputs": inputs
    }

    try:
        pdf_bytes = generate_prediction_pdf(pdf_payload)
        filename = f"AGRISENSE_Report_{rec.predicted_crop}_{rec.id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failure: {str(e)}")
