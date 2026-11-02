"""Discovery model — stores symbolic regression results"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from app.core.database import Base


class Discovery(Base):
    __tablename__ = "discoveries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, nullable=False, index=True)
    dataset_id = Column(String, nullable=False)
    owner_id = Column(String, nullable=False)
    name = Column(String, nullable=True)

    # Configuration
    target_variable = Column(String, nullable=False)
    input_variables = Column(JSON, default=list)
    operators = Column(JSON, default=list)
    config = Column(JSON, default=dict)   # PySR/algorithm config

    # Status
    status = Column(String, default="pending")  # pending, running, completed, failed
    progress = Column(Integer, default=0)       # 0-100
    error_message = Column(Text, nullable=True)

    # Results
    candidate_equations = Column(JSON, default=list)  # list of equation objects
    best_equation_idx = Column(Integer, nullable=True)
    runtime_seconds = Column(Float, nullable=True)
    algorithm = Column(String, default="pysr")

    # Reproducibility
    random_seed = Column(Integer, nullable=True)
    software_versions = Column(JSON, default=dict)
    dataset_hash = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    discovery_id = Column(String, nullable=False, index=True)
    project_id = Column(String, nullable=False)
    owner_id = Column(String, nullable=False)
    name = Column(String, nullable=True)
    experiment_type = Column(String, default="verification")  # verification, robustness, comparison

    # Inputs
    config = Column(JSON, default=dict)

    # Results
    status = Column(String, default="pending")
    results = Column(JSON, default=dict)
    report = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
