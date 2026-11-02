"""Dataset routes — upload, inspect, preview, preprocess"""
import os
import hashlib
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.dataset import Dataset
from app.models.user import User
from app.schemas.dataset import DatasetResponse, DatasetPreview

import sys, os as _os
sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), "..", "..", "..", "..", "scientific"))

router = APIRouter()


def _allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in settings.ALLOWED_EXTENSIONS


def _hash_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


@router.post("/{project_id}/upload", response_model=DatasetResponse, status_code=201)
async def upload_dataset(
    project_id: str,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not _allowed_file(file.filename):
        raise HTTPException(400, f"File type not allowed. Supported: {settings.ALLOWED_EXTENSIONS}")

    # Size check (basic)
    contents = await file.read()
    size_mb = len(contents) / 1024 / 1024
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(413, f"File too large: {size_mb:.1f}MB > {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    # Save file
    upload_path = os.path.join(settings.UPLOAD_DIR, project_id)
    os.makedirs(upload_path, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1].lower()

    import uuid
    saved_name = f"{uuid.uuid4()}{file_ext}"
    saved_path = os.path.join(upload_path, saved_name)
    with open(saved_path, "wb") as f_out:
        f_out.write(contents)

    file_hash = hashlib.sha256(contents).hexdigest()
    file_format = file_ext.lstrip(".")

    # Analyze
    from analysis.dataset_analyzer import analyze_dataset, load_dataset
    try:
        df = load_dataset(saved_path, file_format)
        analysis = analyze_dataset(df)
        num_rows = len(df)
        num_cols = len(df.columns)
        cols_info = analysis.get("columns_info", [])
        summary = analysis.get("summary", {})
    except Exception as e:
        raise HTTPException(422, f"Could not parse dataset: {e}")

    dataset = Dataset(
        project_id=project_id,
        owner_id=user.id,
        name=file.filename,
        description=description,
        file_path=saved_path,
        file_hash=file_hash,
        file_size_bytes=len(contents),
        file_format=file_format,
        num_rows=num_rows,
        num_columns=num_cols,
        columns_info=cols_info,
        summary_stats=summary,
        source="uploaded",
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.owner_id == user.id).first()
    if not ds:
        raise HTTPException(404, "Dataset not found")
    return ds


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
def preview_dataset(
    dataset_id: str,
    n_rows: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.owner_id == user.id).first()
    if not ds:
        raise HTTPException(404, "Dataset not found")

    from analysis.dataset_analyzer import load_dataset
    df = load_dataset(ds.file_path, ds.file_format)
    preview_df = df.head(n_rows)

    return DatasetPreview(
        columns=list(df.columns),
        rows=preview_df.fillna("").values.tolist(),
        total_rows=len(df),
        dtypes={col: str(df[col].dtype) for col in df.columns},
    )


@router.get("/{dataset_id}/analysis")
def dataset_analysis(dataset_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.owner_id == user.id).first()
    if not ds:
        raise HTTPException(404, "Dataset not found")

    from analysis.dataset_analyzer import analyze_dataset, load_dataset
    df = load_dataset(ds.file_path, ds.file_format)
    return analyze_dataset(df)


@router.get("/project/{project_id}/list", response_model=List[DatasetResponse])
def list_datasets(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Dataset).filter(
        Dataset.project_id == project_id,
        Dataset.owner_id == user.id,
    ).all()


@router.post("/synthetic/{name}")
def create_synthetic_dataset(
    name: str,
    project_id: str,
    n_samples: int = 200,
    seed: int = 42,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate and store a synthetic dataset with known ground truth."""
    from analysis.dataset_analyzer import generate_synthetic_dataset

    valid_names = ["linear", "quadratic", "exponential", "oscillatory", "nonlinear", "pendulum", "ideal_gas", "kepler"]
    if name not in valid_names:
        raise HTTPException(400, f"Unknown synthetic dataset. Choose from: {valid_names}")

    df, ground_truth = generate_synthetic_dataset(name, n_samples, seed)

    # Save to disk
    upload_path = os.path.join(settings.UPLOAD_DIR, project_id)
    os.makedirs(upload_path, exist_ok=True)
    import uuid
    saved_name = f"synthetic_{name}_{uuid.uuid4()}.csv"
    saved_path = os.path.join(upload_path, saved_name)
    df.to_csv(saved_path, index=False)

    csv_bytes = df.to_csv(index=False).encode()
    file_hash = hashlib.sha256(csv_bytes).hexdigest()

    from analysis.dataset_analyzer import analyze_dataset
    analysis = analyze_dataset(df)

    dataset = Dataset(
        project_id=project_id,
        owner_id=user.id,
        name=f"Synthetic: {name}",
        description=f"[SYNTHETIC] Ground truth: {ground_truth}",
        file_path=saved_path,
        file_hash=file_hash,
        file_size_bytes=len(csv_bytes),
        file_format="csv",
        num_rows=len(df),
        num_columns=len(df.columns),
        columns_info=analysis.get("columns_info", []),
        summary_stats=analysis.get("summary", {}),
        source="synthetic",
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return {
        "dataset": DatasetResponse.model_validate(dataset),
        "ground_truth": ground_truth,
        "note": "This is SYNTHETIC data with known ground-truth equation. Not a real scientific discovery.",
    }
