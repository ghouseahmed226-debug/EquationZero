'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { History, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function VaultPage() {
  const records = [
    { id: 'REC-89241', target: 'T (Orbital Period)', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', seed: 42, algo: 'PySR v0.16.2', status: 'Reproducible' },
    { id: 'REC-89242', target: 'P (Gas Pressure)', hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', seed: 104, algo: 'Symbolic GP', status: 'Reproducible' },
    { id: 'REC-89243', target: 'y (Harmonic Wave)', hash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', seed: 777, algo: 'PySR v0.16.2', status: 'Reproducible' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Discovery Reproducibility Vault</h1>
          </div>
          <p className="text-xs text-slate-400">
            Immutable cryptographic fingerprints, exact execution seeds, library version manifests, and single-click execution replay scripts.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-100 text-slate-400 border-b border-border">
                <tr>
                  <th className="p-3">Record ID</th>
                  <th className="p-3">Discovered Target</th>
                  <th className="p-3">Dataset SHA-256 Fingerprint</th>
                  <th className="p-3">RNG Seed</th>
                  <th className="p-3">Software Stack</th>
                  <th className="p-3">Validation Status</th>
                  <th className="p-3">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">{r.id}</td>
                    <td className="p-3 text-slate-200">{r.target}</td>
                    <td className="p-3 text-cyan-400 truncate max-w-[180px]">{r.hash}</td>
                    <td className="p-3 text-slate-300">{r.seed}</td>
                    <td className="p-3 text-slate-400">{r.algo}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-200 hover:bg-surface-300 text-slate-200 transition-colors">
                        <Download className="w-3 h-3" />
                        <span>Replay Script</span>
                      </button>
                    </td>
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
