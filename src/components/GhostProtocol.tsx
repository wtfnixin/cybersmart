import React, { useState } from 'react';
import { Persona } from '../types';
import { ShieldCheck, CheckSquare, Square, Copy, Check, FileText, Sparkles, Trophy, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GhostProtocolProps {
  persona: Persona;
  completedRemediations: string[];
  onToggleRemediation: (id: string) => void;
  currentScore?: number;
}

export const GhostProtocol: React.FC<GhostProtocolProps> = ({
  persona,
  completedRemediations,
  onToggleRemediation,
}) => {
  const [copied, setCopied] = useState(false);
  const totalRemediations = persona.remediationPlan.length;
  const completedCount = completedRemediations.length;
  const isFullyHardened = completedCount === totalRemediations;
  const progressPct = totalRemediations > 0 ? (completedCount / totalRemediations) * 100 : 0;

  const handleToggle = (id: string) => {
    onToggleRemediation(id);
    if (!completedRemediations.includes(id) && completedCount + 1 === totalRemediations) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#00D68F', '#7FFFFC', '#FFFFFF'],
        gravity: 0.8,
        ticks: 200,
      });
    }
  };

  const legalTakedownLetter = `Subject: Formal Data Erasure Request (GDPR Art. 17 / CCPA § 1798.105) - ${persona.name}

To Data Privacy & Compliance Officer,

I am writing to formally request the immediate erasure and de-indexing of all personally identifiable information (PII) associated with my identity under GDPR Article 17 and CCPA regulations.

Target Subject: ${persona.name}
Organization/Platform: ${persona.company}
Identified Exposure Vectors:
1. Publicly accessible identification badge photographs and internal employee IDs.
2. Unconsented indexing of personal travel itineraries and geolocation records.
3. Indexed public records referencing personal security recovery tokens.

Please confirm in writing within 30 days that all records, cache entries, and data broker syndication listings matching my name and associated identifiers have been permanently removed.

Sincerely,
${persona.name}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(legalTakedownLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 lg:px-8 py-4 pb-8">
      <div className={`glass rounded-2xl overflow-hidden transition-all duration-700 ${
        isFullyHardened ? 'border border-cyber-emerald/40 shadow-cyber-emerald' : 'border border-cyber-border/60'
      }`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 border-b border-cyber-border/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border transition-all ${
              isFullyHardened
                ? 'bg-cyber-emerald/15 border-cyber-emerald/30'
                : 'bg-cyber-surface border-cyber-border'
            }`}>
              {isFullyHardened ? (
                <Trophy className="w-4.5 h-4.5 text-cyber-emerald" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5 text-cyber-emerald" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-display text-white uppercase tracking-wide">
                  Ghost Protocol
                </h2>
                {isFullyHardened && (
                  <span className="badge badge-emerald text-[8px]">
                    <Sparkles className="w-2.5 h-2.5" />
                    FULLY HARDENED
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-cyber-muted mt-0.5">
                Interactive Defensive Remediation Engine
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 sm:shrink-0">
            <div className="text-right">
              <div className="text-xs font-mono text-slate-300">
                <span className={`font-bold ${isFullyHardened ? 'text-cyber-emerald' : 'text-cyber-cyan'}`}>
                  {completedCount}
                </span>
                <span className="text-cyber-muted"> / {totalRemediations}</span>
              </div>
              <div className="text-[9px] font-mono text-cyber-muted uppercase tracking-wider">Actions Neutralized</div>
            </div>
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(23,34,64,0.8)" strokeWidth="3.5" />
                <circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke={isFullyHardened ? '#00D68F' : '#00E5FF'}
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={2 * Math.PI * 16 * (1 - progressPct / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white">
                {Math.round(progressPct)}%
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Remediation Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-cyber-emerald" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
                  Hardening Checklist
                </span>
              </div>
              <span className="text-[9px] font-mono text-cyber-muted">Click to toggle</span>
            </div>

            <div className="space-y-2.5">
              {persona.remediationPlan.map((item, idx) => {
                const isChecked = completedRemediations.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-300 group ${
                      isChecked
                        ? 'bg-cyber-emerald/5 border-cyber-emerald/30'
                        : 'bg-cyber-surface/30 border-cyber-border/60 hover:border-cyber-border hover:bg-cyber-surface/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`mt-0.5 shrink-0 transition-all ${isChecked ? 'text-cyber-emerald' : 'text-slate-600 group-hover:text-slate-400'}`}>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[9px] font-mono text-cyber-muted uppercase tracking-wider">
                          {item.platform}
                        </span>
                        <span className={`badge text-[8px] ${isChecked ? 'badge-emerald' : 'badge-cyan'}`}>
                          {isChecked ? '✓ Done' : `-${item.impactScoreDrop} IVI`}
                        </span>
                      </div>
                      <p className={`text-[11px] font-sans leading-relaxed transition-all ${
                        isChecked ? 'line-through text-slate-600' : 'text-slate-200'
                      }`}>
                        {item.action}
                      </p>
                    </div>

                    {/* Step number */}
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                      isChecked ? 'bg-cyber-emerald/20 text-cyber-emerald' : 'bg-cyber-surface text-slate-600'
                    }`}>
                      {idx + 1}
                    </div>
                  </button>
                );
              })}
            </div>

            {isFullyHardened && (
              <div className="mt-4 p-4 rounded-xl bg-cyber-emerald/5 border border-cyber-emerald/30 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-cyber-emerald shrink-0" />
                <div>
                  <div className="text-[11px] font-mono font-bold text-cyber-emerald">Mission Complete!</div>
                  <div className="text-[10px] font-mono text-slate-400">All critical breadcrumbs neutralized. Digital doppelgänger risk eliminated.</div>
                </div>
              </div>
            )}
          </div>

          {/* Legal Takedown Generator */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyber-cyan" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
                  GDPR / CCPA Takedown Letter
                </span>
              </div>
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                  copied
                    ? 'bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30'
                    : 'bg-cyber-surface/60 text-cyber-cyan border border-cyber-border hover:border-cyber-cyan/40 hover:bg-cyber-cyan/5'
                }`}
              >
                {copied ? (
                  <><Check className="w-3 h-3" /> Copied!</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy</>
                )}
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-cyber-border/60 bg-cyber-darkest/70">
              {/* Letter header bar */}
              <div className="flex items-center gap-2 px-3 py-2 bg-cyber-surface/40 border-b border-cyber-border/40">
                <div className="w-2 h-2 rounded-full bg-cyber-cyan/60" />
                <span className="text-[9px] font-mono text-cyber-muted">legal_erasure_request.txt</span>
              </div>
              <textarea
                readOnly
                value={legalTakedownLetter}
                rows={11}
                className="w-full p-4 bg-transparent text-[10px] font-mono text-slate-300 resize-none outline-none leading-relaxed"
              />
            </div>

            <p className="mt-2.5 text-[9px] font-mono text-cyber-muted leading-relaxed">
              * Statutory notice enforcing mandatory data erasure from data brokers, aggregators, and social indexes under GDPR Article 17 & CCPA Section 1798.105.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
