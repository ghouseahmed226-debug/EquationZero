'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Cpu, Bot, CheckSquare, MessageSquareCode } from 'lucide-react';

export default function AgentPage() {
  const steps = [
    { title: 'Data Inspection & Integrity Audit', status: 'Completed', details: 'Parsed Kepler orbital period vs semi-major axis. Zero missing records. No anomalous outliers.' },
    { title: 'Hypothesis Formulation', status: 'Completed', details: 'Hypothesized non-linear power relation T ∝ a^γ governed by central gravitational field.' },
    { title: 'Evolutionary Symbolic Regression', status: 'Completed', details: 'Discovered candidate expression T = a^(3/2) with complexity score 4 and held-out R² of 0.9998.' },
    { title: 'Falsification Stress Test', status: 'Completed', details: 'Tested asymptotic behavior as a → 0 and high-noise regimes. Equation retained stability without poles.' },
    { title: 'Scientific Report Draft Generation', status: 'Pending Review', details: 'Drafted academic manuscript in LaTeX with methodology and reproducibility credentials.' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Zero Autonomous Scientific Researcher</h1>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous multi-agent orchestration: automated hypothesis generation, experiment execution, self-critique, and falsification.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Active Investigation Telemetry</span>
          </h2>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-100 border border-border flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white">{s.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{s.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
