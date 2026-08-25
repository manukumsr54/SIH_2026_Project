import { Router } from 'express';
import { SystemStatusService } from '../services/SystemStatusService.js';
import { earthquakeProvider } from '../providers/EarthquakeProvider.js';
import { fireProvider } from '../providers/FireProvider.js';
import { satelliteProvider } from '../providers/SatelliteProvider.js';
import { db } from '../db/database.js';

export const systemRouter = Router();

// GET /api/system/status
systemRouter.get('/status', (req, res) => {
  const status = SystemStatusService.getStatus();
  res.json({
    success: true,
    data: status
  });
});

// POST /api/system/sync (Trigger manual or scheduled data sync)
systemRouter.post('/sync', async (req, res) => {
  SystemStatusService.updateSyncTimestamp();
  
  // Ingest real-time earthquakes if available
  const newQuakes = await earthquakeProvider.fetchRealtimeEvents();
  for (const q of newQuakes) {
    const exists = db.store.disasters.some(d => d.id === q.id || d.sourceEventId === q.sourceEventId);
    if (!exists) {
      db.store.disasters.unshift(q);
    }
  }

  await satelliteProvider.fetchLatestObservations();
  await fireProvider.fetchFireHotspots();

  db.saveToDisk();

  res.json({
    success: true,
    data: SystemStatusService.getStatus(),
    meta: {
      message: 'System synchronization cycle completed',
      ingestedEvents: newQuakes.length
    }
  });
});
