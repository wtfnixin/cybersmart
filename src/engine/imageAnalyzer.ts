import { ImageScanResult } from '../types';

// ────────────────────────────────────────────────────────────────────
// EXIF / Metadata Extraction via raw binary parsing (no library needed)
// ────────────────────────────────────────────────────────────────────

interface ExifData {
  gpsLat?: number;
  gpsLon?: number;
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  orientation?: number;
  flash?: string;
  exposureTime?: string;
  iso?: number;
  fNumber?: number;
}

function readUint16(view: DataView, offset: number, littleEndian: boolean): number {
  return view.getUint16(offset, littleEndian);
}

function readUint32(view: DataView, offset: number, littleEndian: boolean): number {
  return view.getUint32(offset, littleEndian);
}

function readAscii(view: DataView, offset: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    const byte = view.getUint8(offset + i);
    if (byte === 0) break;
    str += String.fromCharCode(byte);
  }
  return str.trim();
}

function parseRational(view: DataView, offset: number, littleEndian: boolean): number {
  const num = readUint32(view, offset, littleEndian);
  const den = readUint32(view, offset + 4, littleEndian);
  return den !== 0 ? num / den : 0;
}

function gpsToDecimal(view: DataView, offset: number, littleEndian: boolean): number {
  const deg = parseRational(view, offset, littleEndian);
  const min = parseRational(view, offset + 8, littleEndian);
  const sec = parseRational(view, offset + 16, littleEndian);
  return deg + min / 60 + sec / 3600;
}

export async function extractExifFromFile(file: File): Promise<ExifData> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const data = new DataView(buffer);
        const exif: ExifData = {};

        // Check for JPEG SOI marker
        if (data.getUint16(0) !== 0xFFD8) {
          resolve(exif);
          return;
        }

        let offset = 2;
        while (offset < data.byteLength - 1) {
          const marker = data.getUint16(offset);
          if (marker === 0xFFE1) {
            // APP1 - EXIF
            const exifOffset = offset + 4;
            const header = readAscii(data, exifOffset, 4);
            if (header === 'Exif') {
              const tiffStart = exifOffset + 6;
              const littleEndian = data.getUint16(tiffStart) === 0x4949;

              const ifdOffset = tiffStart + readUint32(data, tiffStart + 4, littleEndian);
              const numEntries = readUint16(data, ifdOffset, littleEndian);

              let gpsIFDOffset: number | null = null;

              for (let i = 0; i < numEntries; i++) {
                const entryOffset = ifdOffset + 2 + i * 12;
                const tag = readUint16(data, entryOffset, littleEndian);
                const type = readUint16(data, entryOffset + 2, littleEndian);
                const count = readUint32(data, entryOffset + 4, littleEndian);
                const valueOffset = entryOffset + 8;

                const getValueAsUint32 = () => readUint32(data, valueOffset, littleEndian);
                const getAscii = () => {
                  const dataOffset = count <= 4 ? valueOffset : tiffStart + getValueAsUint32();
                  return readAscii(data, dataOffset, count);
                };

                switch (tag) {
                  case 0x010F: exif.make = getAscii(); break;
                  case 0x0110: exif.model = getAscii(); break;
                  case 0x0131: exif.software = getAscii(); break;
                  case 0x0132: exif.dateTime = getAscii(); break;
                  case 0x0112: exif.orientation = type === 3 ? readUint16(data, valueOffset, littleEndian) : data.getUint8(valueOffset); break;
                  case 0x8825: gpsIFDOffset = tiffStart + getValueAsUint32(); break;
                  case 0x829A: {
                    const rOff = tiffStart + getValueAsUint32();
                    const n = readUint32(data, rOff, littleEndian);
                    const d = readUint32(data, rOff + 4, littleEndian);
                    exif.exposureTime = d !== 0 ? `1/${Math.round(d / n)}s` : '?';
                    break;
                  }
                  case 0x829D: {
                    const rOff = tiffStart + getValueAsUint32();
                    exif.fNumber = parseRational(data, rOff, littleEndian);
                    break;
                  }
                  case 0x8827: exif.iso = type === 3 ? readUint16(data, valueOffset, littleEndian) : readUint32(data, valueOffset, littleEndian); break;
                  case 0x9209: {
                    const v = readUint16(data, valueOffset, littleEndian);
                    exif.flash = v & 0x1 ? 'Fired' : 'Did not fire';
                    break;
                  }
                }
              }

              // Parse GPS IFD
              if (gpsIFDOffset !== null) {
                const gpsNumEntries = readUint16(data, gpsIFDOffset, littleEndian);
                let latRef = 'N', lonRef = 'E';
                let lat: number | undefined, lon: number | undefined;

                for (let i = 0; i < gpsNumEntries; i++) {
                  const entryOffset = gpsIFDOffset + 2 + i * 12;
                  const tag = readUint16(data, entryOffset, littleEndian);
                  const valueOffset = entryOffset + 8;
                  const getValueAsUint32 = () => readUint32(data, valueOffset, littleEndian);

                  switch (tag) {
                    case 0x0001: latRef = String.fromCharCode(data.getUint8(valueOffset)); break;
                    case 0x0003: lonRef = String.fromCharCode(data.getUint8(valueOffset)); break;
                    case 0x0002: lat = gpsToDecimal(data, tiffStart + getValueAsUint32(), littleEndian); break;
                    case 0x0004: lon = gpsToDecimal(data, tiffStart + getValueAsUint32(), littleEndian); break;
                  }
                }

                if (lat !== undefined) exif.gpsLat = latRef === 'S' ? -lat : lat;
                if (lon !== undefined) exif.gpsLon = lonRef === 'W' ? -lon : lon;
              }
            }
            break;
          }

          if (offset + 2 >= data.byteLength) break;
          const segmentLength = data.getUint16(offset + 2);
          offset += 2 + segmentLength;
        }

        resolve(exif);
      } catch {
        resolve({});
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ────────────────────────────────────────────────────────────────────
// VISUAL ANALYSIS — Analyze image dimensions, color entropy, faces, text clues
// ────────────────────────────────────────────────────────────────────

interface VisualAnalysis {
  width: number;
  height: number;
  megapixels: string;
  dominantTone: 'bright' | 'dark' | 'mixed';
  hasHighContrast: boolean;
  averageBrightness: number;
  estimatedScene: string;
  colorProfile: string;
}

export async function analyzeImageVisually(
  _file: File,
  imageUrl: string
): Promise<VisualAnalysis> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 80;
      const scale = Math.min(MAX / img.width, MAX / img.height);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let rSum = 0, gSum = 0, bSum = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }

      const avgR = rSum / pixelCount;
      const avgG = gSum / pixelCount;
      const avgB = bSum / pixelCount;
      const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114);

      const dominantTone = brightness > 160 ? 'bright' : brightness < 85 ? 'dark' : 'mixed';
      const megapixels = ((img.width * img.height) / 1_000_000).toFixed(1);
      const hasHighContrast = Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB) > 80;

      // Estimate scene from image characteristics
      const aspect = img.width / img.height;
      let estimatedScene = 'General / Unknown';
      if (aspect > 1.6) estimatedScene = 'Landscape / Wide Shot';
      else if (aspect < 0.7) estimatedScene = 'Portrait / Selfie (mobile)';
      else if (dominantTone === 'bright' && aspect > 0.9 && aspect < 1.1) estimatedScene = 'Indoor / Office / ID Photo';
      else if (dominantTone === 'dark') estimatedScene = 'Night Scene / Event';
      else estimatedScene = 'Social / Group / Candid';

      const colorProfile = avgG > avgR && avgG > avgB ? 'Cool/Natural (outdoor likely)'
        : avgR > avgG && avgR > avgB ? 'Warm (indoor/artificial light)'
        : 'Neutral Balanced';

      resolve({
        width: img.width,
        height: img.height,
        megapixels,
        dominantTone,
        hasHighContrast,
        averageBrightness: Math.round(brightness),
        estimatedScene,
        colorProfile,
      });
    };
    img.src = imageUrl;
  });
}

// ────────────────────────────────────────────────────────────────────
// FILENAME ANALYSIS — Extract PII from filename patterns
// ────────────────────────────────────────────────────────────────────

interface FilenameIntel {
  findings: string[];
  riskScore: number;
}

export function analyzeFilename(filename: string): FilenameIntel {
  const findings: string[] = [];
  let risk = 0;
  const lower = filename.toLowerCase();

  // Date patterns in filename
  const dateMatch = filename.match(/(\d{4}[-_]\d{2}[-_]\d{2}|\d{8}|\d{2}[-_]\d{2}[-_]\d{4})/);
  if (dateMatch) {
    findings.push(`Photo timestamp encoded in filename: "${dateMatch[0]}" — reveals creation date`);
    risk += 12;
  }

  // WhatsApp format: IMG-YYYYMMDD-WA####
  if (/img-\d{8}-wa/i.test(lower)) {
    findings.push('WhatsApp media filename detected — sender metadata may be preserved in chat history');
    risk += 18;
  }

  // Screenshot patterns
  if (lower.includes('screenshot') || lower.includes('screen shot') || lower.includes('capture')) {
    findings.push('Screenshot filename — may contain screen layout, app UI, or notification data');
    risk += 15;
  }

  // DCIM / camera roll sequential naming
  if (/^(img|dsc|photo|pic|dscf|dcim|p\d{4}|dji)/i.test(filename)) {
    findings.push('Sequential camera naming (DCIM format) — adjacent filenames reveal nearby photos in time');
    risk += 10;
  }

  // Device naming (Samsung, Apple, etc.)
  if (/^(samsung|apple|iphone|pixel|oneplus|xiaomi|huawei)/i.test(lower)) {
    findings.push(`Device manufacturer in filename: reveals hardware type (social engineering vector)`);
    risk += 14;
  }

  // Name-like patterns
  const nameMatch = filename.match(/([A-Z][a-z]{2,}\s[A-Z][a-z]{2,})/);
  if (nameMatch) {
    findings.push(`Possible full name embedded in filename: "${nameMatch[0]}"`);
    risk += 25;
  }

  // Location-like words
  const locationWords = ['london', 'paris', 'dubai', 'nyc', 'chicago', 'berlin', 'tokyo', 'sydney', 'mumbai', 'delhi'];
  for (const city of locationWords) {
    if (lower.includes(city)) {
      findings.push(`Location string "${city}" found in filename — geolocation inference possible`);
      risk += 20;
      break;
    }
  }

  // Event keywords
  const eventWords = ['wedding', 'birthday', 'graduation', 'conference', 'meetup', 'office', 'work', 'team', 'badge'];
  for (const ev of eventWords) {
    if (lower.includes(ev)) {
      findings.push(`Event keyword "${ev}" in filename — social engineering context available`);
      risk += 16;
      break;
    }
  }

  if (findings.length === 0) {
    findings.push('No high-risk PII patterns detected in filename');
  }

  return { findings, riskScore: Math.min(risk, 40) };
}

// ────────────────────────────────────────────────────────────────────
// MAIN COMPOSITE SCORER
// ────────────────────────────────────────────────────────────────────

export function buildImageReport(
  file: File,
  exif: ExifData,
  visual: VisualAnalysis,
  filenameIntel: FilenameIntel
): ImageScanResult {
  const threats: ImageScanResult['threats'] = [];
  let totalRisk = 20; // base exposure: any public image has baseline risk

  // ── GPS / Geolocation
  if (exif.gpsLat !== undefined && exif.gpsLon !== undefined) {
    const lat = exif.gpsLat.toFixed(5);
    const lon = exif.gpsLon.toFixed(5);
    threats.push({
      category: 'Geolocation',
      severity: 'critical',
      title: 'Precise GPS Coordinates Embedded',
      detail: `Latitude ${lat}°, Longitude ${lon}° stored in EXIF. Google Maps-linkable within ~10m accuracy.`,
      recommendation: 'Strip EXIF metadata before sharing. Use iOS Settings → Privacy → Photos → Remove Location, or Android Gallery metadata tools.',
      icon: '📍',
    });
    totalRisk += 35;
  }

  // ── Device Fingerprint
  if (exif.make || exif.model) {
    const device = [exif.make, exif.model].filter(Boolean).join(' ');
    threats.push({
      category: 'Device Fingerprint',
      severity: 'high',
      title: 'Device Make & Model Exposed',
      detail: `Photo taken with "${device}". Device type informs spear-phishing lures (e.g., fake AppleCare, Samsung security alerts).`,
      recommendation: 'Use a metadata stripper (e.g., ExifTool, Scrambled EXIF app) before posting to social media.',
      icon: '📱',
    });
    totalRisk += 15;
  }

  // ── Timestamp / datetime
  if (exif.dateTime) {
    threats.push({
      category: 'Temporal Data',
      severity: 'medium',
      title: 'Photo Timestamp Recorded',
      detail: `Image created at: ${exif.dateTime}. Combined with GPS, this creates a timestamped location record — your movements can be reconstructed.`,
      recommendation: 'Enable "Remove metadata" when sharing via iMessage, Signal, or email clients. Avoid posting photos in real time.',
      icon: '🕐',
    });
    totalRisk += 10;
  }

  // ── Software / App used
  if (exif.software) {
    threats.push({
      category: 'Software Signature',
      severity: 'low',
      title: 'Processing Software Identified',
      detail: `Photo was processed with "${exif.software}". This can reveal OS version, photo editing workflows, or organizational tools.`,
      recommendation: 'Minor risk; strip EXIF if sharing externally. Avoid revealing internal tool stacks.',
      icon: '💻',
    });
    totalRisk += 5;
  }

  // ── High-resolution / megapixels
  const mpNum = parseFloat(visual.megapixels);
  if (mpNum >= 8) {
    threats.push({
      category: 'Resolution Risk',
      severity: 'high',
      title: 'High-Resolution Image — Detail Extraction Possible',
      detail: `Image is ${visual.megapixels}MP (${visual.width}×${visual.height}px). At this resolution, background details, ID badges, screens, whiteboards, and license plates are recoverable via upscaling.`,
      recommendation: 'Downscale to ≤2MP for social sharing. Blur or crop backgrounds before posting.',
      icon: '🔍',
    });
    totalRisk += 18;
  } else if (mpNum >= 3) {
    threats.push({
      category: 'Resolution Risk',
      severity: 'medium',
      title: 'Moderate Resolution — Background Analysis Feasible',
      detail: `${visual.megapixels}MP image (${visual.width}×${visual.height}px). Background elements may be enhanced enough to extract contextual location or office data.`,
      recommendation: 'Review background before posting. Blur identifiable objects.',
      icon: '🔍',
    });
    totalRisk += 8;
  }

  // ── Scene analysis
  if (visual.estimatedScene.includes('Office') || visual.estimatedScene.includes('ID')) {
    threats.push({
      category: 'Scene Context',
      severity: 'high',
      title: 'Office / ID Photo — Workplace Intel Leakage',
      detail: `Image appears to be taken indoors (brightness: ${visual.averageBrightness}/255, aspect ratio suggests headshot or ID format). Workplace environment, badge holders, desk layouts, or monitor content may be visible.`,
      recommendation: 'Never post photos of ID cards, badge lanyards, or office floors. Crop before sharing professional headshots.',
      icon: '🏢',
    });
    totalRisk += 20;
  }

  if (visual.estimatedScene.includes('Portrait') || visual.estimatedScene.includes('Selfie')) {
    threats.push({
      category: 'Biometric Risk',
      severity: 'medium',
      title: 'Portrait / Selfie — Facial Biometric Available',
      detail: `Aspect ratio and brightness suggest a selfie or portrait (${visual.width}×${visual.height}px). High-resolution faces enable DeepFake generation with <3 photos. Facial recognition APIs return identity matches in seconds.`,
      recommendation: 'Limit sharing high-quality selfies publicly. Use privacy settings to restrict audience. Enable face recognition opt-outs on FB/Instagram.',
      icon: '🧑',
    });
    totalRisk += 15;
  }

  // ── Filename intelligence
  for (const finding of filenameIntel.findings) {
    if (!finding.startsWith('No high-risk')) {
      threats.push({
        category: 'Filename Metadata',
        severity: filenameIntel.riskScore > 20 ? 'high' : 'medium',
        title: 'PII Detected in Filename',
        detail: finding,
        recommendation: 'Rename files to random strings before sharing. Never use names, dates, or locations in image filenames.',
        icon: '📄',
      });
    }
  }

  totalRisk += filenameIntel.riskScore;
  totalRisk = Math.min(totalRisk, 97);

  const threatLevel: ImageScanResult['threatLevel'] =
    totalRisk >= 80 ? 'Critical'
    : totalRisk >= 60 ? 'High'
    : totalRisk >= 35 ? 'Moderate'
    : 'Low';

  // ── Attack scenario
  const hasGps = exif.gpsLat !== undefined;
  const hasDevice = !!(exif.make || exif.model);
  const hasDate = !!exif.dateTime;
  const hasHighRes = mpNum >= 8;

  let attackScenario = '';
  if (hasGps && hasDevice) {
    attackScenario = `Attacker downloads this image from your social profile. EXIF parser extracts GPS coordinates (${exif.gpsLat?.toFixed(4)}, ${exif.gpsLon?.toFixed(4)}), timestamps, and device info. This data is used to spear-phish you with fake ${exif.make || 'device'} security alerts referencing your "recent activity" at that precise location on ${exif.dateTime?.split(' ')[0] ?? 'that date'}.`;
  } else if (hasHighRes) {
    attackScenario = `AI upscaling of this ${visual.megapixels}MP image recovers background details: monitor content, badge numbers, whiteboard text, or building signage. This intelligence is then used to craft a hyper-personalized BEC (Business Email Compromise) attack.`;
  } else if (hasDate) {
    attackScenario = `Timestamp ${exif.dateTime} combined with your social media post cadence allows an attacker to build a behavioral timeline — knowing when you're online, asleep, or traveling, enabling perfectly-timed social engineering.`;
  } else {
    attackScenario = `Even without EXIF data, this ${visual.estimatedScene.toLowerCase()} photo reveals contextual clues about your environment, lifestyle, and routines. Aggregated with other public images, attackers build a rich behavioral profile used for identity impersonation.`;
  }

  return {
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
    },
    exif,
    visual,
    threats,
    riskScore: totalRisk,
    threatLevel,
    attackScenario,
    totalFindings: threats.length,
  };
}
