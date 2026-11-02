export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  domain?: string;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ColumnInfo {
  name: string;
  dtype: string;
  unit?: string;
  missing_count: number;
  missing_pct: number;
  unique_count?: number;
  min_val?: number;
  max_val?: number;
  mean_val?: number;
  std_val?: number;
  median_val?: number;
  skewness?: number;
  kurtosis?: number;
  n_outliers_iqr?: number;
  outlier_pct?: number;
  appears_normal?: boolean;
}

export interface Dataset {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  file_format: string;
  file_size_bytes?: number;
  file_hash?: string;
  num_rows: number;
  num_columns: number;
  columns_info: ColumnInfo[];
  summary_stats: Record<string, any>;
  source: string;
  created_at: string;
}

export interface CandidateEquation {
  rank: number;
  expression: string;
  latex: string;
  complexity: number;
  loss: number;
  r2_train: number;
  r2_val?: number;
  r2_test: number;
  mae: number;
  rmse: number;
  parameters: Record<string, number>;
  residuals_summary: {
    mean: number;
    std: number;
    min: number;
    max: number;
    skewness: number;
    kurtosis: number;
  };
  score: number;
}

export interface Discovery {
  id: string;
  project_id: string;
  dataset_id: string;
  name?: string;
  target_variable: string;
  input_variables: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  candidate_equations: CandidateEquation[];
  best_equation_idx?: number;
  algorithm: string;
  random_seed?: number;
  runtime_seconds?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface VerificationResult {
  expression: string;
  simplified: string;
  latex: string;
  singularities: string[];
  domain_issues: string[];
  numerical: {
    r2_train: number;
    r2_test: number;
    mae_test: number;
    rmse_test: number;
    n_test_samples: number;
  };
  residuals: {
    mean: number;
    std: number;
    skewness: number;
    kurtosis: number;
    normality_p_value: number;
    residuals_appear_normal: boolean;
  };
  bootstrap: {
    r2_mean: number;
    r2_std: number;
    r2_ci_lower: number;
    r2_ci_upper: number;
  };
  noise_sensitivity: Record<string, number>;
  verdict: 'strong_fit' | 'moderate_fit' | 'weak_fit' | 'poor_fit';
  limitations: string[];
  verified: boolean;
}

export interface BenchmarkItem {
  name: string;
  description: string;
  domain: string;
}
