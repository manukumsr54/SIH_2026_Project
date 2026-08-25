import { Router } from 'express';
import { db } from '../db/database.js';
import { SafeRouteService } from '../services/SafeRouteService.js';

export const offlineRouter = Router();

// GET /api/offline/regions
offlineRouter.get('/regions', (req, res) => {
  const regions = db.store.offlineRegions || [];
  res.json({
    success: true,
    data: regions,
    meta: { total: regions.length }
  });
});

// POST /api/offline/regions/:id/sync (Download / Cache regional offline pack)
offlineRouter.post('/regions/:id/sync', async (req, res) => {
  const region = (db.store.offlineRegions || []).find(r => r.id === req.params.id);
  if (!region) {
    return res.status(404).json({
      success: false,
      error: { code: 'REGION_NOT_FOUND', message: `Region ${req.params.id} not found` }
    });
  }

  region.status = 'Cached';
  region.lastSync = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';
  
  await db.logEvent({
    eventType: 'OFFLINE_MAP_REGION_CACHED',
    category: 'OFFLINE',
    severity: 'Info',
    title: `Offline Map Cached: ${region.name}`,
    description: `Offline evacuation package and road vector graph cached for ${region.state}`,
    entityType: 'OfflineRegion',
    entityId: region.id,
    metadata: {
      regionId: region.id,
      name: region.name,
      state: region.state,
      sizeMb: region.sizeMb
    },
    createNotification: true
  });
  db.saveToDisk();

  // Return full regional offline package: road graph, safe shelters, disaster zones
  const safeLocations = db.store.safeLocations || [];
  const disasters = db.store.disasters || [];

  res.json({
    success: true,
    data: {
      region,
      safeLocations,
      disasters,
      syncedAt: new Date().toISOString()
    }
  });
});

// POST /api/offline/route (Calculate safe evacuation route)
offlineRouter.post('/route', (req, res) => {
  const { userLat, userLng } = req.body;

  if (userLat === undefined || userLng === undefined) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'userLat and userLng are required.' }
    });
  }

  const safeLocations = db.store.safeLocations || [];
  const disasters = db.store.disasters || [];

  const route = SafeRouteService.calculateEvacuationRoute({
    userLat: Number(userLat),
    userLng: Number(userLng),
    safeLocations,
    disasters
  });

  res.json({
    success: true,
    data: route
  });
});
