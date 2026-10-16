import React, { useState } from 'react';
import { analyzeCustomSnippet } from '../engine/analyzer';
import { CustomScanResult } from '../types';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

interface CustomScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomScannerModal: React.FC<CustomScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState<string>(
    'Excited to start as Senior Cloud Engineer at FinTech Global! Just got my badge (#94812). Heading to London next week for onboarding, my dog Buster is going to miss me!'
  );
  const [result, setResult] = useState<CustomScanResult>(() =>
    analyzeCustomSnippet(
      'Excited to start as Senior Cloud Engineer at FinTech Global! Just got my badge (#94812). Heading to London next week for onboarding, my dog Buster is going to miss me!'
    )
  );

  const handleAnalyze = (textToAnalyze: string) => {
    setInput(textToAnalyze);
    setResult(analyzeCustomSnippet(textToAnalyze));
  };

  const samplePresets = [
    {
      label: 'Badge & Pet Leak',
      text: 'Excited to start as Senior Cloud Engineer at FinTech Global! Just got my badge (#94812). Heading to London next week for onboarding, my dog Buster is going to miss me!',
    },
    {
      label: 'Travel Blackout Window',
      text: 'Flight boarding for Tokyo! Off the grid for 14 hours. Please contact our VP Dave for emergency approvals. Can not wait for vacation!',
    },
    {
      label: 'Birthday & Secret Question',
      text: 'Turning 25 today! Celebrating in Chicago with my high school friends from Lincoln High. Reach me at alex.smith99@gmail.com!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl cyber-panel-glow rounded-2xl p-6 border border-cyber-cyan/40 bg-cyber-darkest shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-cyber-border">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyber-cyan" />
            <div>
              <h3 className="text-base font-bold font-mono text-white">
                LIVE RECONNAISSANCE SCANNER
              </h3>
              <p className="text-xs text-slate-400">
                Paste any social media post, bio, or text snippet to extract exposed Doppelgänger vectors.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Sample Buttons */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Test with Presets:</span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAnalyze(preset.text)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 text-slate-300 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Input Textarea */}
        <div className="mb-4">
          <textarea
            value={input}
            onChange={(e) => handleAnalyze(e.target.value)}
            rows={4}
            placeholder="Paste raw social media post, bio, or text here..."
            className="w-full p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-border focus:border-cyber-cyan text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Real-time Extracted Intelligence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          <div className="p-3.5 rounded-xl bg-cyber-card border border-cyber-border text-center flex flex-col justify-center items-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Impersonation Risk
            </div>
            <div className={`text-3xl font-mono font-bold ${
              result.calculatedRiskScore > 70 ? 'text-cyber-crimson' : 'text-cyber-amber'
            }`}>
              {result.calculatedRiskScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
            <div className="text-[11px] font-mono mt-1 text-slate-300">
              Level: <strong className={result.calculatedRiskScore > 70 ? 'text-cyber-crimson' : 'text-cyber-amber'}>{result.threatLevel}</strong>
            </div>
          </div>

          <div className="md:col-span-2 p-3.5 rounded-xl bg-cyber-card border border-cyber-border">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyber-cyan mb-2">
              Harvested PII Entities:
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {result.extractedEntities.emails.map((e, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300">
                  📧 {e}
                </span>
              ))}
              {result.extractedEntities.locations.map((l, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  📍 {l}
                </span>
              ))}
              {result.extractedEntities.petsOrRelatives.map((p, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
                  🐾 Security Anchor: {p}
                </span>
              ))}
              {result.extractedEntities.workplaces.map((w, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  💼 Role: {w}
                </span>
              ))}
              {result.extractedEntities.highRiskKeywords.map((k, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-cyber-crimson">
                  ⚠️ Danger: {k}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic Attack Preview */}
        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-crimson/30">
          <div className="text-xs font-mono font-bold text-cyber-crimson flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Synthesized Attack Vector:
          </div>
          <div className="text-xs font-mono text-white font-semibold mb-1">
            Subject: {result.generatedAttackSubject}
          </div>
          <p className="text-xs font-mono text-slate-300 leading-relaxed bg-cyber-darkest p-3 rounded-lg border border-cyber-border">
            {result.generatedAttackSnippet}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-cyber-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono bg-cyber-surface hover:bg-cyber-card text-slate-300 border border-cyber-border transition-all"
          >
            Close Scanner
          </button>
        </div>

      </div>
    </div>
  );
};
