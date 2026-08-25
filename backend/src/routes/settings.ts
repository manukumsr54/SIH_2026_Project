import { Router } from 'express';
import { db } from '../db/database.js';

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    data: db.store.settings
  });
});

// PATCH /api/settings
settingsRouter.patch('/', async (req, res) => {
  const updates = req.body;
  db.store.settings = {
    ...db.store.settings,
    ...updates
  };

  await db.logEvent('SETTINGS_UPDATED', updates);
  db.saveToDisk();

  res.json({
    success: true,
    data: db.store.settings,
    meta: { message: 'Settings persisted successfully' }
  });
});
