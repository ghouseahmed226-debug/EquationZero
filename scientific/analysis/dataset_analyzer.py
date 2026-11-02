"""
Dataset analysis: statistics, correlations, outlier detection, distributions.
"""
from __future__ import annotations

import hashlib
from typing import Any

import numpy as np
import pandas as pd
from scipy import stats


def compute_dataset_hash(df: pd.DataFrame) -> str:
    """Compute a reproducible hash of the dataset."""
    return hashlib.sha256(
        pd.util.hash_pandas_object(df, index=True).values.tobytes()
    ).hexdigest()


def analyze_dataset(df: pd.DataFrame) -> dict[str, Any]:
    """
    Full dataset analysis:
    - Column info (dtype, missing, stats)
    - Correlations
    - Outlier flags
    - Distribution summary
    """
    result: dict[str, Any] = {}

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    # Column info
    columns_info = []
    for col in df.columns:
        info: dict[str, Any] = {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing_count": int(df[col].isna().sum()),
            "missing_pct": float(df[col].isna().mean() * 100),
        }
        if col in numeric_cols:
            series = df[col].dropna()
            info.update({
                "unique_count": int(series.nunique()),
                "min_val": float(series.min()),
                "max_val": float(series.max()),
                "mean_val": float(series.mean()),
                "std_val": float(series.std()),
                "median_val": float(series.median()),
                "q25": float(series.quantile(0.25)),
                "q75": float(series.quantile(0.75)),
                "skewness": float(stats.skew(series)),
                "kurtosis": float(stats.kurtosis(series)),
            })
            # Outlier detection using IQR
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            n_outliers = int(((series < Q1 - 1.5 * IQR) | (series > Q3 + 1.5 * IQR)).sum())
            info["n_outliers_iqr"] = n_outliers
            info["outlier_pct"] = float(n_outliers / len(series) * 100) if len(series) > 0 else 0.0

            # Normality test
            if len(series) >= 8:
                try:
                    _, p_normal = stats.normaltest(series)
                    info["normality_p"] = float(p_normal)
                    info["appears_normal"] = bool(p_normal > 0.05)
                except Exception:
                    info["normality_p"] = None
        else:
            info["unique_count"] = int(df[col].nunique())
            info["top_values"] = df[col].value_counts().head(5).to_dict()

        columns_info.append(info)

    result["columns_info"] = columns_info

    # Correlations (numeric only)
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr().round(4)
        result["correlation_matrix"] = {
            "columns": numeric_cols,
            "values": corr_matrix.values.tolist(),
        }

        # High correlations
        high_corr = []
        for i, c1 in enumerate(numeric_cols):
            for j, c2 in enumerate(numeric_cols):
                if i < j:
                    val = corr_matrix.iloc[i, j]
                    if abs(val) > 0.8:
                        high_corr.append({"col1": c1, "col2": c2, "correlation": float(val)})
        result["high_correlations"] = high_corr
    else:
        result["correlation_matrix"] = {}
        result["high_correlations"] = []

    # Summary
    result["summary"] = {
        "n_rows": len(df),
        "n_columns": len(df.columns),
        "n_numeric": len(numeric_cols),
        "n_categorical": len(categorical_cols),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "total_missing": int(df.isna().sum().sum()),
        "complete_rows": int(df.dropna().shape[0]),
        "dataset_hash": compute_dataset_hash(df),
    }

    return result


def load_dataset(file_path: str, file_format: str | None = None) -> pd.DataFrame:
    """Load a dataset from file."""
    if file_format is None:
        file_format = file_path.rsplit(".", 1)[-1].lower()

    loaders = {
        "csv": lambda p: pd.read_csv(p),
        "xlsx": lambda p: pd.read_excel(p),
        "json": lambda p: pd.read_json(p),
        "parquet": lambda p: pd.read_parquet(p),
    }

    loader = loaders.get(file_format)
    if loader is None:
        raise ValueError(f"Unsupported format: {file_format}")

    return loader(file_path)


def generate_synthetic_dataset(name: str, n_samples: int = 200, seed: int = 42) -> tuple[pd.DataFrame, str]:
    """
    Generate a synthetic dataset with known ground-truth equation.
    Returns (dataframe, ground_truth_equation).
    """
    rng = np.random.default_rng(seed)

    datasets = {
        "linear": _synthetic_linear,
        "quadratic": _synthetic_quadratic,
        "exponential": _synthetic_exponential,
        "oscillatory": _synthetic_oscillatory,
        "nonlinear": _synthetic_nonlinear,
        "pendulum": _synthetic_pendulum,
        "ideal_gas": _synthetic_ideal_gas,
        "kepler": _synthetic_kepler,
    }

    generator = datasets.get(name, _synthetic_linear)
    return generator(n_samples, rng)


def _synthetic_linear(n, rng):
    x1 = rng.uniform(0, 10, n)
    x2 = rng.uniform(-5, 5, n)
    noise = rng.normal(0, 0.5, n)
    y = 3.0 * x1 - 2.0 * x2 + 1.5 + noise
    df = pd.DataFrame({"x1": x1, "x2": x2, "y": y})
    return df, "y = 3*x1 - 2*x2 + 1.5"


def _synthetic_quadratic(n, rng):
    x = rng.uniform(-5, 5, n)
    noise = rng.normal(0, 1, n)
    y = 2.0 * x**2 - 3.0 * x + 1.0 + noise
    df = pd.DataFrame({"x": x, "y": y})
    return df, "y = 2*x^2 - 3*x + 1"


def _synthetic_exponential(n, rng):
    x = rng.uniform(0, 3, n)
    noise = rng.normal(0, 0.1, n)
    y = 2.5 * np.exp(0.8 * x) + noise
    df = pd.DataFrame({"x": x, "y": y})
    return df, "y = 2.5 * exp(0.8 * x)"


def _synthetic_oscillatory(n, rng):
    t = rng.uniform(0, 4 * np.pi, n)
    noise = rng.normal(0, 0.1, n)
    y = 3.0 * np.sin(t) + 1.5 * np.cos(2 * t) + noise
    df = pd.DataFrame({"t": t, "y": y})
    return df, "y = 3*sin(t) + 1.5*cos(2*t)"


def _synthetic_nonlinear(n, rng):
    x1 = rng.uniform(0.1, 5, n)
    x2 = rng.uniform(0.1, 5, n)
    noise = rng.normal(0, 0.05, n)
    y = np.sqrt(x1 * x2) + np.log(x1) + noise
    df = pd.DataFrame({"x1": x1, "x2": x2, "y": y})
    return df, "y = sqrt(x1*x2) + log(x1)"


def _synthetic_pendulum(n, rng):
    # Pendulum period: T = 2*pi*sqrt(L/g)
    L = rng.uniform(0.1, 5, n)  # length in meters
    g = 9.81
    noise = rng.normal(0, 0.02, n)
    T = 2 * np.pi * np.sqrt(L / g) + noise
    df = pd.DataFrame({"L": L, "T": T})
    return df, "T = 2*pi*sqrt(L/9.81)"


def _synthetic_ideal_gas(n, rng):
    # PV = nRT  →  P = nRT/V
    V = rng.uniform(1, 10, n)
    T_temp = rng.uniform(200, 400, n)
    R = 8.314
    n_mol = 1.0
    noise = rng.normal(0, 100, n)
    P = n_mol * R * T_temp / V + noise
    df = pd.DataFrame({"V": V, "T": T_temp, "P": P})
    return df, "P = n*R*T/V  (ideal gas law)"


def _synthetic_kepler(n, rng):
    # Kepler's third law: T^2 = a^3 (in AU and years)
    a = rng.uniform(0.3, 30, n)
    noise = rng.normal(0, 0.1, n)
    T = a**1.5 + noise
    df = pd.DataFrame({"a": a, "T": T})
    return df, "T = a^(3/2)  (Kepler's third law)"
