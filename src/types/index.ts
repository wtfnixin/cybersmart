export interface ExposedBreadcrumb {
  id: string;
  category: 'pii' | 'credential' | 'relationship' | 'location' | 'pattern';
  rawText: string;
  sourcePlatform: 'LinkedIn' | 'Instagram' | 'X/Twitter' | 'GitHub' | 'Public Web';
  extractedFact: string;
  threatImplication: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRedacted?: boolean;
}

export interface SecurityQuestionVulnerability {
  question: string;
  inferredAnswer: string;
  sourceBreadcrumbId: string;
  confidence: number; // 0 - 100
  isMitigated?: boolean;
}

export interface SpearPhishingVector {
  id: string;
  scenarioTitle: string;
  senderSpoof: string;
  targetRole: string;
  emailSubject: string;
  emailBody: string;
  baitHook: string;
  exploitedBreadcrumbs: string[];
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  company: string;
  location: string;
  baselineScore: number; // Baseline Impersonation Vulnerability Index (0-100)
  breadcrumbs: ExposedBreadcrumb[];
  securityQuestions: SecurityQuestionVulnerability[];
  attackVector: SpearPhishingVector;
  voiceCloneFeasibility: {
    score: number; // 0 - 100
    availableAudioMinutes: number;
    cadenceMatchRate: string;
    sampleQuotes: string[];
  };
  remediationPlan: {
    id: string;
    platform: string;
    action: string;
    impactScoreDrop: number;
    completed: boolean;
  }[];
}

export interface ImageThreat {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string;
  recommendation: string;
  icon: string;
}

export interface ImageScanResult {
  file: {
    name: string;
    size: number;
    type: string;
    lastModified: string;
  };
  exif: {
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
  };
  visual: {
    width: number;
    height: number;
    megapixels: string;
    dominantTone: 'bright' | 'dark' | 'mixed';
    hasHighContrast: boolean;
    averageBrightness: number;
    estimatedScene: string;
    colorProfile: string;
  };
  threats: ImageThreat[];
  riskScore: number;
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  attackScenario: string;
  totalFindings: number;
}

export interface CustomScanResult {
  extractedEntities: {
    emails: string[];
    names: string[];
    locations: string[];
    dates: string[];
    workplaces: string[];
    petsOrRelatives: string[];
    highRiskKeywords: string[];
  };
  calculatedRiskScore: number;
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  generatedAttackSubject: string;
  generatedAttackSnippet: string;
}
