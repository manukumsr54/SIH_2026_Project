import { Router } from 'express';
import { db } from '../db/database.js';

export const damageRouter = Router();

// GET /api/damage-assessments
damageRouter.get('/', (req, res) => {
  const { disasterId } = req.query;
  let items = db.store.damageAssessments || [];

  if (disasterId && typeof disasterId === 'string') {
    items = items.filter(dmg => dmg.disasterId === disasterId);
  }

  res.json({
    success: true,
    data: items,
    meta: { total: items.length }
  });
});

// GET /api/damage-assessments/:id
damageRouter.get('/:id', (req, res) => {
  const item = (db.store.damageAssessments || []).find(
    dmg => dmg.id === req.params.id || dmg.disasterId === req.params.id
  );
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'DAMAGE_ASSESSMENT_NOT_FOUND', message: `Damage assessment ${req.params.id} not found` }
    });
  }

  res.json({
    success: true,
    data: item
  });
});

// POST /api/damage-assessments/:id/update (Update damage report metrics)
damageRouter.post('/:id/update', async (req, res) => {
  const item = (db.store.damageAssessments || []).find(
    dmg => dmg.id === req.params.id || dmg.disasterId === req.params.id
  );
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'DAMAGE_ASSESSMENT_NOT_FOUND', message: `Damage assessment ${req.params.id} not found` }
    });
  }

  const { destroyedBuildings, severeDamage, moderateDamage, confidence } = req.body;
  if (destroyedBuildings !== undefined) item.destroyedBuildings = Number(destroyedBuildings);
  if (severeDamage !== undefined) item.severeDamage = Number(severeDamage);
  if (moderateDamage !== undefined) item.moderateDamage = Number(moderateDamage);
  if (confidence !== undefined) item.confidence = Number(confidence);
  item.assessmentTimestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  await db.logEvent({
    eventType: 'DAMAGE_ASSESSMENT_UPDATED',
    category: 'DAMAGE',
    severity: 'Medium',
    title: `Damage Assessment Updated: ${item.sectorName}`,
    description: `Destroyed: ${item.destroyedBuildings}, Severe: ${item.severeDamage}, Confidence: ${item.confidence}%`,
    entityType: 'DamageAssessment',
    entityId: item.id,
    metadata: {
      assessmentId: item.id,
      sectorName: item.sectorName,
      destroyedBuildings: item.destroyedBuildings,
      severeDamage: item.severeDamage
    },
    createNotification: true
  });
  db.saveToDisk();

  res.json({
    success: true,
    data: item
  });
});
