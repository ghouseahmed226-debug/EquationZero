"""
EquationZero Scientific Discovery Engine
Core symbolic regression pipeline using scikit-learn based approaches
and pure-Python genetic programming as a PySR fallback.
When pysr is installed, it is used as the primary engine.
"""
from __future__ import annotations

import hashlib
import json
import time
import warnings
from dataclasses import dataclass, field, asdict
from typing import Any

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures
import sympy as sp

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class CandidateEquation:
    rank: int
    expression: str
    latex: str
    complexity: int
    loss: float
    r2_train: float
    r2_val: float
    r2_test: float
    mae: float
    rmse: float
    parameters: dict = field(default_factory=dict)
    residuals_summary: dict = field(default_factory=dict)
    score: float = 0.0

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class DiscoveryResult:
    candidates: list[CandidateEquation]
    best_idx: int
    runtime_seconds: float
    algorithm_used: str
    software_versions: dict
    dataset_hash: str
    random_seed: int
    config: dict
    warnings: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def _hash_array(arr: np.ndarray) -> str:
    return hashlib.sha256(arr.tobytes()).hexdigest()[:16]


def _safe_r2(y_true, y_pred) -> float:
    try:
        val = r2_score(y_true, y_pred)
        return float(np.clip(val, -10.0, 1.0))
    except Exception:
        return float("nan")


def _residuals_summary(y_true, y_pred) -> dict:
    resid = np.array(y_true) - np.array(y_pred)
    return {
        "mean": float(np.mean(resid)),
        "std": float(np.std(resid)),
        "min": float(np.min(resid)),
        "max": float(np.max(resid)),
        "skewness": float(stats.skew(resid)),
        "kurtosis": float(stats.kurtosis(resid)),
    }


def _expr_to_latex(expr_str: str) -> str:
    """Convert expression string to LaTeX using SymPy."""
    try:
        expr = sp.sympify(expr_str)
        return sp.latex(expr)
    except Exception:
        return expr_str


def _complexity(expr_str: str) -> int:
    """Rough measure: count tokens."""
    tokens = expr_str.replace("(", " ( ").replace(")", " ) ").split()
    return len(tokens)


# ---------------------------------------------------------------------------
# Polynomial baseline models
# ---------------------------------------------------------------------------

def _polynomial_candidates(
    X_train, y_train, X_val, y_val, X_test, y_test,
    var_names: list[str], max_degree: int = 4
) -> list[CandidateEquation]:
    """Fit polynomial regression for degrees 1..max_degree as baseline candidates."""
    candidates = []
    for degree in range(1, max_degree + 1):
        try:
            poly = PolynomialFeatures(degree=degree, include_bias=False)
            X_poly_train = poly.fit_transform(X_train)
            X_poly_val = poly.transform(X_val)
            X_poly_test = poly.transform(X_test)

            model = LinearRegression()
            model.fit(X_poly_train, y_train)

            y_pred_train = model.predict(X_poly_train)
            y_pred_val = model.predict(X_poly_val)
            y_pred_test = model.predict(X_poly_test)

            # Build expression string
            feature_names = poly.get_feature_names_out(var_names)
            coef = model.coef_
            intercept = model.intercept_
            terms = []
            for c, f in zip(coef, feature_names):
                if abs(c) > 1e-10:
                    f_clean = f.replace(" ", "*").replace("^", "**")
                    terms.append(f"{c:.4g}*{f_clean}")
            if abs(intercept) > 1e-10:
                terms.append(f"{intercept:.4g}")
            expr = " + ".join(terms) if terms else "0"

            r2_tr = _safe_r2(y_train, y_pred_train)
            r2_v = _safe_r2(y_val, y_pred_val)
            r2_te = _safe_r2(y_test, y_pred_test)
            mae = float(mean_absolute_error(y_test, y_pred_test))
            rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))
            loss = float(mean_squared_error(y_train, y_pred_train))
            cmplx = degree * len(var_names) + 2

            cand = CandidateEquation(
                rank=degree,
                expression=expr,
                latex=_expr_to_latex(expr),
                complexity=cmplx,
                loss=loss,
                r2_train=r2_tr,
                r2_val=r2_v,
                r2_test=r2_te,
                mae=mae,
                rmse=rmse,
                residuals_summary=_residuals_summary(y_test, y_pred_test),
                score=r2_te - 0.01 * cmplx,
            )
            candidates.append(cand)
        except Exception as exc:
            pass
    return candidates


# ---------------------------------------------------------------------------
# PySR wrapper
# ---------------------------------------------------------------------------

def _pysr_candidates(
    X_train, y_train, X_val, y_val, X_test, y_test,
    var_names: list[str],
    config: dict,
) -> tuple[list[CandidateEquation], str]:
    """Run PySR if available, return (candidates, algorithm_name)."""
    try:
        from pysr import PySRRegressor

        operators = config.get("operators", ["+", "-", "*", "/", "^"])
        unary_ops = [op for op in operators if op in ("sin", "cos", "exp", "log", "sqrt", "abs", "square", "cube")]
        binary_ops = [op for op in operators if op in ("+", "-", "*", "/", "^")]
        if not binary_ops:
            binary_ops = ["+", "-", "*", "/"]

        model = PySRRegressor(
            niterations=config.get("num_iterations", 40),
            populations=config.get("num_populations", 15),
            population_size=config.get("population_size", 33),
            maxsize=config.get("max_complexity", 20),
            maxdepth=config.get("max_depth", 10),
            binary_operators=binary_ops,
            unary_operators=unary_ops if unary_ops else None,
            parsimony=config.get("parsimony", 0.0032),
            random_state=config.get("random_seed", 42),
            verbosity=0,
            progress=False,
            temp_equation_file=True,
        )
        model.fit(X_train, y_train, variable_names=var_names)

        candidates = []
        equations_df = model.equations_
        for i, row in equations_df.iterrows():
            expr = str(row["sympy_format"])
            cmplx = int(row["complexity"])
            loss = float(row["loss"])

            try:
                y_pred_train = model.predict(X_train, index=i)
                y_pred_val = model.predict(X_val, index=i)
                y_pred_test = model.predict(X_test, index=i)
            except Exception:
                continue

            r2_tr = _safe_r2(y_train, y_pred_train)
            r2_v = _safe_r2(y_val, y_pred_val)
            r2_te = _safe_r2(y_test, y_pred_test)
            mae = float(mean_absolute_error(y_test, y_pred_test))
            rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))

            cand = CandidateEquation(
                rank=i,
                expression=expr,
                latex=_expr_to_latex(expr),
                complexity=cmplx,
                loss=loss,
                r2_train=r2_tr,
                r2_val=r2_v,
                r2_test=r2_te,
                mae=mae,
                rmse=rmse,
                residuals_summary=_residuals_summary(y_test, y_pred_test),
                score=r2_te - 0.005 * cmplx,
            )
            candidates.append(cand)

        return candidates, "pysr"
    except ImportError:
        return [], "unavailable"


# ---------------------------------------------------------------------------
# Genetic-programming fallback (pure Python)
# ---------------------------------------------------------------------------

import random
import operator as op_module
import math


SAFE_OPS = {
    "+": op_module.add,
    "-": op_module.sub,
    "*": op_module.mul,
}

def _safe_div(a, b):
    denom = np.where(np.abs(b) < 1e-10, 1e-10, b)
    return a / denom

def _safe_sqrt(a):
    return np.sqrt(np.abs(a))

def _safe_log(a):
    return np.log(np.abs(a) + 1e-10)

def _safe_exp(a):
    return np.exp(np.clip(a, -20, 20))

UNARY_FUNCS = {
    "sin": np.sin,
    "cos": np.cos,
    "exp": _safe_exp,
    "log": _safe_log,
    "sqrt": _safe_sqrt,
}

BINARY_FUNCS = {
    "+": op_module.add,
    "-": op_module.sub,
    "*": op_module.mul,
    "/": _safe_div,
}


class GPNode:
    """A node in a genetic programming expression tree."""
    def __init__(self, node_type, value, left=None, right=None):
        self.node_type = node_type  # 'var', 'const', 'binary', 'unary'
        self.value = value
        self.left = left
        self.right = right

    def evaluate(self, X: np.ndarray, var_names: list) -> np.ndarray:
        if self.node_type == "var":
            idx = var_names.index(self.value)
            return X[:, idx]
        elif self.node_type == "const":
            return np.full(len(X), self.value)
        elif self.node_type == "binary":
            l = self.left.evaluate(X, var_names)
            r = self.right.evaluate(X, var_names)
            return BINARY_FUNCS[self.value](l, r)
        elif self.node_type == "unary":
            child = self.left.evaluate(X, var_names)
            return UNARY_FUNCS[self.value](child)
        return np.zeros(len(X))

    def to_string(self, var_names: list) -> str:
        if self.node_type == "var":
            return self.value
        elif self.node_type == "const":
            return f"{self.value:.4g}"
        elif self.node_type == "binary":
            l = self.left.to_string(var_names)
            r = self.right.to_string(var_names)
            return f"({l} {self.value} {r})"
        elif self.node_type == "unary":
            child = self.left.to_string(var_names)
            return f"{self.value}({child})"
        return "0"

    def depth(self) -> int:
        if self.node_type in ("var", "const"):
            return 0
        if self.node_type == "unary":
            return 1 + self.left.depth()
        return 1 + max(self.left.depth(), self.right.depth())

    def size(self) -> int:
        if self.node_type in ("var", "const"):
            return 1
        if self.node_type == "unary":
            return 1 + self.left.size()
        return 1 + self.left.size() + self.right.size()


def _random_tree(var_names, allowed_ops, max_depth=4, current_depth=0) -> GPNode:
    binary_ops = [o for o in allowed_ops if o in BINARY_FUNCS]
    unary_ops = [o for o in allowed_ops if o in UNARY_FUNCS]
    if not binary_ops:
        binary_ops = ["+", "-", "*"]

    if current_depth >= max_depth or (current_depth > 0 and random.random() < 0.4):
        if random.random() < 0.7:
            return GPNode("var", random.choice(var_names))
        else:
            return GPNode("const", random.gauss(0, 1))

    choice = random.random()
    if choice < 0.6:
        op = random.choice(binary_ops)
        left = _random_tree(var_names, allowed_ops, max_depth, current_depth + 1)
        right = _random_tree(var_names, allowed_ops, max_depth, current_depth + 1)
        return GPNode("binary", op, left, right)
    elif choice < 0.8 and unary_ops:
        op = random.choice(unary_ops)
        child = _random_tree(var_names, allowed_ops, max_depth, current_depth + 1)
        return GPNode("unary", op, child)
    else:
        if random.random() < 0.7:
            return GPNode("var", random.choice(var_names))
        return GPNode("const", random.gauss(0, 1))


def _mutate(node: GPNode, var_names: list, allowed_ops: list, depth=0) -> GPNode:
    if random.random() < 0.1:
        return _random_tree(var_names, allowed_ops, max_depth=3)
    if node.node_type in ("var", "const"):
        if random.random() < 0.3:
            return GPNode("var", random.choice(var_names))
        return node
    new_node = GPNode(node.node_type, node.value)
    if node.left:
        new_node.left = _mutate(node.left, var_names, allowed_ops, depth + 1)
    if node.right:
        new_node.right = _mutate(node.right, var_names, allowed_ops, depth + 1)
    return new_node


def _fitness(node: GPNode, X: np.ndarray, y: np.ndarray, var_names: list, parsimony: float = 0.01) -> float:
    try:
        y_pred = node.evaluate(X, var_names)
        if not np.all(np.isfinite(y_pred)):
            return float("inf")
        mse = float(mean_squared_error(y, y_pred))
        penalty = parsimony * node.size()
        return mse + penalty
    except Exception:
        return float("inf")


def _gp_candidates(
    X_train, y_train, X_val, y_val, X_test, y_test,
    var_names: list, config: dict
) -> list[CandidateEquation]:
    """Simple genetic programming fallback."""
    rng_seed = config.get("random_seed", 42)
    random.seed(rng_seed)
    np.random.seed(rng_seed)

    operators = config.get("operators", ["+", "-", "*", "/", "sin", "cos", "exp", "log"])
    pop_size = min(config.get("population_size", 33), 50)
    n_iters = min(config.get("num_iterations", 40), 60)
    parsimony = config.get("parsimony", 0.01)

    # Initialize population
    population = [_random_tree(var_names, operators, max_depth=4) for _ in range(pop_size)]
    fitnesses = [_fitness(ind, X_train, y_train, var_names, parsimony) for ind in population]

    best_seen: dict[str, tuple[GPNode, float]] = {}  # expr -> (node, fitness)

    for generation in range(n_iters):
        # Tournament selection + mutation
        new_pop = []
        for _ in range(pop_size):
            # Tournament of size 3
            contestants = random.sample(range(pop_size), min(3, pop_size))
            winner = min(contestants, key=lambda i: fitnesses[i])
            child = _mutate(population[winner], var_names, operators)
            new_pop.append(child)

        new_fits = [_fitness(ind, X_train, y_train, var_names, parsimony) for ind in new_pop]

        # Elitism: keep best from old + new
        combined = list(zip(population + new_pop, fitnesses + new_fits))
        combined.sort(key=lambda x: x[1])
        population = [c[0] for c in combined[:pop_size]]
        fitnesses = [c[1] for c in combined[:pop_size]]

        # Record unique best expressions
        for node, fit in zip(population[:5], fitnesses[:5]):
            expr = node.to_string(var_names)
            if expr not in best_seen:
                best_seen[expr] = (node, fit)

    # Build candidates from top unique expressions
    sorted_exprs = sorted(best_seen.items(), key=lambda x: x[1][1])
    candidates = []
    for rank, (expr, (node, fit)) in enumerate(sorted_exprs[:10]):
        try:
            y_pred_train = node.evaluate(X_train, var_names)
            y_pred_val = node.evaluate(X_val, var_names)
            y_pred_test = node.evaluate(X_test, var_names)

            if not (np.all(np.isfinite(y_pred_train)) and
                    np.all(np.isfinite(y_pred_test))):
                continue

            r2_tr = _safe_r2(y_train, y_pred_train)
            r2_v = _safe_r2(y_val, y_pred_val)
            r2_te = _safe_r2(y_test, y_pred_test)
            mae = float(mean_absolute_error(y_test, y_pred_test))
            rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))
            cmplx = node.size()

            cand = CandidateEquation(
                rank=rank,
                expression=expr,
                latex=_expr_to_latex(expr),
                complexity=cmplx,
                loss=float(fit),
                r2_train=r2_tr,
                r2_val=r2_v,
                r2_test=r2_te,
                mae=mae,
                rmse=rmse,
                residuals_summary=_residuals_summary(y_test, y_pred_test),
                score=r2_te - 0.01 * cmplx,
            )
            candidates.append(cand)
        except Exception:
            continue

    return candidates


# ---------------------------------------------------------------------------
# Main discovery pipeline
# ---------------------------------------------------------------------------

def run_discovery(
    df: pd.DataFrame,
    target: str,
    inputs: list[str],
    config: dict,
    progress_callback=None,
) -> DiscoveryResult:
    """
    Run the full symbolic regression discovery pipeline.
    Returns a DiscoveryResult with ranked candidate equations.
    """
    start_time = time.time()
    warns = []

    # Validate columns
    missing_cols = [c for c in [target] + inputs if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Columns not found in dataset: {missing_cols}")

    # Drop rows with NaN in relevant columns
    working_df = df[[target] + inputs].dropna()
    if len(working_df) < 10:
        raise ValueError(f"Insufficient data: only {len(working_df)} complete rows")

    if len(working_df) < len(df):
        warns.append(f"Dropped {len(df) - len(working_df)} rows with missing values.")

    X = working_df[inputs].values.astype(float)
    y = working_df[target].values.astype(float)

    if not np.all(np.isfinite(X)) or not np.all(np.isfinite(y)):
        X = np.nan_to_num(X, nan=0.0, posinf=1e10, neginf=-1e10)
        y = np.nan_to_num(y, nan=0.0, posinf=1e10, neginf=-1e10)
        warns.append("Non-finite values replaced with safe approximations.")

    dataset_hash = _hash_array(np.concatenate([X.flatten(), y]))

    # Split: 70% train, 15% val, 15% test
    seed = config.get("random_seed", 42)
    X_tv, X_test, y_tv, y_test = train_test_split(X, y, test_size=0.15, random_state=seed)
    X_train, X_val, y_train, y_val = train_test_split(X_tv, y_tv, test_size=0.176, random_state=seed)

    if progress_callback:
        progress_callback(10)

    all_candidates: list[CandidateEquation] = []
    algorithm_used = "gp+polynomial"

    # 1. Try PySR
    if config.get("algorithm", "pysr") == "pysr":
        pysr_cands, alg = _pysr_candidates(X_train, y_train, X_val, y_val, X_test, y_test, inputs, config)
        if pysr_cands:
            all_candidates.extend(pysr_cands)
            algorithm_used = "pysr"
        else:
            warns.append("PySR not available. Using genetic programming fallback.")

    if progress_callback:
        progress_callback(40)

    # 2. Always add polynomial baselines
    poly_cands = _polynomial_candidates(X_train, y_train, X_val, y_val, X_test, y_test, inputs)
    all_candidates.extend(poly_cands)

    if progress_callback:
        progress_callback(65)

    # 3. GP fallback if PySR gave nothing
    if not any(c for c in all_candidates if "pysr" in algorithm_used or algorithm_used == "gp+polynomial"):
        if algorithm_used != "pysr":
            gp_cands = _gp_candidates(X_train, y_train, X_val, y_val, X_test, y_test, inputs, config)
            all_candidates.extend(gp_cands)

    if algorithm_used != "pysr":
        # Always run GP for non-pysr path
        gp_cands = _gp_candidates(X_train, y_train, X_val, y_val, X_test, y_test, inputs, config)
        all_candidates.extend(gp_cands)

    if progress_callback:
        progress_callback(85)

    # Deduplicate by expression
    seen_exprs = set()
    unique_candidates = []
    for c in all_candidates:
        if c.expression not in seen_exprs:
            seen_exprs.add(c.expression)
            unique_candidates.append(c)

    # Sort by composite score (descending)
    unique_candidates.sort(key=lambda c: c.score, reverse=True)

    # Re-rank
    for i, c in enumerate(unique_candidates):
        c.rank = i

    if not unique_candidates:
        raise RuntimeError("No candidate equations were discovered.")

    # Best is highest score
    best_idx = 0

    runtime = time.time() - start_time

    import sys
    sw_versions = {
        "python": sys.version.split()[0],
        "numpy": np.__version__,
        "sympy": sp.__version__,
        "scipy": "installed",
    }
    try:
        import sklearn
        sw_versions["scikit-learn"] = sklearn.__version__
    except Exception:
        pass

    if progress_callback:
        progress_callback(100)

    return DiscoveryResult(
        candidates=unique_candidates[:20],  # top 20
        best_idx=best_idx,
        runtime_seconds=runtime,
        algorithm_used=algorithm_used,
        software_versions=sw_versions,
        dataset_hash=dataset_hash,
        random_seed=seed,
        config=config,
        warnings=warns,
    )
