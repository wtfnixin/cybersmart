import React from 'react';
import { Persona, ExposedBreadcrumb } from '../types';
import {
  ShieldAlert,
  KeyRound,
  Mic,
  Eye,
  CheckCircle2,
  ExternalLink,
  Crosshair,
  FileWarning,
  Lock,
  TrendingDown,
  Fingerprint,
  AlertOctagon,
} from 'lucide-react';

interface SplitMirrorProps {
  persona: Persona;
  redactedBreadcrumbIds: string[];
}

const PLATFORM_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  LinkedIn: { color: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-500/20' },
  Instagram: { color: 'text-pink-400', bg: 'bg-pink-950/30', border: 'border-pink-500/20' },
  'X/Twitter': { color: 'text-sky-400', bg: 'bg-sky-950/30', border: 'border-sky-500/20' },
  GitHub: { color: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-500/20' },
};

const DEFAULT_PLATFORM = { color: 'text-cyber-cyan', bg: 'bg-cyber-surface/60', border: 'border-cyber-border' };

const SEVERITY_STYLES: Record<string, { badge: string; dot: string }> = {
  critical: {
    badge: 'bg-cyber-crimson/10 text-cyber-crimson border-cyber-crimson/30',
    dot: 'bg-cyber-crimson',
  },
  high: {
    badge: 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30',
    dot: 'bg-cyber-amber',
  },
  medium: {
    badge: 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30',
    dot: 'bg-cyber-cyan',
  },
};

export const SplitMirror: React.FC<SplitMirrorProps> = ({ persona, redactedBreadcrumbIds }) => {
  const activeCount = persona.breadcrumbs.filter((bc) => !redactedBreadcrumbIds.includes(bc.id)).length;
  const exposurePercent = Math.round((activeCount / persona.breadcrumbs.length) * 100);

  return (
    <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 lg:px-8 py-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyber-crimson/10 border border-cyber-crimson/20">
            <Crosshair className="w-4 h-4 text-cyber-crimson" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display text-white tracking-wide uppercase">
              The Split Mirror
            </h2>
            <p className="text-[10px] text-cyber-muted font-mono">Public footprint vs. adversary reconstruction</p>
          </div>
        </div>
        <div className="flex-1 sep" />
        <div className="flex items-center gap-2">
          <span className="badge badge-danger">
            <AlertOctagon className="w-2.5 h-2.5" />
            {activeCount} Active Vectors
          </span>
          <span className="badge badge-cyan">{exposurePercent}% Exposure</span>
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* LEFT: PUBLIC FOOTPRINT */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyber-border/60">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold font-display text-slate-200 uppercase tracking-wider">
                Your Public Footprint
              </span>
            </div>
            <span className="badge badge-cyan">{persona.breadcrumbs.length} posts analyzed</span>
          </div>

          {/* Breadcrumb List */}
          <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
            {persona.breadcrumbs.map((bc: ExposedBreadcrumb) => {
              const isRedacted = redactedBreadcrumbIds.includes(bc.id);
              const platform = PLATFORM_STYLES[bc.sourcePlatform] || DEFAULT_PLATFORM;
              const severity = SEVERITY_STYLES[bc.severity] || SEVERITY_STYLES.medium;

              return (
                <div
                  key={bc.id}
                  className={`rounded-xl border transition-all duration-500 overflow-hidden ${
                    isRedacted
                      ? 'bg-cyber-emerald/5 border-cyber-emerald/20 opacity-60'
                      : `${platform.bg} ${platform.border}`
                  }`}
                >
                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRedacted ? 'bg-cyber-emerald' : severity.dot}`} />
                        <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${platform.color}`}>
                          <ExternalLink className="w-2.5 h-2.5" />
                          {bc.sourcePlatform}
                        </span>
                      </div>
                      {isRedacted ? (
                        <span className="badge badge-emerald text-[8px]">
                          <Lock className="w-2.5 h-2.5" />
                          SECURED
                        </span>
                      ) : (
                        <span className={`badge text-[8px] ${severity.badge}`}>
                          {bc.severity.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed font-sans ${
                      isRedacted ? 'line-through text-slate-600' : 'text-slate-200'
                    }`}>
                      "{bc.rawText}"
                    </p>

                    {!isRedacted && (
                      <div className="mt-2.5 pt-2 border-t border-cyber-border/40 flex items-start gap-1.5 text-[10px] font-mono text-cyber-amber/80">
                        <FileWarning className="w-3 h-3 text-cyber-amber shrink-0 mt-0.5" />
                        <span>{bc.threatImplication}</span>
                      </div>
                    )}

                    {isRedacted && (
                      <div className="mt-2 text-[10px] font-mono text-cyber-emerald flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Neutralized by Ghost Protocol
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: ADVERSARY DOSSIER */}
        <div className="glass-danger rounded-2xl overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyber-crimson/20">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyber-crimson animate-pulse" />
              <span className="text-xs font-bold font-display text-cyber-crimson uppercase tracking-wider">
                Adversary Dossier
              </span>
            </div>
            <span className="badge badge-danger">SYNTHESIZED CLONE</span>
          </div>

          <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto">
            {/* Dossier Identity Card */}
            <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-border/60 p-4">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="relative">
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-cyber-crimson/60"
                    style={{ boxShadow: '0 0 20px -5px rgba(255, 59, 92, 0.5)' }}
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyber-crimson flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold font-display text-white">{persona.name}</h4>
                    <span className="badge badge-danger text-[8px]">EXPOSED</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">{persona.title} · {persona.company}</p>
                  <p className="text-[10px] text-cyber-muted font-mono mt-0.5">📍 {persona.location}</p>
                </div>
              </div>

              {/* Exposure Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-cyber-muted uppercase tracking-wider">Clone Confidence</span>
                  <span className="text-cyber-crimson font-bold">{exposurePercent}% Reconstructed</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill transition-all duration-700"
                    style={{
                      width: `${exposurePercent}%`,
                      background: 'linear-gradient(90deg, #FF3B5C, #FF6B85)',
                      boxShadow: '0 0 10px rgba(255, 59, 92, 0.5)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Extracted Intelligence */}
            <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-border/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Fingerprint className="w-3.5 h-3.5 text-cyber-crimson" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
                  Extracted Intelligence Vectors
                </span>
              </div>
              <div className="space-y-2">
                {persona.breadcrumbs.map((bc) => {
                  const isRedacted = redactedBreadcrumbIds.includes(bc.id);
                  return (
                    <div
                      key={bc.id}
                      className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border text-[11px] font-mono transition-all ${
                        isRedacted
                          ? 'bg-cyber-surface/20 border-cyber-border/30 text-slate-600 line-through'
                          : 'bg-cyber-crimson/5 border-cyber-crimson/15 text-slate-300'
                      }`}
                    >
                      <span className={`font-bold mt-0.5 shrink-0 ${isRedacted ? 'text-slate-700' : 'text-cyber-crimson'}`}>›</span>
                      <span>{bc.extractedFact}</span>
                      {isRedacted && (
                        <Lock className="w-3 h-3 text-cyber-emerald ml-auto shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Questions */}
            <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-border/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-3.5 h-3.5 text-cyber-amber" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyber-amber">
                  Compromised Security Q&A ({persona.securityQuestions.length})
                </span>
              </div>
              <div className="space-y-2">
                {persona.securityQuestions.map((sq, i) => {
                  const isMitigated = redactedBreadcrumbIds.includes(sq.sourceBreadcrumbId);
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border transition-all ${
                        isMitigated
                          ? 'bg-cyber-surface/20 border-cyber-border/30'
                          : 'bg-cyber-amber/5 border-cyber-amber/25'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-400 mb-1">{sq.question}</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold">
                          A: <span className={isMitigated ? 'line-through text-slate-600' : 'text-cyber-amber'}>
                            {sq.inferredAnswer}
                          </span>
                        </span>
                        <span className={`badge text-[8px] ${isMitigated ? 'badge-emerald' : 'badge-amber'}`}>
                          {isMitigated ? '🔒 Shielded' : `${sq.confidence}% conf`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voice Clone */}
            <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-purple/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20">
                    <Mic className="w-4 h-4 text-cyber-purple" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-semibold text-white">Voice Cloning Feasibility</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{persona.voiceCloneFeasibility.cadenceMatchRate}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-mono font-bold text-cyber-purple">
                    {persona.voiceCloneFeasibility.score}%
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />
                    {persona.voiceCloneFeasibility.availableAudioMinutes}m audio
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
