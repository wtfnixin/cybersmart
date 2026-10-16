import React, { useState, useRef, useCallback } from 'react';
import { ImageScanResult, ImageThreat } from '../types';
import {
  extractExifFromFile,
  analyzeImageVisually,
  analyzeFilename,
  buildImageReport,
} from '../engine/imageAnalyzer';
import {
  X,
  Upload,
  Camera,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Cpu,
  Clock,
  ZoomIn,
  FileImage,
  Crosshair,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Download,
} from 'lucide-react';

interface ImageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Severity config
const SEV: Record<string, { border: string; bg: string; badge: string; label: string; dot: string }> = {
  critical: {
    border: 'border-[#FF3B5C]/35',
    bg: 'bg-[#FF3B5C]/[0.04]',
    badge: 'bg-[#FF3B5C]/10 text-[#FF3B5C] border-[#FF3B5C]/30',
    label: 'CRITICAL',
    dot: 'bg-[#FF3B5C]',
  },
  high: {
    border: 'border-[#FFB800]/35',
    bg: 'bg-[#FFB800]/[0.04]',
    badge: 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30',
    label: 'HIGH',
    dot: 'bg-[#FFB800]',
  },
  medium: {
    border: 'border-[#7B8FFF]/35',
    bg: 'bg-[#7B8FFF]/[0.04]',
    badge: 'bg-[#7B8FFF]/10 text-[#7B8FFF] border-[#7B8FFF]/30',
    label: 'MEDIUM',
    dot: 'bg-[#7B8FFF]',
  },
  low: {
    border: 'border-[#00D68F]/30',
    bg: 'bg-[#00D68F]/[0.03]',
    badge: 'bg-[#00D68F]/10 text-[#00D68F] border-[#00D68F]/25',
    label: 'LOW',
    dot: 'bg-[#00D68F]',
  },
};

// ── Risk level config (score-based colours, not the AI-slop green/red)
const RISK_CONFIG = {
  Critical: { color: '#FF3B5C', bg: 'rgba(255,59,92,0.08)', border: 'rgba(255,59,92,0.3)', label: 'Critical Exposure' },
  High:     { color: '#FFB800', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.3)',  label: 'High Risk'        },
  Moderate: { color: '#7B8FFF', bg: 'rgba(123,143,255,0.08)', border: 'rgba(123,143,255,0.3)', label: 'Moderate Risk' },
  Low:      { color: '#00D68F', bg: 'rgba(0,214,143,0.08)', border: 'rgba(0,214,143,0.3)', label: 'Low Exposure'      },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ── Single threat card
const ThreatCard: React.FC<{ threat: ImageThreat; idx: number }> = ({ threat, idx }) => {
  const [expanded, setExpanded] = useState(idx === 0);
  const s = SEV[threat.severity] ?? SEV.low;

  return (
    <div
      className={`rounded-xl border ${s.border} ${s.bg} transition-all duration-200`}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-base shrink-0">{threat.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-white truncate">{threat.title}</span>
            <span className={`shrink-0 text-[8px] font-mono font-black px-1.5 py-0.5 rounded border ${s.badge}`}>
              {s.label}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{threat.category}</span>
        </div>

        <div className="shrink-0 text-slate-600">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{threat.detail}</p>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#00D68F]/5 border border-[#00D68F]/15">
            <CheckCircle2 className="w-3 h-3 text-[#00D68F] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#00D68F] font-mono leading-relaxed">{threat.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main modal
export const ImageScannerModal: React.FC<ImageScannerModalProps> = ({ isOpen, onClose }) => {
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ImageScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const reset = () => {
    setResult(null);
    setPreviewUrl(null);
    setError(null);
    setScanning(false);
    setProgress(0);
  };

  const runScan = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported (JPEG, PNG, WebP, HEIC).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum 50 MB.');
      return;
    }

    setError(null);
    setScanning(true);
    setProgress(5);
    setProgressLabel('Loading image…');

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    await new Promise((r) => setTimeout(r, 300));
    setProgress(25);
    setProgressLabel('Parsing EXIF binary data…');

    const exif = await extractExifFromFile(file);

    setProgress(55);
    setProgressLabel('Analysing visual properties…');
    const visual = await analyzeImageVisually(file, url);

    setProgress(75);
    setProgressLabel('Extracting filename intelligence…');
    const filenameIntel = analyzeFilename(file.name);

    setProgress(90);
    setProgressLabel('Building threat report…');
    await new Promise((r) => setTimeout(r, 200));

    const report = buildImageReport(file, exif, visual, filenameIntel);

    setProgress(100);
    setProgressLabel('Done.');
    await new Promise((r) => setTimeout(r, 150));

    setResult(report);
    setScanning(false);
  }, []);

  const handleFile = (file: File) => runScan(file);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const riskCfg = result ? RISK_CONFIG[result.threatLevel] : null;

  // ── Export JSON
  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `image-osint-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div
        className="relative w-full max-w-3xl rounded-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: '92vh',
          background: 'linear-gradient(160deg, #07091a 0%, #040610 50%, #060a18 100%)',
          border: '1px solid rgba(123,143,255,0.25)',
          boxShadow: '0 0 80px -15px rgba(123,143,255,0.15), 0 30px 60px rgba(0,0,0,0.85)',
        }}
      >
        {/* Top accent */}
        <div className="h-[2px] shrink-0 bg-gradient-to-r from-transparent via-[#7B8FFF]/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ background: 'rgba(123,143,255,0.1)', border: '1px solid rgba(123,143,255,0.25)' }}
            >
              <Camera className="w-4.5 h-4.5" style={{ color: '#7B8FFF' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white tracking-wide uppercase">
                Photo OSINT Scanner
              </h3>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: '#4A5568' }}>
                EXIF · Visual Analysis · Filename PII · Threat Report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all hover:bg-white/[0.06]"
            style={{ color: '#4A5568' }}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Upload Zone ── */}
          {!result && !scanning && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-14 gap-4"
              style={{
                borderColor: dragging ? '#7B8FFF' : 'rgba(123,143,255,0.2)',
                background: dragging
                  ? 'rgba(123,143,255,0.06)'
                  : 'rgba(123,143,255,0.02)',
              }}
            >
              {/* Subtle grid */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(123,143,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(123,143,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(123,143,255,0.1)',
                  border: '1px solid rgba(123,143,255,0.3)',
                  boxShadow: '0 0 30px -8px rgba(123,143,255,0.4)',
                }}
              >
                <Upload className="w-7 h-7" style={{ color: '#7B8FFF' }} />
              </div>

              <div className="relative text-center space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Drop a photo here, or <span style={{ color: '#7B8FFF' }}>browse</span>
                </p>
                <p className="text-[11px] font-mono" style={{ color: '#4A5568' }}>
                  JPEG · PNG · WebP · HEIC — up to 50 MB
                </p>
              </div>

              <div className="relative flex items-center gap-4 text-[10px] font-mono" style={{ color: '#4A5568' }}>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" style={{ color: '#FF3B5C' }} /> GPS Extraction
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" style={{ color: '#FFB800' }} /> Device Fingerprint
                </span>
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3 h-3" style={{ color: '#7B8FFF' }} /> Visual Intel
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* ── Scanning Progress ── */}
          {scanning && (
            <div className="rounded-2xl p-8 flex flex-col items-center gap-5"
              style={{ background: 'rgba(123,143,255,0.04)', border: '1px solid rgba(123,143,255,0.15)' }}
            >
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl opacity-60" style={{ border: '1px solid rgba(123,143,255,0.2)' }} />
              )}
              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono" style={{ color: '#4A5568' }}>
                  <span>{progressLabel}</span>
                  <span style={{ color: '#7B8FFF' }}>{progress}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(123,143,255,0.12)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7B8FFF, #A78BFF)', boxShadow: '0 0 10px rgba(123,143,255,0.5)' }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-mono" style={{ color: '#4A5568' }}>
                Scanning image for OSINT exposure vectors…
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(255,59,92,0.06)', border: '1px solid rgba(255,59,92,0.2)' }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#FF3B5C' }} />
              <span className="text-[11px] font-mono" style={{ color: '#FF3B5C' }}>{error}</span>
            </div>
          )}

          {/* ── RESULTS ── */}
          {result && riskCfg && (
            <div className="space-y-5">

              {/* Preview + Score strip */}
              <div className="grid grid-cols-[auto_1fr] gap-4">
                {previewUrl && (
                  <div className="relative shrink-0">
                    <img
                      src={previewUrl}
                      alt="Scanned"
                      className="w-28 h-28 object-cover rounded-xl"
                      style={{ border: `1px solid ${riskCfg.border}` }}
                    />
                    <div
                      className="absolute -top-1.5 -right-1.5 text-[8px] font-mono font-black px-1.5 py-0.5 rounded"
                      style={{ background: riskCfg.color, color: '#020306' }}
                    >
                      {result.threatLevel.toUpperCase()}
                    </div>
                  </div>
                )}

                <div className="flex flex-col justify-between">
                  {/* File metadata row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                      <FileImage className="w-3 h-3 inline mr-1" style={{ color: '#7B8FFF' }} />
                      {result.file.name}
                    </span>
                    <span className="badge text-[8px]" style={{ background: 'rgba(123,143,255,0.08)', color: '#7B8FFF', border: '1px solid rgba(123,143,255,0.2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
                      {formatBytes(result.file.size)}
                    </span>
                    <span className="badge text-[8px]" style={{ background: 'rgba(123,143,255,0.08)', color: '#7B8FFF', border: '1px solid rgba(123,143,255,0.2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
                      {result.visual.width}×{result.visual.height}
                    </span>
                    <span className="badge text-[8px]" style={{ background: 'rgba(123,143,255,0.08)', color: '#7B8FFF', border: '1px solid rgba(123,143,255,0.2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
                      {result.visual.megapixels}MP
                    </span>
                  </div>

                  {/* Risk score ring area */}
                  <div>
                    <div className="flex items-end gap-3 mb-1.5">
                      <span className="text-4xl font-mono font-black" style={{ color: riskCfg.color, textShadow: `0 0 20px ${riskCfg.color}60` }}>
                        {result.riskScore}
                      </span>
                      <div className="mb-1">
                        <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Exposure Score / 100</div>
                        <div className="text-[10px] font-mono font-bold" style={{ color: riskCfg.color }}>{riskCfg.label}</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', width: '100%', maxWidth: 240 }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${result.riskScore}%`, background: `linear-gradient(90deg, ${riskCfg.color}aa, ${riskCfg.color})`, boxShadow: `0 0 8px ${riskCfg.color}60` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-[9px] font-mono" style={{ color: '#4A5568' }}>
                    <span>{result.totalFindings} threat{result.totalFindings !== 1 ? 's' : ''} detected</span>
                    <span>·</span>
                    <span>{result.visual.estimatedScene}</span>
                    <span>·</span>
                    <span>{result.visual.colorProfile}</span>
                  </div>
                </div>
              </div>

              {/* EXIF quick-stats grid */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-xl"
                style={{ background: 'rgba(123,143,255,0.03)', border: '1px solid rgba(123,143,255,0.1)' }}
              >
                {[
                  { icon: MapPin, label: 'GPS', value: result.exif.gpsLat ? `${result.exif.gpsLat.toFixed(4)}, ${result.exif.gpsLon?.toFixed(4)}` : 'Not embedded', warn: !!result.exif.gpsLat },
                  { icon: Cpu, label: 'Device', value: [result.exif.make, result.exif.model].filter(Boolean).join(' ') || 'Unknown', warn: !!(result.exif.make || result.exif.model) },
                  { icon: Clock, label: 'Captured', value: result.exif.dateTime ? result.exif.dateTime.split(' ')[0] : 'No timestamp', warn: !!result.exif.dateTime },
                  { icon: ZoomIn, label: 'ISO / f', value: result.exif.iso ? `ISO ${result.exif.iso} · f/${result.exif.fNumber?.toFixed(1) ?? '?'}` : 'Not recorded', warn: false },
                ].map(({ icon: Icon, label, value, warn }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider" style={{ color: '#4A5568' }}>
                      <Icon className="w-3 h-3" style={{ color: warn ? '#FF3B5C' : '#4A5568' }} />
                      {label}
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: warn ? '#FF3B5C' : '#8892A4' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Threat findings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair className="w-3.5 h-3.5" style={{ color: '#FF3B5C' }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
                    Exposure Findings ({result.totalFindings})
                  </span>
                </div>
                {result.threats.length === 0 ? (
                  <div className="p-4 rounded-xl text-[11px] font-mono text-center" style={{ color: '#00D68F', background: 'rgba(0,214,143,0.05)', border: '1px solid rgba(0,214,143,0.15)' }}>
                    <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                    No significant OSINT exposure vectors detected in this image.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result.threats.map((t, i) => (
                      <ThreatCard key={i} threat={t} idx={i} />
                    ))}
                  </div>
                )}
              </div>

              {/* Attack scenario */}
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,59,92,0.04)', border: '1px solid rgba(255,59,92,0.2)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" style={{ color: '#FF3B5C' }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#FF3B5C' }}>
                    Synthesized Attack Scenario
                  </span>
                </div>
                <p className="text-[11px] font-mono leading-relaxed" style={{ color: '#CBD5E1' }}>
                  {result.attackScenario}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-3 border-t border-white/[0.05]">
          {result ? (
            <>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all hover:bg-white/[0.05]"
                style={{ color: '#4A5568', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <RotateCcw className="w-3 h-3" />
                Scan Another
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all"
                  style={{
                    background: 'rgba(123,143,255,0.1)',
                    color: '#7B8FFF',
                    border: '1px solid rgba(123,143,255,0.3)',
                  }}
                >
                  <Download className="w-3 h-3" />
                  Export JSON
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all"
                  style={{
                    background: 'rgba(0,214,143,0.1)',
                    color: '#00D68F',
                    border: '1px solid rgba(0,214,143,0.25)',
                  }}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 ml-auto text-[9px] font-mono" style={{ color: '#4A5568' }}>
              <CheckCircle2 className="w-3 h-3" style={{ color: '#00D68F' }} />
              100% client-side · no uploads · no server
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
