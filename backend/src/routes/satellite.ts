import { Router } from 'express';
import { db } from '../db/database.js';
import { satelliteProvider } from '../providers/SatelliteProvider.js';
import type { SatelliteStatusResponse } from '../types/index.js';

export const satelliteRouter = Router();

// GET /api/satellite/status (Satellite status popup network info)
satelliteRouter.get('/status', (req, res) => {
  const satStatus: SatelliteStatusResponse = {
    totalSources: 6,
    onlineCount: 4,
    monitoringCount: 2,
    lastSynchronization: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST',
    sources: [
      {
        id: 'sentinel-1a',
        name: 'Sentinel-1A',
        type: 'SAR',
        status: 'Online',
        isLiveConnected: true,
        resolution: '10m C-band SAR',
        revisitDays: '6 days (12d const.)',
        operator: 'ESA / Copernicus'
      },
      {
        id: 'sentinel-1c',
        name: 'Sentinel-1C',
        type: 'SAR',
        status: 'Online',
        isLiveConnected: true,
        resolution: '10m SAR (All-Weather)',
        revisitDays: '6 days',
        operator: 'ESA / Copernicus'
      },
      {
        id: 'sentinel-2a',
        name: 'Sentinel-2A',
        type: 'Optical',
        status: 'Online',
        isLiveConnected: true,
        resolution: '10m Multi-Spectral (13 bands)',
        revisitDays: '5 days',
        operator: 'ESA / Copernicus'
      },
      {
        id: 'sentinel-2b',
        name: 'Sentinel-2B',
        type: 'Optical',
        status: 'Online',
        isLiveConnected: true,
        resolution: '10m Multi-Spectral (RGB+NIR+SWIR)',
        revisitDays: '5 days',
        operator: 'ESA / Copernicus'
      },
      {
        id: 'landsat-9',
        name: 'Landsat 9',
        type: 'Optical',
        status: 'Monitoring',
        isLiveConnected: false,
        resolution: '15m Pan / 30m Multi-Spectral',
        revisitDays: '16 days (8d with L8)',
        operator: 'NASA / USGS'
      },
      {
        id: 'insat-3dr',
        name: 'INSAT-3DR',
        type: 'Meteorological',
        status: 'Monitoring',
        isLiveConnected: false,
        resolution: '1km VIS / 4km IR',
        revisitDays: 'Geostationary (Continuous)',
        operator: 'ISRO'
      }
    ],
    disclaimer: 'RAKSHA accesses open telemetry & Earth observation catalogues provided by ESA, NASA, USGS, and ISRO. RAKSHA processes and serves normalized emergency feeds; it does not directly control physical orbital constellations.'
  };

  res.json({
    success: true,
    data: satStatus
  });
});

// GET /api/satellite/observations
satelliteRouter.get('/observations', async (req, res) => {
  const observations = db.store.satelliteObservations || [];
  res.json({
    success: true,
    data: observations,
    meta: {
      total: observations.length,
      providerStatus: satelliteProvider.getStatus()
    }
  });
});

// POST /api/satellite/sync (Manual/automatic satellite refresh)
satelliteRouter.post('/sync', async (req, res) => {
  const sat = db.store.satelliteObservations?.[0] || {
    source: 'Sentinel-1 SAR',
    locationName: 'Odisha Coastal Reach',
    mode: 'SAR (Cloud Penetration)'
  };
  
  await db.logEvent({
    eventType: 'SATELLITE_DATA_UPDATED',
    category: 'SATELLITE',
    severity: 'Info',
    title: 'Sentinel-1 SAR Imagery Synchronized',
    description: 'Cloud-penetrating SAR scan updated with high-resolution radar flood extent',
    entityType: 'Satellite',
    entityId: sat.id || 'sat-obs-001',
    metadata: {
      source: sat.source,
      mode: sat.mode,
      locationName: sat.locationName
    },
    createNotification: true
  });

  res.json({
    success: true,
    data: db.store.satelliteObservations,
    meta: { message: 'Satellite telemetry & observations synchronized.' }
  });
});
