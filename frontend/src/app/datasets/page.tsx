'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { api } from '@/lib/api';
import { Database, Plus, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Dataset } from '@/types';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const projects = await api.getProjects().catch(() => []);
      const pId = projects[0]?.id || 'default-proj';
      const list = await api.getDatasets(pId).catch(() => []);
      setDatasets(list);
      if (list.length > 0 && !selectedDataset) {
        selectDataset(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectDataset = async (d: Dataset) => {
    setSelectedDataset(d);
    try {
      const prev = await api.getDatasetPreview(d.id, 20);
      setPreview(prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSynthetic = async (name: string) => {
    setIsGenerating(true);
    try {
      const projects = await api.getProjects().catch(() => []);
      const pId = projects[0]?.id || 'default-proj';
      await api.createSyntheticDataset(name, pId, 250);
      await loadDatasets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Scientific Dataset Explorer</h1>
            </div>
            <p className="text-xs text-slate-400">
              Inspect variable distributions, unit bindings, missing values, outliers, and cryptographic SHA-256 fingerprints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreateSynthetic('pendulum')}
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-lg bg-surface-100 border border-border text-xs text-slate-300 hover:text-white hover:bg-surface-200 transition-colors"
            >
              + Add Pendulum Dataset
            </button>
            <button
              onClick={() => handleCreateSynthetic('ideal_gas')}
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium transition-colors"
            >
              + Add Ideal Gas Law
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Datasets List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 mb-2">Stored Datasets</h2>
            {datasets.map((d) => {
              const active = selectedDataset?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => selectDataset(d)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600/10 border-blue-500/40 shadow-sm'
                      : 'bg-surface-100/60 border-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{d.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-200 text-slate-400 uppercase">
                      {d.source}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-1 mb-2">{d.description || 'Raw scientific observations'}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{d.num_rows} rows • {d.num_columns} cols</span>
                    <span className="text-blue-400">{d.file_hash?.slice(0, 10)}...</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dataset Details & Preview */}
          <div className="lg:col-span-8 space-y-6">
            {selectedDataset && (
              <>
                {/* Meta details */}
                <div className="glass-panel p-6 rounded-2xl border border-border">
                  <h3 className="text-base font-bold text-white mb-2">{selectedDataset.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{selectedDataset.description}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="bg-surface-100 p-3 rounded-lg border border-border">
                      <span className="text-slate-500 block text-[10px]">TOTAL ROWS</span>
                      <span className="text-slate-200 font-bold text-sm">{selectedDataset.num_rows}</span>
                    </div>
                    <div className="bg-surface-100 p-3 rounded-lg border border-border">
                      <span className="text-slate-500 block text-[10px]">COLUMNS</span>
                      <span className="text-slate-200 font-bold text-sm">{selectedDataset.num_columns}</span>
                    </div>
                    <div className="bg-surface-100 p-3 rounded-lg border border-border">
                      <span className="text-slate-500 block text-[10px]">FORMAT</span>
                      <span className="text-slate-200 font-bold text-sm uppercase">{selectedDataset.file_format}</span>
                    </div>
                    <div className="bg-surface-100 p-3 rounded-lg border border-border">
                      <span className="text-slate-500 block text-[10px]">SHA-256 HASH</span>
                      <span className="text-blue-400 truncate block text-xs">{selectedDataset.file_hash?.slice(0, 12)}...</span>
                    </div>
                  </div>
                </div>

                {/* Table Preview */}
                {preview && (
                  <div className="glass-panel p-6 rounded-2xl border border-border overflow-hidden">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Observation Samples (Top {preview.rows?.length})</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-surface-100 text-slate-400 border-b border-border">
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
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
