import { CustomScanResult } from '../types';

export function analyzeCustomSnippet(text: string): CustomScanResult {
  if (!text || text.trim().length === 0) {
    return {
      extractedEntities: {
        emails: [],
        names: [],
        locations: [],
        dates: [],
        workplaces: [],
        petsOrRelatives: [],
        highRiskKeywords: [],
      },
      calculatedRiskScore: 0,
      threatLevel: 'Low',
      generatedAttackSubject: 'No Threat Detected',
      generatedAttackSnippet: 'Paste a social media post, bio, or public comment above to analyze its exposure.',
    };
  }

  // 1. Email Regex
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const emails = Array.from(new Set(text.match(emailRegex) || []));

  // 2. Dates / Years / Birthdays
  const datePatterns = /(born in \d{4}|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|birthday|turning \d{1,2}|class of \d{4}|anniversary|\b(19\d{2}|20\d{2})\b)/gi;
  const dates = Array.from(new Set(text.match(datePatterns) || []));

  // 3. Location / Travel
  const locationKeywords = /(in [A-Z][a-z]+|at [A-Z][a-z]+|flight to [A-Z][a-z]+|en route to|checked in at|visiting [A-Z][a-z]+|airport|hotel|vacation in [A-Z][a-z]+|Denver|Austin|Singapore|London|Chicago|Paris|Berlin|Tokyo|Vegas|New York)/gi;
  const locations = Array.from(new Set(text.match(locationKeywords) || []));

  // 4. Workplace & Roles
  const workKeywords = /(engineer|architect|developer|manager|director|vp|vice president|founder|ceo|cto|cfo|lead|intern|apex payments|google|microsoft|amazon|meta|apple|startup|fintech|team|workplace|company|office|badge)/gi;
  const workplaces = Array.from(new Set(text.match(workKeywords) || []));

  // 5. Pets, Family, Security Question Anchors
  const petOrFamilyKeywords = /(dog|cat|puppy|pet|milo|charlie|bella|luna|max|son|daughter|mother|father|wife|husband|mom|dad|high school|elementary|hometown)/gi;
  const petsOrRelatives = Array.from(new Set(text.match(petOrFamilyKeywords) || []));

  // 6. High Risk Indicators
  const riskKeywords = /(badge|id #\d+|wire|password|secret|confidential|flight|away for|out of office|unreachable|grant|key|token|escrow)/gi;
  const highRiskKeywords = Array.from(new Set(text.match(riskKeywords) || []));

  // Calculate Impersonation Risk Score (0 - 100)
  let score = 25; // Base exposure for being indexed
  if (emails.length > 0) score += 20;
  if (dates.length > 0) score += 15;
  if (locations.length > 0) score += 15;
  if (workplaces.length > 0) score += 15;
  if (petsOrRelatives.length > 0) score += 20;
  if (highRiskKeywords.length > 0) score += 15;

  score = Math.min(score, 96);

  let threatLevel: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
  if (score >= 80) threatLevel = 'Severe';
  else if (score >= 60) threatLevel = 'High';
  else if (score >= 40) threatLevel = 'Moderate';

  // Generate dynamic contextual attack
  const primaryLocation = locations[0] ? locations[0].replace(/^(in |at |flight to )/i, '') : 'current location';
  const primaryWork = workplaces[0] || 'operations';
  const primaryDate = dates[0] || 'recent announcement';

  const generatedAttackSubject = `URGENT ACTION: Temporary Account Verification regarding ${primaryWork}`;
  const generatedAttackSnippet = `We noticed your recent activity while traveling near ${primaryLocation}. Because of security alerts tied to your ${primaryDate}, an immediate one-time authentication override is required to prevent account lock out.`;

  return {
    extractedEntities: {
      emails,
      names: [],
      locations,
      dates,
      workplaces,
      petsOrRelatives,
      highRiskKeywords,
    },
    calculatedRiskScore: score,
    threatLevel,
    generatedAttackSubject,
    generatedAttackSnippet,
  };
}
