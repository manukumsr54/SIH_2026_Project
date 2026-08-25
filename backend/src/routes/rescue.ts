import { Router } from 'express';
import { db } from '../db/database.js';
import { SafeRouteService } from '../services/SafeRouteService.js';
import type { RescueAssignment } from '../types/index.js';

export const rescueRouter = Router();

// GET /api/rescue-teams
rescueRouter.get('/', (req, res) => {
  const disasters = db.store.disasters || [];
  
  // Dynamically update team distance to assigned disaster or nearest disaster
  const teams = (db.store.rescueTeams || []).map(team => {
    let targetLat = disasters[0]?.lat || 30.06;
    let targetLng = disasters[0]?.lng || 79.01;

    if (team.assignedDisasterId) {
      const assigned = disasters.find(d => d.id === team.assignedDisasterId);
      if (assigned) {
        targetLat = assigned.lat;
        targetLng = assigned.lng;
      }
    }

    const dist = SafeRouteService.calculateDistanceKm(team.lat, team.lng, targetLat, targetLng);
    return {
      ...team,
      distanceKm: +dist.toFixed(1)
    };
  });

  res.json({
    success: true,
    data: teams,
    meta: { total: teams.length }
  });
});

// GET /api/rescue-teams/:id
rescueRouter.get('/:id', (req, res) => {
  const team = (db.store.rescueTeams || []).find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({
      success: false,
      error: { code: 'TEAM_NOT_FOUND', message: `Team ${req.params.id} not found` }
    });
  }
  res.json({
    success: true,
    data: team
  });
});

// GET /api/rescue/assignments (List all historical rescue assignments)
rescueRouter.get('/assignments', (req, res) => {
  const assignments = db.store.rescueAssignments || [];
  res.json({
    success: true,
    data: assignments,
    meta: { total: assignments.length }
  });
});

// GET /api/rescue/teams/:id/history (Get assignment history for a team)
rescueRouter.get('/teams/:id/history', (req, res) => {
  const teamId = req.params.id;
  const assignments = (db.store.rescueAssignments || []).filter(a => a.teamId === teamId);
  const events = (db.store.systemEvents || []).filter(
    e => e.entityId === teamId || e.metadata?.teamId === teamId
  );

  res.json({
    success: true,
    data: {
      teamId,
      assignments,
      events
    }
  });
});

// POST /api/rescue/assignments (Transactional team dispatch)
rescueRouter.post('/assignments', async (req, res) => {
  const { teamId, disasterId, notes } = req.body;

  if (!teamId || !disasterId) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'teamId and disasterId are required.' }
    });
  }

  const team = (db.store.rescueTeams || []).find(t => t.id === teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      error: { code: 'TEAM_NOT_FOUND', message: `Rescue team ${teamId} not found` }
    });
  }

  const disaster = (db.store.disasters || []).find(d => d.id === disasterId);
  if (!disaster) {
    return res.status(404).json({
      success: false,
      error: { code: 'DISASTER_NOT_FOUND', message: `Disaster ${disasterId} not found` }
    });
  }

  const prevStatus = team.status;
  const nowIso = new Date().toISOString();

  // Create Assignment record
  const assignment: RescueAssignment = {
    id: `assign-${Date.now()}`,
    teamId,
    disasterId,
    assignedAt: nowIso,
    status: 'DEPLOYED',
    notes: notes || `Deployed to ${disaster.name} (${disaster.sector})`
  };

  // Update Team Status
  team.status = 'On Mission';
  team.assignedDisasterId = disasterId;
  team.lastLocationUpdate = nowIso;

  // Recalculate Distance
  const dist = SafeRouteService.calculateDistanceKm(team.lat, team.lng, disaster.lat, disaster.lng);
  team.distanceKm = +dist.toFixed(1);

  db.store.rescueAssignments.unshift(assignment);

  // PostgreSQL Transaction if connected
  if (db.isConnected() && db.getPool()) {
    const pool = db.getPool()!;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE rescue_teams SET status = $1, assigned_disaster_id = $2, last_location_update = NOW() WHERE id = $3',
        ['On Mission', disasterId, teamId]
      );
      await client.query(
        'INSERT INTO rescue_assignments (id, team_id, disaster_id, assigned_at, status, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        [assignment.id, teamId, disasterId, assignment.assignedAt, assignment.status, assignment.notes]
      );
      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Database transaction error, rolled back:', err.message);
    } finally {
      client.release();
    }
  }

  // Unified Event Logging with Notification
  const event = await db.logEvent({
    eventType: 'RESCUE_TEAM_ASSIGNED',
    category: 'RESCUE',
    severity: 'Info',
    title: `Rescue Team Assigned: ${team.name}`,
    description: `${team.name} assigned to ${disaster.sector} (${disaster.name})`,
    entityType: 'RescueTeam',
    entityId: team.id,
    metadata: {
      assignmentId: assignment.id,
      teamId: team.id,
      teamName: team.name,
      disasterId: disaster.id,
      disasterName: disaster.name,
      sectorId: disaster.sector,
      sectorName: disaster.sector,
      previousStatus: prevStatus,
      newStatus: 'On Mission',
      action: 'ASSIGNED',
      source: 'Operator Dispatch Console'
    },
    createNotification: true
  });

  db.saveToDisk();

  res.status(201).json({
    success: true,
    data: {
      assignment,
      team,
      event
    },
    meta: {
      message: `${team.name} assigned to ${disaster.sector}`
    }
  });
});

// POST /api/rescue/teams/:id/deassign (Deassign / Remove assignment)
rescueRouter.post('/teams/:id/deassign', async (req, res) => {
  const teamId = req.params.id;
  const team = (db.store.rescueTeams || []).find(t => t.id === teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      error: { code: 'TEAM_NOT_FOUND', message: `Team ${teamId} not found` }
    });
  }

  const prevDisasterId = team.assignedDisasterId;
  const prevDisaster = prevDisasterId ? (db.store.disasters || []).find(d => d.id === prevDisasterId) : null;
  const prevStatus = team.status;
  const nowIso = new Date().toISOString();

  // Find active assignment
  const activeAssignment = (db.store.rescueAssignments || []).find(
    a => a.teamId === teamId && a.status === 'DEPLOYED'
  );

  if (activeAssignment) {
    activeAssignment.status = 'DEASSIGNED';
    activeAssignment.endedAt = nowIso;
  }

  team.status = 'Available';
  team.assignedDisasterId = undefined;
  team.lastLocationUpdate = nowIso;

  const sectorName = prevDisaster ? prevDisaster.sector : 'Assigned Sector';
  const disasterName = prevDisaster ? prevDisaster.name : 'Emergency Incident';

  // Unified Event Logging with Notification
  const event = await db.logEvent({
    eventType: 'RESCUE_TEAM_DEASSIGNED',
    category: 'RESCUE',
    severity: 'Medium',
    title: `Rescue Team De-assigned: ${team.name}`,
    description: `${team.name} de-assigned from ${sectorName} (${disasterName})`,
    entityType: 'RescueTeam',
    entityId: team.id,
    metadata: {
      teamId: team.id,
      teamName: team.name,
      disasterId: prevDisasterId,
      disasterName,
      sectorId: sectorName,
      sectorName,
      previousStatus: prevStatus,
      newStatus: 'Available',
      action: 'DEASSIGNED',
      source: 'Operator Dispatch Console'
    },
    createNotification: true
  });

  db.saveToDisk();

  res.json({
    success: true,
    data: {
      team,
      assignment: activeAssignment,
      event
    },
    meta: {
      message: `${team.name} de-assigned from ${sectorName}`
    }
  });
});

// PATCH /api/rescue/assignments/:id
rescueRouter.patch('/assignments/:id', async (req, res) => {
  const { status } = req.body;
  const assignment = (db.store.rescueAssignments || []).find(a => a.id === req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      error: { code: 'ASSIGNMENT_NOT_FOUND', message: `Assignment ${req.params.id} not found` }
    });
  }

  assignment.status = status || 'COMPLETED';
  if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'DEASSIGNED') {
    assignment.endedAt = new Date().toISOString();
    const team = (db.store.rescueTeams || []).find(t => t.id === assignment.teamId);
    if (team) {
      team.status = 'Available';
      team.assignedDisasterId = undefined;
    }
  }

  db.saveToDisk();

  res.json({
    success: true,
    data: assignment
  });
});
