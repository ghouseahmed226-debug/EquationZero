"""Discovery schemas"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DiscoveryConfig(BaseModel):
    target_variable: str
    input_variables: List[str]
    operators: List[str] = ["+", "-", "*", "/", "^", "sin", "cos", "exp", "log", "sqrt"]
    max_complexity: int = 20
    num_populations: int = 15
    num_iterations: int = 40
    random_seed: int = 42
    population_size: int = 33
    max_depth: int = 10
    parsimony: float = 0.0032
    algorithm: str = "pysr"  # pysr, polynomial, multi


class CandidateEquation(BaseModel):
    rank: int
    expression: str
    latex: str
    complexity: int
    loss: float
    r2_train: float
    r2_val: Optional[float] = None
    r2_test: Optional[float] = None
    mae: float
    rmse: float
    parameters: Dict[str, float] = {}
    residuals_summary: Dict[str, float] = {}
    score: float  # composite score


class DiscoveryCreate(BaseModel):
    project_id: str
    dataset_id: str
    name: Optional[str] = None
    config: DiscoveryConfig


class DiscoveryResponse(BaseModel):
    id: str
    project_id: str
    dataset_id: str
    name: Optional[str]
    target_variable: str
    input_variables: List[str]
    status: str
    progress: int
    candidate_equations: List[Dict[str, Any]]
    best_equation_idx: Optional[int]
    algorithm: str
    random_seed: Optional[int]
    runtime_seconds: Optional[float]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class VerificationRequest(BaseModel):
    equation_idx: int
    test_fraction: float = 0.2
    n_bootstrap: int = 100
    noise_levels: List[float] = [0.01, 0.05, 0.10]


class VerificationResult(BaseModel):
    equation_idx: int
    expression: str
    # Numerical
    r2_test: float
    mae_test: float
    rmse_test: float
    # Bootstrap
    r2_bootstrap_mean: float
    r2_bootstrap_std: float
    r2_ci_lower: float
    r2_ci_upper: float
    # Robustness
    noise_sensitivity: Dict[str, float]
    # Mathematical
    singularities: List[str]
    domain_issues: List[str]
    simplified: str
    # Dimensional
    dimensional_consistent: Optional[bool]
    # Summary
    verdict: str
    limitations: List[str]
