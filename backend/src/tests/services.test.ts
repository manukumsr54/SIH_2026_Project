import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PriorityEngine } from '../services/PriorityEngine.js';
import { SafeRouteService } from '../services/SafeRouteService.js';
import { DamageAssessmentService } from '../services/DamageAssessmentService.js';
import type { Disaster, SafeLocation } from '../types/index.js';

describe('RAKSHA Core Services Verification', () => {
  it('PriorityEngine should correctly calculate weighted risk score and breakdown', () => {
    const result = PriorityEngine.calculate({
      severity: 95,
      affectedPopulation: 12400,
      infrastructureDamage: 90,
      urgency: 100,
      hasHazardOverlay: true
    });

    assert.strictEqual(typeof result.score, 'number');
    assert.ok(result.score >= 90, 'Score should be in Critical bracket');
    assert.strictEqual(result.riskLevel, 'Critical');
    assert.strictEqual(result.modelVersion, 'RAKSHA-PE-v2.4-IND');
    assert.ok(result.breakdown.severityWeight > 30);
  });

  it('SafeRouteService should calculate distance and generate safe evacuation route avoiding hazard', () => {
    const mockDisaster: Disaster = {
      id: 'd1',
      name: 'Uttarakhand Flood',
      sector: 'Sector 04',
      type: 'Flash Flood',
      riskLevel: 'Critical',
      riskScore: 95,
      lat: 30.0668,
      lng: 79.0193,
      affectedPopulation: 10000,
      severity: 90,
      infrastructureDamage: 90,
      urgency: 90,
      status: 'ACTIVE',
      source: 'Radar',
      confidence: 95,
      detectedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      country: 'India',
      state: 'Uttarakhand',
      dataSourceType: 'DEMO'
    };

    const mockShelter: SafeLocation = {
      id: 'safe-01',
      name: 'Chamoli Relief Center',
      type: 'evacuation_center',
      lat: 30.412,
      lng: 79.324,
      capacity: 1000,
      currentOccupancy: 200,
      status: 'OPEN',
      contact: '100',
      facilities: ['Medical']
    };

    // User coordinates very close to disaster
    const route = SafeRouteService.calculateEvacuationRoute({
      userLat: 30.07,
      userLng: 79.02,
      safeLocations: [mockShelter],
      disasters: [mockDisaster]
    });

    assert.ok(route.totalDistanceKm > 0);
    assert.strictEqual(route.destination.name, 'Chamoli Relief Center');
    assert.ok(route.instructions.length >= 3);
    assert.strictEqual(route.hazardStatus, 'INSIDE_HAZARD');
  });

  it('DamageAssessmentService should generate explainable structural classification', () => {
    const mockDisaster: Disaster = {
      id: 'd2',
      name: 'Cyclone Impact',
      sector: 'Sector 08',
      type: 'Cyclone Impact',
      riskLevel: 'High',
      riskScore: 85,
      lat: 20.95,
      lng: 85.09,
      affectedPopulation: 20000,
      severity: 80,
      infrastructureDamage: 75,
      urgency: 80,
      status: 'ACTIVE',
      source: 'Optical',
      confidence: 92,
      detectedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      country: 'India',
      state: 'Odisha',
      dataSourceType: 'DEMO'
    };

    const assessment = DamageAssessmentService.generateAssessment(mockDisaster);

    assert.ok(assessment.destroyedBuildings > 0);
    assert.ok(assessment.severeDamage > 0);
    assert.ok(assessment.moderateDamage > 0);
    assert.strictEqual(assessment.confidence, 92);
    assert.ok(assessment.evidenceNotes.includes('Sector 08'));
  });
});
