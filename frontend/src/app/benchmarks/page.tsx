'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { api } from '@/lib/api';
import { BarChart3, FlaskConical, Award, ShieldAlert } from 'lucide-react';
import { BenchmarkItem } from '@/types';

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('kepler');

  useEffect(() => {
    api.getBenchmarks().then((res) => {
      setBenchmarks(res.benchmarks || []);
      loadPreview('kepler');
    }).catch(console.error);
  }, []);

  const loadPreview = async (name: string) => {
    setSelectedBenchmark(name);
    try {
      const data = await api.previewBenchmark(name);
      setPreview(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Scientific Benchmark Suite</h1>
          </div>
          <p className="text-xs text-slate-400">
            Gold-standard analytical equations with exact ground-truth formulations for evaluating recovery rate, noise stability, and parsimony.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 mb-2">Pre-Configured Physics & Math Benchmarks</h2>
            {benchmarks.map((b) => {
              const active = selectedBenchmark === b.name;
              return (
                <div
                  key={b.name}
                  onClick={() => loadPreview(b.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600/10 border-blue-500/40 shadow-sm'
                      : 'bg-surface-100/60 border-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white capitalize">{b.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-blue-400 uppercase">
                      {b.domain}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 mt-2 bg-surface-200/50 p-2 rounded border border-border">
                    {b.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benchmark Details */}
          <div className="lg:col-span-7 space-y-6">
            {preview && (
              <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                    <Award className="w-4 h-4" />
                    <span>Exact Ground Truth Target:</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white bg-surface-100 p-3 rounded-xl border border-border">
                    {preview.ground_truth}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Synthetic Integrity Safeguard:</span>
                    <span>{preview.note} All experiments performed on this benchmark will be immutably tagged as synthetic recovery.</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Sample Numerical Values ({preview.n_samples} generated records)</h4>
                  <div className="overflow-x-auto max-h-72 border border-border rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-surface-100 text-slate-400 sticky top-0 border-b border-border">
                        <tr>
                          {preview.columns?.map((c: string) => (
                            <th key={c} className="p-2.5 font-medium">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {preview.rows?.map((row: any[], i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            {row.map((cell: any, j: number) => (
                              <td key={j} className="p-2.5 text-slate-300">{typeof cell === 'number' ? cell.toFixed(4) : cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
