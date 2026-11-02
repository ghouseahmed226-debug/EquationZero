"""Dataset model"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from app.core.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, nullable=False, index=True)
    owner_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)
    file_hash = Column(String, nullable=True)  # SHA-256
    file_size_bytes = Column(Integer, nullable=True)
    file_format = Column(String, nullable=True)  # csv, xlsx, json, parquet
    num_rows = Column(Integer, nullable=True)
    num_columns = Column(Integer, nullable=True)
    columns_info = Column(JSON, default=list)   # [{name, dtype, unit, missing_count, ...}]
    summary_stats = Column(JSON, default=dict)
    source = Column(String, nullable=True)   # "uploaded", "synthetic", "benchmark"
    license = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)
    preprocessing_steps = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
