import React, { useState } from 'react';
import { Bot, Workflow, ArrowRight, Bug } from 'lucide-react';

export const AgentSwarmView: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<number>(0);

  const agents = [
    {
      id: 0,
      name: 'Reconnaissance Scraper Agent (Agent-01)',
      role: 'Continuous OSINT Harvest',
      tooling: 'Playwright Headless + GitHub Commit Parser + EXIF Scraper',
      status: 'MONITORING',
      description: 'Crawls social platforms for visual artifacts, travel announcements, conference badges, and developer commit metadata.',
      outputTelemetry: [
        'Scraped LinkedIn badge selfie -> EXIF resolution 4032x3024',
        'Scraped X/Twitter geo-tag -> Denver International Airport (DEN)',
        'Extracted author email from GitHub commit -> elena.rostova.91@gmail.com',
      ],
    },
    {
      id: 1,
      name: 'Graph Correlation Agent (Agent-02)',
      role: 'Identity Entity Resolution',
      tooling: 'FTS5 Memory Vault + Knowledge Graph + Levenshtein Matcher',
      status: 'LINKED',
      description: 'Links seemingly unrelated breadcrumbs into an interconnected adversary knowledge graph with 98% confidence.',
      outputTelemetry: [
        'Correlated pet "Milo" -> High confidence match for bank recovery question #1',
        'Correlated supervisor @sarah_jenkins -> Apex Payments Vice President',
        'Correlated badge barcode -> Decoded to internal Building Access Level 4',
      ],
    },
    {
      id: 2,
      name: 'Vulnerability Synthesizer (Agent-03)',
      role: 'Impersonation Index Scoring',
      tooling: 'Dynamic Risk Engine + Voice Cadence Analyzer',
      status: 'EVALUATING',
      description: 'Calculates the target\'s Impersonation Vulnerability Index (IVI) and evaluates audio sample viability for deepfake cloning.',
      outputTelemetry: [
        'Calculated Baseline IVI: 89 / 100 (Severe Exposure)',
        'Extracted 24 minutes of keynote speech audio -> 94.2% cadence similarity',
        'Security question bypass probability: 96.4%',
      ],
    },
    {
      id: 3,
      name: 'Weaponization Exploit Agent (Agent-04)',
      role: 'Spear-Phishing Payload Assembly',
      tooling: 'Contextual Lure Generator + Display Spoof Engine',
      status: 'ARMED',
      description: 'Constructs the targeted social engineering payload, timing dispatch with the victim\'s flight blackout window.',
      outputTelemetry: [
        'Payload assembled: Urgent Payroll Reroute targeting Finance Team',
        'Bait Hook: Out-of-office flight window prevents out-of-band phone verification',
        'Authority Citation: References VP Sarah Jenkins approval',
      ],
    },
  ];

  const taintSteps = [
    { type: 'SOURCE', label: 'User Public Post', detail: 'Conference selfie with badge + "Off to Vegas!" tweet' },
    { type: 'PROPAGATION', label: 'OCR & Metadata Taint', detail: 'Badge barcode parsed into Employee ID #84920' },
    { type: 'CORRELATION', label: 'Knowledge Graph Taint', detail: 'Links Denver-to-Vegas flight schedule with payroll pay-period' },
    { type: 'SINK', label: 'Exploit Execution Sink', detail: 'Generated Spear-Phishing Email to Payroll Controller' },
  ];

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-4">
      <div className="cyber-panel rounded-2xl p-6 border border-cyber-border space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-cyber-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyber-purple uppercase tracking-wider">
              <Bot className="w-4 h-4 text-purple-400" />
              TOWER 2 (#15) & TOWER 1: ADVERSARY MULTI-AGENT SWARM ORCHESTRATION
            </div>
            <h3 className="text-base font-bold font-mono text-white mt-1">
              Autonomous 4-Tier Reconnaissance Swarm & AST Data Taint Tracking
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-950/80 text-purple-300 border border-purple-500/30">
            4 SWARM AGENTS ACTIVE
          </span>
        </div>

        {/* 4 Agent Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((ag) => (
            <button
              key={ag.id}
              onClick={() => setActiveAgent(ag.id)}
              className={`p-4 rounded-xl text-left border transition-all duration-200 ${
                activeAgent === ag.id
                  ? 'bg-cyber-card border-cyber-cyan shadow-cyber-cyan text-white'
                  : 'bg-cyber-darkest/70 border-cyber-border hover:border-slate-600 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border text-cyber-cyan">
                  {ag.status}
                </span>
                <Workflow className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-xs font-mono font-bold text-white mb-0.5">{ag.name}</div>
              <div className="text-[11px] text-slate-400 mb-2">{ag.role}</div>
              <div className="text-[10px] font-mono text-slate-500 border-t border-cyber-border/70 pt-2">
                Tooling: {ag.tooling}
              </div>
            </button>
          ))}
        </div>

        {/* Active Agent Detail Panel */}
        <div className="p-5 rounded-xl bg-cyber-darkest border border-cyber-border">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider">
              Telemetry Trace: {agents[activeAgent].name}
            </span>
            <span className="text-cyber-cyan font-mono text-[11px]">JSON-RPC 2.0 Transport Active</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mb-3">
            {agents[activeAgent].description}
          </p>
          <div className="space-y-1.5 p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border font-mono text-xs">
            {agents[activeAgent].outputTelemetry.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-cyber-cyan font-bold">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AST Taint Data Flow Pipeline (Tower 2 #12 Strix Analysis) */}
        <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
            <Bug className="w-4 h-4 text-cyber-crimson" />
            STRIX TAINT ANALYSIS: DATA FLOW FROM SOURCE TO ATTACK SINK
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            {taintSteps.map((step, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-cyber-darkest border border-cyber-border flex flex-col justify-between">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    step.type === 'SOURCE'
                      ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                      : step.type === 'SINK'
                      ? 'bg-red-950 text-cyber-crimson border-cyber-crimson/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {step.type}
                  </span>
                  <div className="font-bold text-white mt-2 mb-1">{step.label}</div>
                  <div className="text-[11px] text-slate-400 font-sans">{step.detail}</div>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex justify-end mt-2 text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
