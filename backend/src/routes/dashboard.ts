import { Router } from 'express';
import { db } from '../db/database.js';
import { SystemStatusService } from '../services/SystemStatusService.js';
import type { DashboardSummary } from '../types/index.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', (req, res) => {
  const disasters = db.store.disasters || [];
  const criticalCount = disasters.filter(d => d.riskLevel === 'Critical').length;
  const highCount = disasters.filter(d => d.riskLevel === 'High').length;
  const mediumCount = disasters.filter(d => d.riskLevel === 'Medium').length;
  const safeCount = disasters.filter(d => d.riskLevel === 'Safe').length;
  const affectedPopulation = disasters.reduce((acc, d) => acc + (d.affectedPopulation || 0), 0);

  // Sorted by risk score descending
  const priorityQueue = [...disasters].sort((a, b) => b.riskScore - a.riskScore);

  const satelliteFeeds = db.store.satelliteObservations || [];
  const latestSatelliteObservation = satelliteFeeds[0] || null;

  const rescueTeams = db.store.rescueTeams || [];
  const damageReports = db.store.damageAssessments || [];
  const notifications = db.store.notifications || [];
  const systemStatus = SystemStatusService.getStatus();

  const summary: DashboardSummary = {
    criticalCount,
    highCount,
    mediumCount,
    safeCount,
    affectedPopulation,
    activeDisasters: disasters,
    latestSatelliteObservation,
    satelliteFeeds,
    priorityQueue,
    rescueTeams,
    damageReports,
    systemStatus,
    notifications
  };

  res.json({
    success: true,
    data: summary,
    meta: {
      generatedAt: new Date().toISOString(),
      dataSource: 'RAKSHA PostgreSQL + PostGIS Data Engine'
    }
  });
});
