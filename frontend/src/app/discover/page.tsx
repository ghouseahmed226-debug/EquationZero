'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { MathView } from '@/components/MathView';
import { api } from '@/lib/api';
import { 
  Sparkles, 
  Play, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Sliders, 
  Flame, 
  ChevronRight,
  TrendingUp,
  FileCheck,
  Compass
} from 'lucide-react';
import { CandidateEquation } from '@/types';

export default function DiscoverPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [datasetAnalysis, setDatasetAnalysis] = useState<any>(null);
  
  // Configuration
  const [targetVar, setTargetVar] = useState<string>('');
  const [inputVars, setInputVars] = useState<string[]>([]);
  const [operators, setOperators] = useState<string[]>(['+', '-', '*', '/', 'sin', 'cos', 'exp', 'log', 'sqrt']);
  const [iterations, setIterations] = useState<number>(30);
  const [algorithm, setAlgorithm] = useState<string>('pysr');

  // Job status
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);
  const [selectedEquationIdx, setSelectedEquationIdx] = useState<number>(0);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Initialize with a default synthetic dataset if none exists
  useEffect(() => {
    async function init() {
      try {
        // Create demo project if needed
        const projects = await api.getProjects().catch(() => []);
        let projId = projects[0]?.id;
        if (!projId) {
          const newProj = await api.createProject({
            name: 'Kepler & Newtonian Dynamics Study',
            description: 'Automated planetary orbit and harmonic motion discovery',
            domain: 'physics'
          }).catch(() => ({ id: 'default-proj' }));
          projId = newProj.id;
        }

        // Get datasets or create Kepler benchmark
        const dsets = await api.getDatasets(projId).catch(() => []);
        if (dsets.length === 0) {
          const syn = await api.createSyntheticDataset('kepler', projId, 250).catch(() => null);
          if (syn?.dataset) {
            setDatasets([syn.dataset]);
            setSelectedDatasetId(syn.dataset.id);
            loadDatasetDetails(syn.dataset.id);
          }
        } else {
          setDatasets(dsets);
          setSelectedDatasetId(dsets[0].id);
          loadDatasetDetails(dsets[0].id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    init();
  }, []);

  const loadDatasetDetails = async (id: string) => {
    try {
      const analysis = await api.getDatasetAnalysis(id);
      setDatasetAnalysis(analysis);
      const numCols = analysis.summary?.numeric_columns || [];
      if (numCols.length >= 2) {
        setTargetVar(numCols[numCols.length - 1]);
        setInputVars(numCols.slice(0, numCols.length - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    loadDatasetDetails(id);
  };

  const handleStartDiscovery = async () => {
    if (!selectedDatasetId || !targetVar || inputVars.length === 0) return;
    setIsDiscovering(true);
    setProgress(10);
    setDiscoveryResult(null);
    setVerificationData(null);

    try {
      const disc = await api.createDiscovery({
        project_id: datasets.find(d => d.id === selectedDatasetId)?.project_id || 'default-proj',
        dataset_id: selectedDatasetId,
        name: `Discovery on ${targetVar}`,
        config: {
          target_variable: targetVar,
          input_variables: inputVars,
          operators,
          num_iterations: iterations,
          population_size: 30,
          algorithm
        }
      });

      // Poll discovery status
      const interval = setInterval(async () => {
        try {
          const poll = await api.getDiscovery(disc.id);
          setProgress(poll.progress || 20);
          if (poll.status === 'completed') {
            clearInterval(interval);
            setDiscoveryResult(poll);
            setIsDiscovering(false);
            if (poll.candidate_equations?.length > 0) {
              handleVerify(disc.id, 0);
            }
          } else if (poll.status === 'failed') {
            clearInterval(interval);
            setIsDiscovering(false);
            alert(`Discovery failed: ${poll.error_message}`);
          }
        } catch (e) {
          clearInterval(interval);
          setIsDiscovering(false);
        }
      }, 1000);

    } catch (err: any) {
      setIsDiscovering(false);
      alert(err.message || 'Error running discovery');
    }
  };

  const handleVerify = async (discoveryId: string, eqIdx: number) => {
    setSelectedEquationIdx(eqIdx);
    setIsVerifying(true);
    try {
      const res = await api.verifyDiscovery(discoveryId, eqIdx);
      setVerificationData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Symbolic Discovery Studio</h1>
            </div>
            <p className="text-xs text-slate-400">
              Transform high-dimensional scientific measurements into analytical mathematical equations via evolutionary symbolic regression.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartDiscovery}
              disabled={isDiscovering || !selectedDatasetId}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white transition-all shadow-lg ${
                isDiscovering
                  ? 'bg-blue-600/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25 border border-blue-400/30'
              }`}
            >
              {isDiscovering ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Discovering Expressions ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Discovery</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Dataset Selection Card */}
            <div className="glass-panel p-5 rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Database className="w-4 h-4 text-blue-400" />
                <span>1. Select Observation Data</span>
              </div>

              <select
                value={selectedDatasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 mb-4"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.num_rows} rows)
                  </option>
                ))}
              </select>

              {datasetAnalysis && (
                <div className="text-[11px] font-mono bg-surface-100/60 p-3 rounded-lg border border-border space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Rows / Columns:</span>
                    <span className="text-slate-200">{datasetAnalysis.summary?.n_rows} × {datasetAnalysis.summary?.n_columns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dataset Hash:</span>
                    <span className="text-blue-400 truncate max-w-[140px]">{datasetAnalysis.summary?.dataset_hash?.slice(0, 16)}...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Variable Assignment Card */}
            <div className="glass-panel p-5 rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>2. Target & Independent Variables</span>
              </div>

              {datasetAnalysis?.summary?.numeric_columns && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Target y (dependent):</label>
                    <select
                      value={targetVar}
                      onChange={(e) => setTargetVar(e.target.value)}
                      className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                    >
                      {datasetAnalysis.summary.numeric_columns.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Input Features X (independent):</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {datasetAnalysis.summary.numeric_columns
                        .filter((c: string) => c !== targetVar)
                        .map((col: string) => {
                          const active = inputVars.includes(col);
                          return (
                            <button
                              key={col}
                              onClick={() => {
                                setInputVars(active ? inputVars.filter(x => x !== col) : [...inputVars, col]);
                              }}
                              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                                active
                                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm'
                                  : 'bg-surface-100 text-slate-400 border-border hover:bg-surface-200'
                              }`}
                            >
                              {col}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Operator Configuration Card */}
            <div className="glass-panel p-5 rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>3. Mathematical Basis Operators</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {['+', '-', '*', '/', '^', 'sin', 'cos', 'exp', 'log', 'sqrt'].map((op) => {
                  const active = operators.includes(op);
                  return (
                    <button
                      key={op}
                      onClick={() => {
                        setOperators(active ? operators.filter(o => o !== op) : [...operators, op]);
                      }}
                      className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                        active
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-surface-100 text-slate-500 border-border hover:bg-surface-200'
                      }`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <span>Generations / Iterations:</span>
                  <span className="font-mono text-slate-200">{iterations}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Discoveries & Verification */}
          <div className="lg:col-span-8 space-y-6">
            {/* Real-time Progress Bar */}
            {isDiscovering && (
              <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 bg-blue-950/20">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-blue-400 flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Searching Functional Expression Space...
                  </span>
                  <span className="text-slate-300 font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Candidate Equations Table */}
            {discoveryResult && (
              <div className="glass-panel p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">Discovered Candidate Equations</h2>
                    <p className="text-xs text-slate-400">
                      Ranked by Pareto Score combining R² generalization and structural complexity penalty.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-surface-100 border border-border text-slate-300">
                    Engine: {discoveryResult.algorithm} ({discoveryResult.runtime_seconds?.toFixed(2)}s)
                  </span>
                </div>

                <div className="space-y-3">
                  {discoveryResult.candidate_equations?.map((eq: CandidateEquation, idx: number) => {
                    const isSelected = selectedEquationIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleVerify(discoveryResult.id, idx)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500/40 shadow-md shadow-blue-500/10'
                            : 'bg-surface-100/60 border-border hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-surface-200 text-[10px] font-mono flex items-center justify-center text-slate-300">
                              #{idx + 1}
                            </span>
                            <div className="text-sm font-semibold text-white">
                              <MathView math={eq.latex || eq.expression} />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="text-slate-400">
                              Complexity: <span className="text-slate-200">{eq.complexity}</span>
                            </span>
                            <span className="text-emerald-400 font-bold">
                              R²: {eq.r2_test?.toFixed(4)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/[0.05]">
                          <span>Plain: <code className="text-slate-300">{eq.expression}</code></span>
                          <span className="text-slate-500">RMSE: {eq.rmse?.toFixed(4)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deep Verification Lab Panel */}
            {verificationData && (
              <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Comprehensive Mathematical & Numerical Verification</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase font-bold ${
                    verificationData.verdict === 'strong_fit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    Verdict: {verificationData.verdict.replace('_', ' ')}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface-100 p-3 rounded-xl border border-border">
                    <div className="text-[11px] text-slate-400 mb-1">Held-Out Test R²</div>
                    <div className="text-lg font-bold font-mono text-white">{verificationData.numerical?.r2_test?.toFixed(4)}</div>
                  </div>
                  <div className="bg-surface-100 p-3 rounded-xl border border-border">
                    <div className="text-[11px] text-slate-400 mb-1">Bootstrap 95% CI</div>
                    <div className="text-xs font-bold font-mono text-blue-400 mt-1">
                      [{verificationData.bootstrap?.r2_ci_lower?.toFixed(3)}, {verificationData.bootstrap?.r2_ci_upper?.toFixed(3)}]
                    </div>
                  </div>
                  <div className="bg-surface-100 p-3 rounded-xl border border-border">
                    <div className="text-[11px] text-slate-400 mb-1">Residual Mean / Std</div>
                    <div className="text-xs font-mono text-slate-300 mt-1">
                      μ={verificationData.residuals?.mean?.toFixed(3)}, σ={verificationData.residuals?.std?.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-surface-100 p-3 rounded-xl border border-border">
                    <div className="text-[11px] text-slate-400 mb-1">Residual Normality</div>
                    <div className={`text-xs font-bold mt-1 ${verificationData.residuals?.residuals_appear_normal ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {verificationData.residuals?.residuals_appear_normal ? 'Gaussian-like' : 'Skewed distribution'}
                    </div>
                  </div>
                </div>

                {/* Analytical Inspection */}
                <div className="bg-surface-100/70 p-4 rounded-xl border border-border space-y-2 text-xs">
                  <div className="font-semibold text-slate-200">Analytical SymPy Simplification:</div>
                  <div className="font-mono text-blue-300 bg-surface-200 p-2.5 rounded-lg overflow-x-auto">
                    {verificationData.simplified}
                  </div>
                </div>

                {/* Limitations and Caveats */}
                {verificationData.limitations?.length > 0 && (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 space-y-1">
                    <div className="font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      Scientific Caveats & Boundary Limitations:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-amber-200/80 pt-1">
                      {verificationData.limitations.map((lim: string, i: number) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
