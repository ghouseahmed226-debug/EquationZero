"""Discovery routes — symbolic regression pipeline"""
import os
import sys
import threading
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.dataset import Dataset
from app.models.discovery import Discovery
from app.models.user import User
from app.schemas.discovery import DiscoveryCreate, DiscoveryResponse, VerificationRequest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "scientific"))

router = APIRouter()


def _run_discovery_job(discovery_id: str, db_factory):
    """Background discovery job."""
    from analysis.dataset_analyzer import load_dataset
    from discovery.engine import run_discovery

    db = db_factory()
    try:
        disc = db.query(Discovery).filter(Discovery.id == discovery_id).first()
        if not disc:
            return

        disc.status = "running"
        disc.progress = 5
        db.commit()

        # Load dataset
        ds = db.query(Dataset).filter(Dataset.id == disc.dataset_id).first()
        if not ds:
            disc.status = "failed"
            disc.error_message = "Dataset not found"
            db.commit()
            return

        df = load_dataset(ds.file_path, ds.file_format)

        def progress_cb(pct: int):
            disc.progress = pct
            db.commit()

        result = run_discovery(
            df=df,
            target=disc.target_variable,
            inputs=disc.input_variables,
            config=disc.config or {},
            progress_callback=progress_cb,
        )

        disc.candidate_equations = [c.to_dict() for c in result.candidates]
        disc.best_equation_idx = result.best_idx
        disc.algorithm = result.algorithm_used
        disc.runtime_seconds = result.runtime_seconds
        disc.random_seed = result.random_seed
        disc.software_versions = result.software_versions
        disc.dataset_hash = result.dataset_hash
        disc.status = "completed"
        disc.progress = 100
        disc.completed_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as exc:
        disc.status = "failed"
        disc.error_message = str(exc)
        disc.progress = 0
        db.commit()
    finally:
        db.close()


@router.post("", response_model=DiscoveryResponse, status_code=202)
def create_discovery(
    payload: DiscoveryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Validate dataset belongs to user
    ds = db.query(Dataset).filter(Dataset.id == payload.dataset_id, Dataset.owner_id == user.id).first()
    if not ds:
        raise HTTPException(404, "Dataset not found")

    cfg = payload.config.model_dump()
    disc = Discovery(
        project_id=payload.project_id,
        dataset_id=payload.dataset_id,
        owner_id=user.id,
        name=payload.name,
        target_variable=payload.config.target_variable,
        input_variables=payload.config.input_variables,
        operators=payload.config.operators,
        config=cfg,
        status="pending",
        algorithm=payload.config.algorithm,
        random_seed=payload.config.random_seed,
    )
    db.add(disc)
    db.commit()
    db.refresh(disc)

    # Run in background thread (no Redis needed for MVP)
    from app.core.database import SessionLocal

    def job():
        _run_discovery_job(disc.id, SessionLocal)

    t = threading.Thread(target=job, daemon=True)
    t.start()

    return disc


@router.get("/{discovery_id}", response_model=DiscoveryResponse)
def get_discovery(discovery_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    disc = db.query(Discovery).filter(Discovery.id == discovery_id, Discovery.owner_id == user.id).first()
    if not disc:
        raise HTTPException(404, "Discovery not found")
    return disc


@router.get("/project/{project_id}/list", response_model=List[DiscoveryResponse])
def list_discoveries(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Discovery).filter(
        Discovery.project_id == project_id,
        Discovery.owner_id == user.id,
    ).order_by(Discovery.created_at.desc()).all()


@router.post("/{discovery_id}/verify")
def verify_discovery(
    discovery_id: str,
    payload: VerificationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    disc = db.query(Discovery).filter(Discovery.id == discovery_id, Discovery.owner_id == user.id).first()
    if not disc:
        raise HTTPException(404, "Discovery not found")
    if disc.status != "completed":
        raise HTTPException(400, "Discovery not yet completed")

    equations = disc.candidate_equations or []
    if payload.equation_idx >= len(equations):
        raise HTTPException(400, "Invalid equation index")

    eq = equations[payload.equation_idx]
    expression = eq.get("expression", "")

    ds = db.query(Dataset).filter(Dataset.id == disc.dataset_id).first()
    if not ds:
        raise HTTPException(404, "Dataset not found")

    from analysis.dataset_analyzer import load_dataset
    from verification.verifier import verify_equation

    df = load_dataset(ds.file_path, ds.file_format)
    result = verify_equation(
        expression=expression,
        df=df,
        target=disc.target_variable,
        inputs=disc.input_variables,
        random_seed=disc.random_seed or 42,
        n_bootstrap=payload.n_bootstrap,
        noise_levels=payload.noise_levels,
    )
    return result


@router.get("/{discovery_id}/report")
def discovery_report(discovery_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    disc = db.query(Discovery).filter(Discovery.id == discovery_id, Discovery.owner_id == user.id).first()
    if not disc:
        raise HTTPException(404, "Discovery not found")
    if disc.status != "completed":
        raise HTTPException(400, "Discovery not yet completed")

    equations = disc.candidate_equations or []
    best = equations[disc.best_equation_idx] if equations and disc.best_equation_idx is not None else {}

    report = {
        "discovery_id": disc.id,
        "project_id": disc.project_id,
        "target": disc.target_variable,
        "inputs": disc.input_variables,
        "algorithm": disc.algorithm,
        "runtime_seconds": disc.runtime_seconds,
        "random_seed": disc.random_seed,
        "dataset_hash": disc.dataset_hash,
        "software_versions": disc.software_versions,
        "n_candidates": len(equations),
        "best_equation": best,
        "all_candidates": equations,
        "completed_at": disc.completed_at.isoformat() if disc.completed_at else None,
        "reproducibility": {
            "dataset_id": disc.dataset_id,
            "dataset_hash": disc.dataset_hash,
            "config": disc.config,
            "random_seed": disc.random_seed,
            "software_versions": disc.software_versions,
        },
        "disclaimer": (
            "These are candidate mathematical relationships discovered by automated symbolic regression. "
            "They represent curve fits, not confirmed scientific laws. "
            "Independent replication and domain expert review are required before drawing scientific conclusions."
        ),
    }
    return report
