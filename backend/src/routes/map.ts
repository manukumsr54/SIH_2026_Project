import { Router } from 'express';
import { db } from '../db/database.js';

export const mapRouter = Router();

mapRouter.get('/layers', (req, res) => {
  const disasters = db.store.disasters || [];
  const rescueTeams = db.store.rescueTeams || [];
  const safeLocations = db.store.safeLocations || [];
  const satelliteFootprints = (db.store.satelliteObservations || []).map(sat => ({
    id: sat.id,
    source: sat.source,
    mode: sat.mode,
    lat: sat.lat,
    lng: sat.lng,
    bbox: sat.bbox,
    cloudCoverage: sat.cloudCoverage
  }));

  // Generate hazard polygons around critical/high disaster epicenters
  const hazardPolygons = disasters.map(d => {
    const radius = d.riskLevel === 'Critical' ? 0.08 : d.riskLevel === 'High' ? 0.05 : 0.03;
    return {
      disasterId: d.id,
      name: `${d.name} Hazard Perimeter`,
      riskLevel: d.riskLevel,
      coordinates: [
        [d.lat + radius, d.lng - radius],
        [d.lat + radius, d.lng + radius],
        [d.lat - radius, d.lng + radius],
        [d.lat - radius, d.lng - radius]
      ]
    };
  });

  res.json({
    success: true,
    data: {
      disasters,
      hazardPolygons,
      rescueTeams,
      safeLocations,
      satelliteFootprints
    },
    meta: {
      mapCenter: [22.0, 80.0], // Center of India
      minZoom: 4,
      maxZoom: 18,
      indianBounds: [
        [6.0, 68.0],
        [37.5, 97.5]
      ]
    }
  });
});
