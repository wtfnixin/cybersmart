import React from 'react';
import { Persona } from '../types';
import { UserCheck, Sparkles, Shield, AlertTriangle } from 'lucide-react';

interface PersonaPickerProps {
  personas: Persona[];
  selectedId: string;
  onSelect: (id: string) => void;
  isCustomMode: boolean;
  onToggleCustom: (custom: boolean) => void;
}

const RISK_CONFIG = {
  critical: { label: 'CRITICAL', color: 'text-cyber-crimson', bg: 'bg-cyber-crimson/10', border: 'border-cyber-crimson/30' },
  high: { label: 'HIGH', color: 'text-cyber-amber', bg: 'bg-cyber-amber/10', border: 'border-cyber-amber/30' },
  medium: { label: 'MEDIUM', color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/10', border: 'border-cyber-cyan/30' },
};

const getRisk = (score: number) => {
  if (score >= 70) return RISK_CONFIG.critical;
  if (score >= 40) return RISK_CONFIG.high;
  return RISK_CONFIG.medium;
};

export const PersonaPicker: React.FC<PersonaPickerProps> = ({
  personas,
  selectedId,
  onSelect,
  isCustomMode,
  onToggleCustom,
}) => {
  return (
    <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 lg:px-8 pt-6 pb-2">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <UserCheck className="w-3.5 h-3.5 text-cyber-cyan" />
        <span className="section-label text-cyber-cyan/70">SELECT TARGET PROFILE</span>
        <div className="flex-1 sep" />
        <span className="section-label">{personas.length} DEMO PROFILES LOADED</span>
      </div>

      {/* Cards Row */}
      <div className="flex flex-wrap items-stretch gap-3">
        {personas.map((persona) => {
          const isSelected = !isCustomMode && selectedId === persona.id;
          const risk = getRisk(persona.baselineScore);
          const scoreBarWidth = `${persona.baselineScore}%`;

          return (
            <button
              key={persona.id}
              onClick={() => {
                onToggleCustom(false);
                onSelect(persona.id);
              }}
              className={`relative flex flex-col gap-2 p-3.5 rounded-2xl border transition-all duration-300 text-left group ${
                isSelected
                  ? 'glass-cyan shadow-cyber-cyan scale-[1.02]'
                  : 'glass border-cyber-border/60 hover:border-cyber-border hover:scale-[1.01]'
              }`}
              style={{ minWidth: '200px' }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/60 to-transparent" />
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className={`w-9 h-9 rounded-xl object-cover border-2 transition-all ${
                      isSelected ? 'border-cyber-cyan shadow-cyber-cyan' : 'border-cyber-border group-hover:border-cyber-border'
                    }`}
                  />
                  {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-cyber-cyan rounded-full flex items-center justify-center">
                      <Shield className="w-2 h-2 text-cyber-darkest" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {persona.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyber-muted truncate">{persona.title}</div>
                </div>
              </div>

              {/* Risk Score Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-cyber-muted uppercase tracking-wider">IVI Score</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${risk.bg} ${risk.color} border ${risk.border}`}>
                    {persona.baselineScore} {risk.label}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: scoreBarWidth,
                      background: persona.baselineScore > 70
                        ? 'linear-gradient(90deg, #FF3B5C, #FF6B85)'
                        : persona.baselineScore > 40
                        ? 'linear-gradient(90deg, #FFB800, #FFCC44)'
                        : 'linear-gradient(90deg, #00D68F, #00F2A9)',
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}

        {/* Custom Scanner */}
        <button
          onClick={() => onToggleCustom(true)}
          className={`relative flex flex-col gap-2 p-3.5 rounded-2xl border transition-all duration-300 text-left group ${
            isCustomMode
              ? 'glass-cyan shadow-cyber-cyan scale-[1.02]'
              : 'border-dashed border-cyber-border/50 bg-cyber-surface/20 hover:border-cyber-cyan/30 hover:bg-cyber-surface/40 hover:scale-[1.01]'
          }`}
          style={{ minWidth: '200px' }}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 ${
              isCustomMode ? 'bg-cyber-cyan/15 border-cyber-cyan/40' : 'bg-cyber-surface border-cyber-border border-dashed'
            }`}>
              <Sparkles className={`w-4.5 h-4.5 ${isCustomMode ? 'text-cyber-cyan' : 'text-cyber-muted group-hover:text-cyber-cyan'}`} />
            </div>
            <div>
              <div className={`text-xs font-semibold ${isCustomMode ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                Custom Scanner
              </div>
              <div className="text-[10px] text-cyber-muted">Enter any username</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-cyber-muted uppercase tracking-wider">Mode</span>
              <span className="badge badge-cyan text-[8px]">LIVE SCAN</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill w-full" style={{ background: 'linear-gradient(90deg, #00E5FF, #7FFFFC)', opacity: 0.4 }} />
            </div>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-cyber-amber" />
          </div>
        </button>
      </div>
    </div>
  );
};
