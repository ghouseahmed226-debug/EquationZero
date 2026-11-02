"""Mathematical and statistical verification of discovered equations."""
from __future__ import annotations

import warnings
from typing import Any

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
import sympy as sp

warnings.filterwarnings("ignore")


def _safe_r2(y_true, y_pred) -> float:
    try:
        return float(np.clip(r2_score(y_true, y_pred), -10.0, 1.0))
    except Exception:
        return float("nan")


def verify_equation(
    expression: str,
    df: pd.DataFrame,
    target: str,
    inputs: list[str],
    random_seed: int = 42,
    n_bootstrap: int = 200,
    noise_levels: list[float] | None = None,
) -> dict[str, Any]:
    """
    Full mathematical, numerical, and statistical verification of a candidate equation.
    Returns structured verification results.
    """
    if noise_levels is None:
        noise_levels = [0.01, 0.05, 0.10]

    results: dict[str, Any] = {
        "expression": expression,
        "verified": False,
        "errors": [],
        "warnings": [],
    }

    # -----------------------------------------------------------------------
    # 1. Parse expression symbolically
    # -----------------------------------------------------------------------
    try:
        syms = {name: sp.Symbol(name) for name in inputs}
        sym_expr = sp.sympify(expression, locals=syms)
        simplified = str(sp.simplify(sym_expr))
        results["simplified"] = simplified
        results["latex"] = sp.latex(sym_expr)
    except Exception as e:
        results["errors"].append(f"Expression parsing failed: {e}")
        results["simplified"] = expression
        results["latex"] = expression

    # -----------------------------------------------------------------------
    # 2. Domain and singularity analysis
    # -----------------------------------------------------------------------
    singularities = []
    domain_issues = []
    try:
        for name, sym in syms.items():
            # Check for division singularities
            denom_expr = sp.denom(sym_expr)
            if denom_expr != 1:
                singular_pts = sp.solve(denom_expr, sym)
                if singular_pts:
                    singularities.append(f"{name} = {singular_pts} (division by zero)")

            # Check for log/sqrt domain issues
            expr_str = str(sym_expr)
            if "log" in expr_str or "sqrt" in expr_str:
                domain_issues.append(f"log/sqrt requires {name} > 0 in some regions")
    except Exception as e:
        results["warnings"].append(f"Singularity analysis incomplete: {e}")

    results["singularities"] = singularities
    results["domain_issues"] = domain_issues

    # -----------------------------------------------------------------------
    # 3. Numerical evaluation
    # -----------------------------------------------------------------------
    working_df = df[[target] + inputs].dropna()
    if len(working_df) < 10:
        results["errors"].append("Insufficient data for verification.")
        return results

    X = working_df[inputs].values.astype(float)
    y = working_df[target].values.astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_seed)

    # Evaluate equation on test set
    def evaluate_expression(X_arr: np.ndarray) -> np.ndarray:
        """Evaluate the symbolic expression numerically."""
        try:
            local_vars = {name: X_arr[:, i] for i, name in enumerate(inputs)}
            # Use sympy lambdify
            f = sp.lambdify(list(syms.values()), sym_expr, modules=["numpy"])
            result = f(*[local_vars[n] for n in inputs])
            if np.isscalar(result):
                result = np.full(len(X_arr), result)
            return np.asarray(result, dtype=float)
        except Exception as e:
            results["warnings"].append(f"lambdify failed ({e}), using eval fallback")
            return np.full(len(X_arr), float("nan"))

    y_pred_test = evaluate_expression(X_test)
    y_pred_train = evaluate_expression(X_train)

    # Filter non-finite
    finite_mask = np.isfinite(y_pred_test)
    if finite_mask.sum() == 0:
        results["errors"].append("Equation produces no finite values on test set.")
        return results

    y_test_f = y_test[finite_mask]
    y_pred_f = y_pred_test[finite_mask]

    results["numerical"] = {
        "r2_train": _safe_r2(y_train, y_pred_train),
        "r2_test": _safe_r2(y_test_f, y_pred_f),
        "mae_test": float(mean_absolute_error(y_test_f, y_pred_f)),
        "rmse_test": float(np.sqrt(mean_squared_error(y_test_f, y_pred_f))),
        "mse_test": float(mean_squared_error(y_test_f, y_pred_f)),
        "n_test_samples": int(len(y_test_f)),
        "n_finite_predictions": int(finite_mask.sum()),
        "n_invalid_predictions": int((~finite_mask).sum()),
    }

    # Residual analysis
    resid = y_test_f - y_pred_f
    _, normality_p = stats.normaltest(resid)
    results["residuals"] = {
        "mean": float(np.mean(resid)),
        "std": float(np.std(resid)),
        "min": float(np.min(resid)),
        "max": float(np.max(resid)),
        "skewness": float(stats.skew(resid)),
        "kurtosis": float(stats.kurtosis(resid)),
        "normality_p_value": float(normality_p),
        "residuals_appear_normal": bool(normality_p > 0.05),
    }

    # -----------------------------------------------------------------------
    # 4. Bootstrap uncertainty
    # -----------------------------------------------------------------------
    boot_r2 = []
    for _ in range(n_bootstrap):
        idx = np.random.choice(len(y_test_f), size=len(y_test_f), replace=True)
        try:
            r2b = _safe_r2(y_test_f[idx], y_pred_f[idx])
            if np.isfinite(r2b):
                boot_r2.append(r2b)
        except Exception:
            pass

    if boot_r2:
        results["bootstrap"] = {
            "r2_mean": float(np.mean(boot_r2)),
            "r2_std": float(np.std(boot_r2)),
            "r2_ci_lower": float(np.percentile(boot_r2, 2.5)),
            "r2_ci_upper": float(np.percentile(boot_r2, 97.5)),
            "n_bootstrap_samples": len(boot_r2),
        }
    else:
        results["bootstrap"] = {}

    # -----------------------------------------------------------------------
    # 5. Noise robustness
    # -----------------------------------------------------------------------
    noise_sensitivity = {}
    for noise_level in noise_levels:
        try:
            y_noisy = y_test_f + np.random.normal(0, noise_level * np.std(y_test_f), size=len(y_test_f))
            r2_noisy = _safe_r2(y_noisy, y_pred_f)
            noise_sensitivity[f"noise_{int(noise_level*100)}pct"] = float(r2_noisy)
        except Exception:
            noise_sensitivity[f"noise_{int(noise_level*100)}pct"] = float("nan")

    results["noise_sensitivity"] = noise_sensitivity

    # -----------------------------------------------------------------------
    # 6. Generate verification verdict
    # -----------------------------------------------------------------------
    r2_test_val = results["numerical"].get("r2_test", float("nan"))
    limitations = []

    if r2_test_val < 0.5:
        limitations.append("R² below 0.5 — poor predictive fit on held-out data.")
    if singularities:
        limitations.append(f"Expression has singularities: {singularities}")
    if domain_issues:
        limitations.append(f"Domain restrictions: {domain_issues}")
    if results["residuals"].get("skewness", 0) > 2:
        limitations.append("Residuals are highly skewed — model misfit in some regions.")
    if results["bootstrap"].get("r2_std", 0) > 0.1:
        limitations.append("High bootstrap variance — uncertain generalization.")
    if len(working_df) < 50:
        limitations.append("Small dataset — results may not generalize.")

    results["limitations"] = limitations

    if r2_test_val >= 0.9 and not results["errors"]:
        verdict = "strong_fit"
    elif r2_test_val >= 0.7:
        verdict = "moderate_fit"
    elif r2_test_val >= 0.4:
        verdict = "weak_fit"
    else:
        verdict = "poor_fit"

    results["verdict"] = verdict
    results["verified"] = len(results["errors"]) == 0

    return results
