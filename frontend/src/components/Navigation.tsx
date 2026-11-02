'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Atom, 
  Database, 
  Compass, 
  FlaskConical, 
  BarChart3, 
  BookOpen, 
  History, 
  Cpu, 
  FileText, 
  ShieldCheck,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Navigation = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: Atom },
    { href: '/discover', label: 'Discovery Studio', icon: Compass },
    { href: '/datasets', label: 'Dataset Explorer', icon: Database },
    { href: '/arena', label: 'Equation Arena', icon: Layers },
    { href: '/verify', label: 'Verification Lab', icon: FlaskConical },
    { href: '/benchmarks', label: 'Benchmarks', icon: BarChart3 },
    { href: '/agent', label: 'Autonomous Researcher', icon: Cpu },
    { href: '/vault', label: 'Reproducibility Vault', icon: History },
    { href: '/paper', label: 'Research Paper Studio', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090e] rounded-[7px] flex items-center justify-center">
                <span className="font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 text-lg">E₀</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">EQUATION<span className="text-blue-500">ZERO</span></span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">v1.0-RC</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider">Discover the Mathematics Hidden in Reality</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/[0.08]">
            {links.slice(0, 5).map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all border border-blue-400/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Discovery</span>
          </Link>
          <a
            href="https://github.com/ghouseahmed226-debug/EquationZero"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
