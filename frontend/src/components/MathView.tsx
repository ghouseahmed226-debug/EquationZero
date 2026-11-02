'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  if (!math) return null;

  // Clean sympy latex if needed
  let cleaned = math.trim();
  
  try {
    return (
      <span className={`inline-block font-mono overflow-x-auto max-w-full ${className}`}>
        {block ? (
          <BlockMath math={cleaned} errorColor="#ef4444" />
        ) : (
          <InlineMath math={cleaned} errorColor="#ef4444" />
        )}
      </span>
    );
  } catch (err) {
    return <span className={`font-mono text-xs text-amber-400 ${className}`}>{cleaned}</span>;
  }
};
