"""Benchmarks routes — synthetic datasets with known equations"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "scientific"))

from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

BENCHMARK_DATASETS = [
    {"name": "linear", "description": "y = 3*x1 - 2*x2 + 1.5", "domain": "mathematics"},
    {"name": "quadratic", "description": "y = 2*x^2 - 3*x + 1", "domain": "mathematics"},
    {"name": "exponential", "description": "y = 2.5 * exp(0.8 * x)", "domain": "mathematics"},
    {"name": "oscillatory", "description": "y = 3*sin(t) + 1.5*cos(2*t)", "domain": "physics"},
    {"name": "nonlinear", "description": "y = sqrt(x1*x2) + log(x1)", "domain": "mathematics"},
    {"name": "pendulum", "description": "T = 2*pi*sqrt(L/9.81)", "domain": "physics"},
    {"name": "ideal_gas", "description": "P = nRT/V (ideal gas law)", "domain": "chemistry"},
    {"name": "kepler", "description": "T = a^(3/2) (Kepler's third law)", "domain": "physics"},
]


@router.get("")
def list_benchmarks():
    return {"benchmarks": BENCHMARK_DATASETS}


@router.get("/{name}/preview")
def preview_benchmark(name: str, n_samples: int = 50, seed: int = 42):
    from analysis.dataset_analyzer import generate_synthetic_dataset
    known = [b["name"] for b in BENCHMARK_DATASETS]
    if name not in known:
        raise HTTPException(400, f"Unknown benchmark: {name}. Available: {known}")
    df, ground_truth = generate_synthetic_dataset(name, n_samples, seed)
    return {
        "name": name,
        "ground_truth": ground_truth,
        "columns": list(df.columns),
        "rows": df.head(20).values.tolist(),
        "n_samples": len(df),
        "note": "SYNTHETIC DATA — not real scientific observations.",
    }
