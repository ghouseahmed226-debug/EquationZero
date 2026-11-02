'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { FlaskConical, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Equation Verification Laboratory</h1>
          </div>
          <p className="text-xs text-slate-400">
            Systematic stress-testing: boundary condition limits, singularity detection, bootstrap uncertainty intervals, and Buckingham Pi dimensional consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Numerical Verification</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes held-out cross-validation R², MAE, RMSE, MAPE, and residual quantile-quantile normality.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Symbolic & Algebraic Check</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes denominator roots, poles, domain restrictions on logarithms and square roots via SymPy CAS.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Robustness & Perturbation</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gaussian noise injection (1%, 5%, 10%) and 200+ bootstrap resampling iterations to assess stability.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
