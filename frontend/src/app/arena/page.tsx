'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Layers, Trophy, Cpu, Zap, Activity } from 'lucide-react';

export default function ArenaPage() {
  const models = [
    { name: 'Symbolic GP (PySR)', type: 'Analytical Expression', r2: 0.9994, complexity: 5, runtime: '2.4s', memory: '45MB', generalizable: 'High' },
    { name: 'Linear Ridge Regression', type: 'Linear Combination', r2: 0.6210, complexity: 2, runtime: '0.01s', memory: '12MB', generalizable: 'Low' },
    { name: 'Polynomial Degree 3', type: 'Series Expansion', r2: 0.9124, complexity: 14, runtime: '0.08s', memory: '18MB', generalizable: 'Medium' },
    { name: 'SINDy Dynamical Identifier', type: 'Sparse Differential', r2: 0.9982, complexity: 7, runtime: '1.2s', memory: '34MB', generalizable: 'Very High' },
    { name: 'Deep MLP Baseline', type: 'Black-box Neural Net', r2: 0.9850, complexity: 4096, runtime: '8.6s', memory: '180MB', generalizable: 'Low (Overfits)' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Equation Arena</h1>
          </div>
          <p className="text-xs text-slate-400">
            Multi-paradigm tournament comparing analytical symbolic equations against classical statistics, polynomials, and deep neural networks.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">
            <Trophy className="w-4 h-4" />
            <span>Leaderboard: Kepler Orbit Benchmark (Held-out Test Performance)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-100 text-slate-400 border-b border-border">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Model Family</th>
                  <th className="p-3">Model Type</th>
                  <th className="p-3">Test R²</th>
                  <th className="p-3">Complexity (Tokens/Params)</th>
                  <th className="p-3">Generalization Score</th>
                  <th className="p-3">Compute Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {models.map((m, i) => (
                  <tr key={i} className={`hover:bg-white/[0.02] ${i === 0 ? 'bg-blue-600/10' : ''}`}>
                    <td className="p-3 font-bold text-white">#{i + 1}</td>
                    <td className="p-3 font-bold text-slate-200">{m.name}</td>
                    <td className="p-3 text-slate-400">{m.type}</td>
                    <td className="p-3 font-bold text-emerald-400">{m.r2.toFixed(4)}</td>
                    <td className="p-3 text-slate-300">{m.complexity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        m.generalizable.includes('High') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-200 text-slate-400'
                      }`}>
                        {m.generalizable}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{m.runtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
