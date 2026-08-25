import type { RiskLevel } from '../types/index.js';

export interface PriorityScoreResult {
  score: number;
  riskLevel: RiskLevel;
  breakdown: {
    severityWeight: number;
    populationWeight: number;
    infrastructureWeight: number;
    urgencyWeight: number;
    hazardFactor: number;
  };
  modelVersion: string;
  calculatedAt: string;
}

export class PriorityEngine {
  public static readonly MODEL_VERSION = 'RAKSHA-PE-v2.4-IND';

  public static calculate(params: {
    severity: number; // 0-100
    affectedPopulation: number;
    infrastructureDamage: number; // 0-100
    urgency: number; // 0-100
    hasHazardOverlay?: boolean;
    weatherSeverityIndex?: number;
  }): PriorityScoreResult {
    const sev = Math.max(0, Math.min(100, params.severity));
    const infra = Math.max(0, Math.min(100, params.infrastructureDamage));
    const urg = Math.max(0, Math.min(100, params.urgency));
    
    // Scale population: 10,000+ affected is high impact in rapid disaster response
    const popScore = Math.min(100, Math.max(10, (params.affectedPopulation / 12500) * 100));

    const severityWeight = +(sev * 0.35).toFixed(2);
    const populationWeight = +(popScore * 0.25).toFixed(2);
    const infrastructureWeight = +(infra * 0.20).toFixed(2);
    const urgencyWeight = +(urg * 0.20).toFixed(2);

    let hazardFactor = 1.0;
    if (params.hasHazardOverlay) hazardFactor += 0.05;
    if (params.weatherSeverityIndex && params.weatherSeverityIndex > 70) hazardFactor += 0.04;

    const baseScore = severityWeight + populationWeight + infrastructureWeight + urgencyWeight;
    const finalScore = Math.min(100, Math.max(1, Math.round(baseScore * hazardFactor)));

    let riskLevel: RiskLevel = 'Safe';
    if (finalScore >= 85) riskLevel = 'Critical';
    else if (finalScore >= 70) riskLevel = 'High';
    else if (finalScore >= 50) riskLevel = 'Medium';

    return {
      score: finalScore,
      riskLevel,
      breakdown: {
        severityWeight,
        populationWeight,
        infrastructureWeight,
        urgencyWeight,
        hazardFactor: +hazardFactor.toFixed(2)
      },
      modelVersion: PriorityEngine.MODEL_VERSION,
      calculatedAt: new Date().toISOString()
    };
  }
}
