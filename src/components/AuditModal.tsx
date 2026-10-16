import React from 'react';
import { Persona } from '../types';
import { X, ShieldCheck, Download, Printer, CheckCircle2, TrendingDown, Award, AlertOctagon } from 'lucide-react';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
  currentScore: number;
  completedRemediations: string[];
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  persona,
  currentScore,
  completedRemediations,
}) => {
  if (!isOpen) return null;

  const scoreDrop = persona.baselineScore - currentScore;
  const isProtected = currentScore <= 40;
  const reductionPct = Math.round((scoreDrop / persona.baselineScore) * 100);

  const handleDownloadJSON = () => {
    const reportData = {
      assessment: 'Doppelgänger AI — Personal Attack Surface Audit',
      track: 'UNPHISHABLE Hackathon',
      timestamp: new Date().toISOString(),
      subject: { name: persona.name, title: persona.title, company: persona.company, location: persona.location },
      metrics: {
        baselineScore: persona.baselineScore,
        currentScore,
        riskMitigatedPoints: scoreDrop,
        reductionPercentage: `${reductionPct}%`,
        status: isProtected ? 'PROTECTED / HARDENED' : 'ELEVATED RISK',
      },
      remediatedActions: persona.remediationPlan
        .filter((r) => completedRemediations.includes(r.id))
        .map((r) => ({ platform: r.platform, action: r.action, pointsSaved: r.impactScoreDrop })),
      activeCompromisedVectors: persona.breadcrumbs.map((b) => ({
        source: b.sourcePlatform, fact: b.extractedFact, severity: b.severity,
      })),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doppelganger-audit-${persona.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(8,13,26,0.98) 0%, rgba(5,8,16,0.99) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 0 60px -10px rgba(0, 229, 255, 0.2), 0 25px 50px rgba(0,0,0,0.8)',
        }}
      >
        {/* Top gradient line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/70 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/25">
              <Award className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wide">
                Privacy Audit Certificate
              </h3>
              <p className="text-[10px] font-mono text-cyber-muted">
                Impersonation Vulnerability Assessment · {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-cyber-surface transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Subject + Score Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-cyber-surface/30 border border-cyber-border/60 p-4">
              <div className="text-[9px] font-mono text-cyber-muted uppercase tracking-widest mb-2">Target Subject</div>
              <div className="flex items-center gap-2.5">
                <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-xl object-cover border border-cyber-border" />
                <div>
                  <div className="text-sm font-bold text-white">{persona.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{persona.title}</div>
                  <div className="text-[10px] text-cyber-muted font-mono">{persona.company}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-cyber-surface/30 border border-cyber-border/60 p-4">
              <div className="text-[9px] font-mono text-cyber-muted uppercase tracking-widest mb-3">Risk Status</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-mono font-black" style={{ color: isProtected ? '#00D68F' : '#FFB800' }}>
                    {currentScore}
                  </div>
                  <div className="text-[9px] font-mono text-cyber-muted">Current IVI</div>
                </div>
                <div className="text-center">
                  <TrendingDown className="w-5 h-5 text-cyber-emerald mx-auto mb-0.5" />
                  <div className="text-[9px] font-mono text-cyber-emerald font-bold">{reductionPct}%</div>
                  <div className="text-[9px] font-mono text-cyber-muted">reduced</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-black text-cyber-crimson">{persona.baselineScore}</div>
                  <div className="text-[9px] font-mono text-cyber-muted">Baseline IVI</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score metrics strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Baseline IVI', value: persona.baselineScore, color: 'text-cyber-crimson', bg: 'bg-cyber-crimson/5', border: 'border-cyber-crimson/20' },
              { label: 'Hardened IVI', value: currentScore, color: isProtected ? 'text-cyber-emerald' : 'text-cyber-amber', bg: isProtected ? 'bg-cyber-emerald/5' : 'bg-cyber-amber/5', border: isProtected ? 'border-cyber-emerald/20' : 'border-cyber-amber/20' },
              { label: 'Risk Mitigated', value: `-${scoreDrop}`, color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/5', border: 'border-cyber-cyan/20' },
            ].map((m, i) => (
              <div key={i} className={`p-3 rounded-xl ${m.bg} border ${m.border} text-center`}>
                <div className="text-[9px] font-mono text-cyber-muted uppercase tracking-wider mb-1">{m.label}</div>
                <div className={`text-2xl font-mono font-black ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Status Banner */}
          <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
            isProtected
              ? 'bg-cyber-emerald/5 border-cyber-emerald/25'
              : 'bg-cyber-amber/5 border-cyber-amber/25'
          }`}>
            {isProtected
              ? <ShieldCheck className="w-5 h-5 text-cyber-emerald shrink-0" />
              : <AlertOctagon className="w-5 h-5 text-cyber-amber shrink-0" />
            }
            <div>
              <div className={`text-[11px] font-mono font-bold ${isProtected ? 'text-cyber-emerald' : 'text-cyber-amber'}`}>
                {isProtected ? 'Identity Hardened — Low Impersonation Risk' : 'Elevated Risk — Continue Remediation Actions'}
              </div>
              <div className="text-[10px] font-mono text-cyber-muted">
                {completedRemediations.length} of {persona.remediationPlan.length} Ghost Protocol actions completed
              </div>
            </div>
          </div>

          {/* Completed remediations */}
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyber-emerald" />
              Verified Ghost Protocol Actions
            </div>
            {completedRemediations.length === 0 ? (
              <div className="text-[11px] font-mono text-cyber-muted p-3 rounded-lg bg-cyber-surface/30 border border-cyber-border/40 italic">
                No remediation actions applied yet. Complete checklist items to harden identity.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {persona.remediationPlan
                  .filter((r) => completedRemediations.includes(r.id))
                  .map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-cyber-emerald/5 border border-cyber-emerald/20 text-[10px] font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-cyber-emerald shrink-0" />
                        [{r.platform}] {r.action}
                      </span>
                      <span className="text-cyber-emerald font-bold shrink-0">-{r.impactScoreDrop}pts</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-cyber-border/40">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-mono bg-cyber-surface/60 hover:bg-cyber-surface text-slate-300 border border-cyber-border hover:border-cyber-border transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.9), rgba(0, 200, 230, 0.9))',
              color: '#020306',
              boxShadow: '0 0 20px -5px rgba(0, 229, 255, 0.5)',
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
