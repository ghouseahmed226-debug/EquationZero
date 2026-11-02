"""Dataset schemas"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    unit: Optional[str] = None
    missing_count: int = 0
    missing_pct: float = 0.0
    unique_count: Optional[int] = None
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    mean_val: Optional[float] = None
    std_val: Optional[float] = None


class DatasetResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str]
    file_format: Optional[str]
    file_size_bytes: Optional[int]
    file_hash: Optional[str]
    num_rows: Optional[int]
    num_columns: Optional[int]
    columns_info: List[Dict[str, Any]]
    summary_stats: Dict[str, Any]
    source: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DatasetPreview(BaseModel):
    columns: List[str]
    rows: List[List[Any]]
    total_rows: int
    dtypes: Dict[str, str]


class PreprocessingStep(BaseModel):
    operation: str  # drop_missing, fill_mean, normalize, etc.
    columns: Optional[List[str]] = None
    params: Dict[str, Any] = {}
