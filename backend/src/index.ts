import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { dashboardRouter } from './routes/dashboard.js';
import { disastersRouter } from './routes/disasters.js';
import { mapRouter } from './routes/map.js';
import { satelliteRouter } from './routes/satellite.js';
import { damageRouter } from './routes/damage.js';
import { rescueRouter } from './routes/rescue.js';
import { offlineRouter } from './routes/offline.js';
import { analyticsRouter } from './routes/analytics.js';
import { settingsRouter } from './routes/settings.js';
import { systemRouter } from './routes/system.js';
import { notificationsRouter } from './routes/notifications.js';
import { SystemStatusService } from './services/SystemStatusService.js';
import { earthquakeProvider } from './providers/EarthquakeProvider.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// SSE Client list
const sseClients: express.Response[] = [];

app.use(cors({ origin: '*' }));
app.use(express.json());

// Structured Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/api/events/stream')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health Checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    database: db.isConnected() ? 'postgres' : 'resilient-local',
    uptimeSeconds: Math.round(process.uptime())
  });
});

// Real-time Server-Sent Events (SSE) Stream
app.get('/api/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Helper to broadcast events to all SSE clients
export function broadcastEvent(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      // client disconnected
    }
  }
}

// Automatically stream any event or notification logged to DB over SSE
db.onBroadcast((type: string, data: any) => {
  broadcastEvent(type, data);
});

// API Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/disasters', disastersRouter);
app.use('/api/map', mapRouter);
app.use('/api/satellite', satelliteRouter);
app.use('/api/damage-assessments', damageRouter);
app.use('/api/rescue', rescueRouter);
app.use('/api/rescue-teams', rescueRouter);
app.use('/api/offline', offlineRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/system', systemRouter);
app.use('/api/notifications', notificationsRouter);

// OpenAPI JSON Documentation Endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'RAKSHA Disaster Intelligence Platform API',
      version: '1.0.0',
      description: 'Production backend API for geospatial disaster monitoring, satellite observation feeds, priority dispatch, and safe offline evacuation.'
    },
    paths: {
      '/api/dashboard/summary': { get: { summary: 'Get unified dashboard summary metrics and active feeds' } },
      '/api/disasters': { get: { summary: 'List all disasters with optional risk and state filters' }, post: { summary: 'Report new disaster' } },
      '/api/disasters/active': { get: { summary: 'Get active disaster incidents' } },
      '/api/disasters/{id}': { get: { summary: 'Get disaster details with satellite and damage overlays' } },
      '/api/map/layers': { get: { summary: 'Get geospatial layers (polygons, shelters, teams, quakes)' } },
      '/api/satellite/status': { get: { summary: 'Get multi-satellite constellation status and telemetry' } },
      '/api/satellite/observations': { get: { summary: 'Get multi-source satellite observations' } },
      '/api/damage-assessments': { get: { summary: 'Get explainable infrastructure damage reports' } },
      '/api/rescue-teams': { get: { summary: 'Get rescue units with real-time distance calculations' } },
      '/api/rescue/assignments': { post: { summary: 'Deploy rescue team transactionally' } },
      '/api/rescue/teams/{id}/deassign': { post: { summary: 'Deassign rescue team and return to available pool' } },
      '/api/offline/regions': { get: { summary: 'Get offline regional map packs' } },
      '/api/offline/route': { post: { summary: 'Calculate hazard-avoiding safe evacuation route' } },
      '/api/notifications': { get: { summary: 'Get operational alerts and notifications' } },
      '/api/analytics/overview': { get: { summary: 'Get aggregated incident, risk, and response trends' } },
      '/api/settings': { get: { summary: 'Get system settings' }, patch: { summary: 'Update system settings' } },
      '/api/system/status': { get: { summary: 'Get dynamic system status and provider health' } },
      '/api/events/stream': { get: { summary: 'Real-time Server-Sent Events stream' } }
    }
  });
});

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` }
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected internal error occurred' }
  });
});

// Scheduled Background Jobs:
// 1. Refresh System Status timestamp every 60 seconds
setInterval(() => {
  SystemStatusService.updateSyncTimestamp();
  broadcastEvent('STATUS_UPDATED', SystemStatusService.getStatus());
}, 60000);

// 2. Periodic USGS Earthquake sync every 3 minutes
setInterval(async () => {
  try {
    const quakes = await earthquakeProvider.fetchRealtimeEvents();
    if (quakes.length > 0) {
      let added = 0;
      for (const q of quakes) {
        if (!db.store.disasters.some(d => d.id === q.id || d.sourceEventId === q.sourceEventId)) {
          db.store.disasters.unshift(q);
          added++;
        }
      }
      if (added > 0) {
        db.saveToDisk();
        broadcastEvent('DISASTERS_UPDATED', db.store.disasters);
      }
    }
  } catch (err: any) {
    console.warn('Scheduled sync warning:', err.message);
  }
}, 180000);

// Initialize DB and Start Server
async function start() {
  await db.init();
  if (!db.store.disasters || db.store.disasters.length === 0) {
    await seedDatabase();
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 RAKSHA Backend running on http://localhost:${PORT}`);
    console.log(`📡 Real-time SSE Stream: http://localhost:${PORT}/api/events/stream`);
    console.log(`📋 OpenAPI Docs: http://localhost:${PORT}/api/docs`);
  });
}

start();
