import { describe, it, expect } from 'vitest';
import { analyzeCustomSnippet } from './analyzer';

describe('Tower 9 / Engine: Heuristic PII Analyzer & Risk Scorer', () => {
  it('should extract email and calculate elevated risk score', () => {
    const text = 'Reach me at elena.rostova@apex-payments-corp.com for urgent inquiries.';
    const result = analyzeCustomSnippet(text);

    expect(result.extractedEntities.emails).toContain('elena.rostova@apex-payments-corp.com');
    expect(result.calculatedRiskScore).toBeGreaterThanOrEqual(40);
  });

  it('should detect location and flight keywords', () => {
    const text = 'Flight to Las Vegas leaving Denver airport this evening!';
    const result = analyzeCustomSnippet(text);

    expect(result.extractedEntities.locations.length).toBeGreaterThan(0);
    expect(result.threatLevel).not.toBe('Low');
  });

  it('should identify security question anchors like pet names', () => {
    const text = 'Happy birthday to my dog Milo, turning 5 today!';
    const result = analyzeCustomSnippet(text);

    expect(result.extractedEntities.petsOrRelatives).toContain('dog');
    expect(result.extractedEntities.dates.length).toBeGreaterThan(0);
  });

  it('should generate a contextual spear-phishing attack payload', () => {
    const text = 'Starting as Cloud Architect at Apex Payments in Denver!';
    const result = analyzeCustomSnippet(text);

    expect(result.generatedAttackSubject).toContain('URGENT ACTION');
    expect(result.generatedAttackSnippet).toBeDefined();
    expect(result.calculatedRiskScore).toBeGreaterThanOrEqual(50);
  });
});
