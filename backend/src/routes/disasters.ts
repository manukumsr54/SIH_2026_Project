import { Router } from 'express';
import { db } from '../db/database.js';
import { PriorityEngine } from '../services/PriorityEngine.js';
import { DamageAssessmentService } from '../services/DamageAssessmentService.js';
import type { Disaster } from '../types/index.js';

export const disastersRouter = Router();

// GET /api/disasters
disastersRouter.get('/', (req, res) => {
  const { riskLevel, type, state } = req.query;
  let items = db.store.disasters || [];

  if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'All') {
    items = items.filter(d => d.riskLevel === riskLevel);
  }
  if (type && typeof type === 'string' && type !== 'All') {
    items = items.filter(d => d.type.toLowerCase().includes(type.toLowerCase()));
  }
  if (state && typeof state === 'string') {
    items = items.filter(d => d.state.toLowerCase() === state.toLowerCase());
  }

  res.json({
    success: true,
    data: items,
    meta: { total: items.length }
  });
});

// GET /api/disasters/active
disastersRouter.get('/active', (req, res) => {
  const active = (db.store.disasters || []).filter(d => d.status === 'ACTIVE');
  res.json({
    success: true,
    data: active,
    meta: { total: active.length }
  });
});

// GET /api/disasters/:id
disastersRouter.get('/:id', (req, res) => {
  const item = (db.store.disasters || []).find(d => d.id === req.params.id);
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'DISASTER_NOT_FOUND', message: `Disaster ${req.params.id} not found` }
    });
  }

  const relatedSatellite = (db.store.satelliteObservations || []).filter(s => s.disasterId === item.id);
  const relatedDamage = (db.store.damageAssessments || []).find(dmg => dmg.disasterId === item.id);
  const assignedTeam = (db.store.rescueTeams || []).find(t => t.assignedDisasterId === item.id);

  res.json({
    success: true,
    data: {
      ...item,
      satelliteObservations: relatedSatellite,
      damageAssessment: relatedDamage,
      assignedTeam
    }
  });
});

// GET /api/disasters/:id/history
disastersRouter.get('/:id/history', (req, res) => {
  const disasterId = req.params.id;
  const events = (db.store.systemEvents || []).filter(
    e => e.payload?.disasterId === disasterId || e.payload?.id === disasterId
  );
  res.json({
    success: true,
    data: events
  });
});

// POST /api/disasters (Create new incident)
disastersRouter.post('/', async (req, res) => {
  const { name, sector, type, lat, lng, severity, affectedPopulation, infrastructureDamage, urgency, state } = req.body;

  if (!name || lat === undefined || lng === undefined) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, lat, and lng are required.' }
    });
  }

  const scoreResult = PriorityEngine.calculate({
    severity: severity || 70,
    affectedPopulation: affectedPopulation || 5000,
    infrastructureDamage: infrastructureDamage || 60,
    urgency: urgency || 70
  });

  const newDisaster: Disaster = {
    id: `d-custom-${Date.now()}`,
    name,
    sector: sector || 'Sector Alpha',
    type: type || 'Flash Flood',
    riskLevel: scoreResult.riskLevel,
    riskScore: scoreResult.score,
    lat: Number(lat),
    lng: Number(lng),
    affectedPopulation: Number(affectedPopulation) || 5000,
    severity: Number(severity) || 70,
    infrastructureDamage: Number(infrastructureDamage) || 60,
    urgency: Number(urgency) || 70,
    status: 'ACTIVE',
    source: 'Civil Emergency Report & Satellite Radar',
    confidence: 90,
    detectedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    country: 'India',
    state: state || 'Uttarakhand',
    dataSourceType: 'DEMO',
    scoreBreakdown: scoreResult.breakdown
  };

  db.store.disasters.unshift(newDisaster);
  
  // Auto-generate initial damage assessment for new disaster
  const autoDamage = DamageAssessmentService.generateAssessment(newDisaster);
  db.store.damageAssessments.unshift(autoDamage);

  await db.logEvent({
    eventType: 'DISASTER_ZONE_CREATED',
    category: 'DISASTER',
    severity: newDisaster.riskLevel === 'Critical' ? 'Critical' : 'High',
    title: `Disaster Zone Created: ${newDisaster.sector}`,
    description: `${newDisaster.name} (${newDisaster.type}) detected with Priority Score ${newDisaster.riskScore}/100`,
    entityType: 'Disaster',
    entityId: newDisaster.id,
    metadata: {
      disasterId: newDisaster.id,
      name: newDisaster.name,
      sector: newDisaster.sector,
      riskLevel: newDisaster.riskLevel,
      riskScore: newDisaster.riskScore
    },
    createNotification: true
  });
  db.saveToDisk();

  res.status(201).json({
    success: true,
    data: newDisaster
  });
});
