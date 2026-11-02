'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { FileText, Download, Copy, Check } from 'lucide-react';

export default function PaperPage() {
  const [copied, setCopied] = React.useState(false);

  const latexCode = `\\documentclass[11pt,a4paper]{article}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{\\textbf{Autonomous Discovery of Planetary Orbital Dynamics via Evolutionary Symbolic Regression}}
\\author{EquationZero Autonomous Research Platform}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
We demonstrate the automated extraction of Kepler's Third Law from raw observational measurements without human intervention. Using Pareto-optimal symbolic regression, the candidate formulation $T = a^{3/2}$ was isolated from high-dimensional observational data with held-out $R^2 = 0.9998$ and zero unphysical singularities.
\\end{abstract}

\\section{Methodology}
Measurements underwent SHA-256 integrity verification (hash: \\texttt{e3b0c442...}) and 24-step statistical validation. Non-linear genetic programming explored basis operators $\\{+, -, *, /, \\sqrt{\\cdot}\\}$ over 40 generations.

\\section{Discovered Equation}
\\begin{equation}
T = a^{1.5000} \\pm 0.0002
\\end{equation}

\\section{Reproducibility Statement}
All code, seeds ($S=42$), and environment manifests are immutably archived in the EquationZero Reproducibility Vault.

\\end{document}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Research Paper Studio</h1>
            </div>
            <p className="text-xs text-slate-400">
              Generate peer-review-ready academic manuscripts in LaTeX, Markdown, and PDF formats automatically populated with discovery evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-100 border border-border text-xs text-slate-300 hover:text-white hover:bg-surface-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied LaTeX' : 'Copy LaTeX'}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium transition-colors">
              <Download className="w-4 h-4" />
              <span>Export PDF Draft</span>
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
            <span>manuscript_draft.tex</span>
            <span>Document Class: Article (A4)</span>
          </div>
          <pre className="bg-surface-100/80 p-5 rounded-xl border border-border text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {latexCode}
          </pre>
        </div>
      </main>
    </div>
  );
}
