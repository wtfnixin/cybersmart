import React, { useState } from 'react';
import { Persona } from '../types';
import { Mail, Skull, ShieldAlert, AlertTriangle, Mic, ChevronRight, Eye, Zap } from 'lucide-react';

interface AttackSimulatorProps {
  persona: Persona;
}

type AttackTab = 'email' | 'voice';

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({ persona }) => {
  const [activeTab, setActiveTab] = useState<AttackTab>('email');
  const atk = persona.attackVector;

  return (
    <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 lg:px-8 py-4">
      <div className="glass rounded-2xl overflow-hidden border-cyber-crimson/20 border">

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-cyber-crimson/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyber-crimson/10 border border-cyber-crimson/20">
              <Skull className="w-4 h-4 text-cyber-crimson" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-display text-white uppercase tracking-wide">
                  Weaponization Engine
                </h2>
                <span className="badge badge-danger text-[8px]">
                  <Zap className="w-2.5 h-2.5" />
                  LIVE
                </span>
              </div>
              <p className="text-[10px] font-mono text-cyber-muted mt-0.5">
                How adversaries synthesize attacks from your breadcrumbs
              </p>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-cyber-darkest/60 border border-cyber-border/50">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                activeTab === 'email'
                  ? 'bg-cyber-crimson/10 border border-cyber-crimson/30 text-cyber-crimson shadow-cyber-crimson'
                  : 'text-cyber-muted hover:text-slate-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Spear-Phishing
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                activeTab === 'voice'
                  ? 'bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple shadow-cyber-purple'
                  : 'text-cyber-muted hover:text-slate-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Deepfake Analysis
            </button>
          </div>
        </div>

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Simulated Email Client */}
            <div className="lg:col-span-2 rounded-xl overflow-hidden border border-cyber-border/60 bg-cyber-darkest/80">

              {/* Fake macOS Title Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0e1a] border-b border-cyber-border/40">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 ml-2">{atk.targetRole}'s Inbox</span>
                </div>
                <span className="badge badge-danger text-[8px]">
                  <Eye className="w-2.5 h-2.5" />
                  PAYLOAD PREVIEW
                </span>
              </div>

              {/* Email Headers */}
              <div className="px-5 py-3.5 bg-cyber-surface/30 border-b border-cyber-border/30 space-y-1.5 text-[11px] font-mono">
                <div className="flex gap-3">
                  <span className="text-slate-600 w-16 shrink-0">FROM:</span>
                  <span className="text-cyber-crimson font-semibold">{atk.senderSpoof}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-600 w-16 shrink-0">TO:</span>
                  <span className="text-slate-300">{atk.targetRole}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-600 w-16 shrink-0">SUBJECT:</span>
                  <span className="text-white font-bold">{atk.emailSubject}</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="px-5 py-5 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-line min-h-[160px]">
                {atk.emailBody}
              </div>

              {/* Footer Warning */}
              <div className="px-4 py-2.5 bg-cyber-crimson/5 border-t border-cyber-crimson/20 flex items-center justify-between text-[10px] font-mono">
                <span className="text-cyber-crimson">
                  ⚠ Exploits: Flight window + Employee ID + Supervisor name-drop
                </span>
                <span className="font-bold text-cyber-crimson">96% Open Likelihood</span>
              </div>
            </div>

            {/* Why It Works + Context */}
            <div className="space-y-4">
              <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-border/60 p-4">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyber-cyan mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-cyber-amber" />
                  Why This Bypasses Defenses
                </h4>
                <div className="space-y-3">
                  {[
                    { title: 'Real-time Context', body: 'Attack timed during the victim\'s announced flight window — they cannot answer out-of-band calls.' },
                    { title: 'Legitimate Credentials', body: 'References the genuine Employee ID extracted from conference badge selfies.' },
                    { title: 'Authority Bias', body: 'Name-drops their real supervisor to intimidate junior recipients into bypassing protocol.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <ChevronRight className="w-3 h-3 text-cyber-crimson shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">{item.title}: </span>
                        <span className="text-slate-400 font-sans">{item.body}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-amber/20 p-4">
                <div className="text-[9px] font-mono text-cyber-amber uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3" />
                  Adversary Strategy
                </div>
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed">{atk.baitHook}</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice/Deepfake Tab */}
        {activeTab === 'voice' && (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Voice Profile */}
              <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-purple/20 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold font-display text-white">Voice Clone Analysis</h4>
                    <p className="text-[10px] text-cyber-muted font-mono mt-0.5">
                      Scraped from podcasts, conference talks & public video
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono font-black text-cyber-purple" style={{ textShadow: '0 0 20px rgba(157, 78, 221, 0.5)' }}>
                      {persona.voiceCloneFeasibility.score}%
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase">Clone Confidence</div>
                  </div>
                </div>

                <div className="progress-bar mb-4" style={{ height: '6px' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${persona.voiceCloneFeasibility.score}%`,
                      background: 'linear-gradient(90deg, #9D4EDD, #C77DFF)',
                      boxShadow: '0 0 10px rgba(157, 78, 221, 0.6)',
                    }}
                  />
                </div>

                <div className="space-y-2.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between py-2 border-b border-cyber-border/40">
                    <span className="text-slate-400">Cadence Match</span>
                    <span className="text-cyber-purple">{persona.voiceCloneFeasibility.cadenceMatchRate}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-cyber-border/40">
                    <span className="text-slate-400">Audio Available</span>
                    <span className="text-white font-bold">{persona.voiceCloneFeasibility.availableAudioMinutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Min. Required</span>
                    <span className="text-cyber-amber">~3 minutes</span>
                  </div>
                </div>
              </div>

              {/* Harvested Vocabulary */}
              <div className="rounded-xl bg-cyber-darkest/60 border border-cyber-border/60 p-5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-cyber-purple" />
                  Harvested Voice Patterns
                </div>
                <div className="space-y-3">
                  {persona.voiceCloneFeasibility.sampleQuotes.map((quote, i) => (
                    <div key={i} className="p-3 rounded-lg bg-cyber-purple/5 border border-cyber-purple/15">
                      <div className="text-[9px] font-mono text-cyber-muted uppercase tracking-wider mb-1">
                        Sample {i + 1} — Extracted verbatim
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono italic">"{quote}"</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-cyber-crimson/5 border border-cyber-crimson/20 text-[10px] font-mono text-cyber-crimson">
                  ⚠ Sufficient audio harvested for high-fidelity real-time voice clone using ElevenLabs / Tortoise TTS.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
