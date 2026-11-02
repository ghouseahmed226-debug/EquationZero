'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { 
  Sparkles, 
  Binary, 
  FlaskConical, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  FileCheck2, 
  Cpu, 
  GitBranch, 
  TrendingUp,
  Database,
  Code2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';

export default function LandingPage() {
  const [backendHealth, setBackendHealth] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    api.checkHealth()
      .then(() => setBackendHealth('online'))
      .catch(() => setBackendHealth('offline'));
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-violet-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-8 backdrop-blur-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Scientific Discovery Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">Mathematics</span> Hidden in Reality
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed font-normal">
            From raw scientific measurements to verified symbolic equations, testable hypotheses, 
            dimensional analysis, and reproducible publication drafts. Not a generic chatbot. A true mathematical discovery machine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/discover"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25 border border-blue-400/30 group"
            >
              <span>Start Discovery Pipeline</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/benchmarks"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white font-medium text-sm transition-all"
            >
              <span>Explore Synthetic Benchmarks</span>
            </Link>
          </div>

          {/* Quick Engine Status Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-100 border border-border text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendHealth === 'online' ? 'bg-emerald-500 animate-pulse' : backendHealth === 'offline' ? 'bg-rose-500' : 'bg-amber-500'}`} />
              <span className="font-mono text-slate-300">
                Core Engine: {backendHealth === 'online' ? 'ONLINE (FastAPI + SymPy + PySR ready)' : backendHealth === 'offline' ? 'LOCAL PROXY MODE' : 'CONNECTING...'}
              </span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">Python 3.12 Scientific Worker</span>
          </div>
        </div>
      </section>

      {/* Feature Grid: 4 Core Pillars */}
      <section className="py-20 border-t border-border bg-surface-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Built for Genuine Mathematical Rigor
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Every discovered relationship goes through 24 rigorous steps of validation, dimensional consistency, and falsification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <Binary className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Symbolic Regression Engine</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  PySR genetic programming coupled with Pareto-optimal complexity optimization. Unearths true analytical expressions rather than black-box approximations.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-blue-400">
                <span>Pareto Complexity Frontier</span>
                <span>SymPy + Julia</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Verification Laboratory</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Bootstrap resampling (100+ draws), singularity identification, domain constraints, residual normality analysis, and dimensional invariance tests.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-violet-400">
                <span>Residual Normality</span>
                <span>Bootstrap 95% CI</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Falsification Engine</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Actively seeks contradictory boundary conditions, out-of-domain divergences, and high-noise sensitivity regions to stress-test candidate models.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>Popperian Falsification</span>
                <span>Active Testing</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Autonomous Researcher</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Multi-agent orchestration that formulates hypotheses, plans experiments, requests targeted data points, and audits statistical claims.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-amber-400">
                <span>Zero Research Agent</span>
                <span>Audit Logs</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Reproducibility Vault</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Cryptographic SHA-256 fingerprinting of datasets, pinned library versions, execution seeds, and exportable reproduction scripts.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-cyan-400">
                <span>SHA-256 Artifacts</span>
                <span>1-Click Replay</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Equation Arena</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Head-to-head empirical model evaluation comparing Linear, Polynomial, SINDy, Rational, and Pure Symbolic models on identical cross-validation splits.
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-rose-400">
                <span>AIC / BIC / Adjusted R²</span>
                <span>Multi-Model</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-300">EQUATIONZERO</span> — Discover the Mathematics Hidden in Reality.
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/ghouseahmed226-debug/EquationZero" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">
              GitHub Repository
            </a>
            <span>Open Source Academic Research Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
