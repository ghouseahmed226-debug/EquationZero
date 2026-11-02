import pytest
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'scientific')))

from analysis.dataset_analyzer import generate_synthetic_dataset, analyze_dataset
from discovery.engine import run_discovery
from verification.verifier import verify_equation


def test_synthetic_generation():
    df, ground_truth = generate_synthetic_dataset('kepler', n_samples=50, seed=42)
    assert 'a' in df.columns
    assert 'T' in df.columns
    assert len(df) == 50
    assert 'Kepler' in ground_truth


def test_dataset_analysis():
    df, _ = generate_synthetic_dataset('linear', n_samples=50, seed=42)
    analysis = analyze_dataset(df)
    assert 'summary' in analysis
    assert analysis['summary']['n_rows'] == 50
    assert len(analysis['columns_info']) == len(df.columns)


def test_discovery_and_verification():
    df, _ = generate_synthetic_dataset('linear', n_samples=60, seed=42)
    res = run_discovery(
        df=df,
        target='y',
        inputs=['x1', 'x2'],
        config={'num_iterations': 10, 'population_size': 15, 'random_seed': 42}
    )
    assert len(res.candidates) > 0
    best = res.candidates[0]
    assert best.r2_test > 0.8

    v = verify_equation(best.expression, df, target='y', inputs=['x1', 'x2'], random_seed=42)
    assert v['verified'] is True
    assert 'numerical' in v
