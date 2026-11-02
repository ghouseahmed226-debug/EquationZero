"""Experiments routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.discovery import Experiment
from app.schemas.discovery import VerificationRequest

router = APIRouter()


@router.get("/{experiment_id}")
def get_experiment(experiment_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id, Experiment.owner_id == user.id).first()
    if not exp:
        raise HTTPException(404, "Experiment not found")
    return {
        "id": exp.id,
        "discovery_id": exp.discovery_id,
        "name": exp.name,
        "experiment_type": exp.experiment_type,
        "status": exp.status,
        "results": exp.results,
        "created_at": exp.created_at.isoformat(),
    }
