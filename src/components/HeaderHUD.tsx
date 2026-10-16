import React, { useState, useEffect } from 'react';
import { ShieldAlert, Download, Activity, Globe, Cpu, Bot, Zap, Terminal, ChevronRight } from 'lucide-react';
import { SupportedLang, I18N_STRINGS } from './i18n';

interface HeaderHUDProps {
  score: number;
  baselineScore: number;
  onOpenAudit: () => void;
  activeHub: 'mirror' | 'globe3d' | 'swarm' | 'crypto';
  onChangeHub: (hub: 'mirror' | 'globe3d' | 'swarm' | 'crypto') => void;
  lang: SupportedLang;
  onChangeLang: (lang: SupportedLang) => void;
}

const TABS = [
  {
    id: 'mirror' as const,
    label: 'Doppelgänger Mirror',
    shortLabel: 'Mirror',
    icon: ShieldAlert,
    color: 'cyan',
    badge: 'OSINT',
  },
  {
    id: 'globe3d' as const,
    label: 'Threat Globe',
    shortLabel: 'Globe',
    icon: Globe,
    color: 'cyan',
    badge: 'Three.js',
  },
  {
    id: 'swarm' as const,
    label: 'Recon Swarm',
    shortLabel: 'Swarm',
    icon: Bot,
    color: 'purple',
    badge: 'AI',
  },
  {
    id: 'crypto' as const,
    label: 'Crypto Lab',
    shortLabel: 'Crypto',
    icon: Cpu,
    color: 'emerald',
    badge: 'WebCrypto',
  },
];

const LANG_FLAGS: Record<SupportedLang, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  hi: '🇮🇳',
  de: '🇩🇪',
};

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  score,
  baselineScore,
  onOpenAudit,
  activeHub,
  onChangeHub,
  lang,
  onChangeLang,
}) => {
  const t = I18N_STRINGS[lang];
  const [time, setTime] = useState(new Date());
  const scoreDrop = baselineScore - score;
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor =
    score > 70 ? '#FF3B5C' : score > 40 ? '#FFB800' : '#00D68F';
  const scoreLabel = score > 70 ? 'CRITICAL' : score > 40 ? 'ELEVATED' : 'SECURED';

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const tabColorClasses: Record<string, string> = {
    cyan: 'text-cyber-cyan border-cyber-cyan/40 bg-cyber-cyan/8 shadow-cyber-cyan',
    purple: 'text-cyber-purple border-cyber-purple/40 bg-cyber-purple/8 shadow-cyber-purple',
    emerald: 'text-cyber-emerald border-cyber-emerald/40 bg-cyber-emerald/8 shadow-cyber-emerald',
  };

  const tabInactiveClass =
    'text-cyber-muted border-transparent bg-transparent hover:text-slate-300 hover:bg-white/[0.03]';

  return (
    <header className="relative z-30 w-full border-b border-cyber-border/60 bg-cyber-darkest/90 backdrop-blur-2xl">
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />

      <div className="max-w-[1440px] mx-auto">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4 px-5 py-3">

          {/* Brand */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyber-cyan/5 border border-cyber-cyan/30 flex items-center justify-center shadow-cyber-cyan">
                <ShieldAlert className="w-4.5 h-4.5 text-cyber-cyan" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 glow-dot" style={{ width: 7, height: 7 }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold font-display tracking-wide text-white uppercase">
                  Doppelgänger AI
                </h1>
                <span className="badge badge-cyan text-[9px]">v2.0</span>
              </div>
              <p className="text-[10px] text-cyber-muted font-mono mt-0.5 hidden sm:block">
                {t.tagline} <span className="text-cyber-border mx-1">·</span>
                <span className="text-cyber-cyan/70">{t.track}</span>
              </p>
            </div>
          </div>

          {/* Breadcrumb / Nav Hint */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-cyber-muted">
            <Terminal className="w-3 h-3" />
            <span>platform</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-300">
              {TABS.find((t) => t.id === activeHub)?.label}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Live clock */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyber-surface/60 border border-cyber-border/60 font-mono text-[10px] text-cyber-muted">
              <Activity className="w-3 h-3 text-cyber-emerald animate-pulse" />
              <span className="text-slate-300">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-0.5 p-1 rounded-lg bg-cyber-surface/60 border border-cyber-border/60">
              {(['en', 'es', 'hi', 'de'] as SupportedLang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onChangeLang(l)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                    lang === l
                      ? 'bg-cyber-cyan text-cyber-darkest'
                      : 'text-cyber-muted hover:text-slate-300'
                  }`}
                  title={`${LANG_FLAGS[l]} ${l.toUpperCase()}`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* IVI Score Ring */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass border border-cyber-border/60">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90 absolute" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(23,34,64,0.8)" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={scoreColor}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.7s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${scoreColor}80)` }}
                  />
                </svg>
                <span className="font-mono font-bold text-xs text-white relative z-10">{score}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-[9px] font-mono uppercase tracking-widest text-cyber-muted mb-0.5">{t.riskTitle}</div>
                <div className="text-[10px] font-mono font-bold" style={{ color: scoreColor }}>
                  {scoreLabel}
                </div>
                {scoreDrop > 0 && (
                  <div className="text-[9px] font-mono text-cyber-emerald">↓ {scoreDrop}pts mitigated</div>
                )}
              </div>
            </div>

            {/* Export */}
            <button
              onClick={onOpenAudit}
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.exportAudit}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pb-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-cyber-surface/40 border border-cyber-border/50">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeHub === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeHub(tab.id)}
                  className={`tab-nav-item ${isActive ? `active ${tabColorClasses[tab.color]}` : tabInactiveClass}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span
                    className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold hidden md:inline ${
                      isActive
                        ? tab.color === 'cyan'
                          ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                          : tab.color === 'purple'
                          ? 'bg-cyber-purple/15 text-cyber-purple border border-cyber-purple/30'
                          : 'bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30'
                        : 'bg-cyber-surface text-cyber-muted border border-cyber-border/50'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status indicators */}
          <div className="ml-auto hidden md:flex items-center gap-3 text-[10px] font-mono text-cyber-muted shrink-0">
            <span className="flex items-center gap-1.5">
              <div className="glow-dot" style={{ width: 6, height: 6 }} />
              OSINT Engine Online
            </span>
            <span className="flex items-center gap-1.5">
              <div className="glow-dot-danger" style={{ width: 6, height: 6 }} />
              Threat Feed Active
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyber-amber" />
              Zero-Trust Mode
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
