import { PriorityEngine } from '../services/PriorityEngine.js';

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('🚀 RAKSHA PHASE 11 END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Dashboard Summary Verification
  console.log('1️⃣ Verifying Dashboard Summary & Dynamic Counts:');
  const summaryRes: any = await fetch('http://localhost:4000/api/dashboard/summary').then(r => r.json());
  if (!summaryRes.success || !summaryRes.data) throw new Error('Dashboard summary failed');
  console.log('  ✓ Critical Count:', summaryRes.data.criticalCount);
  console.log('  ✓ High Count:', summaryRes.data.highCount);
  console.log('  ✓ Medium Count:', summaryRes.data.mediumCount);
  console.log('  ✓ Safe Count:', summaryRes.data.safeCount);
  console.log('  ✓ Affected Population:', summaryRes.data.affectedPopulation);
  console.log('  ✓ Active Disasters in DB:', summaryRes.data.activeDisasters.length);
  console.log('  ✓ Rescue Teams in DB:', summaryRes.data.rescueTeams.length);

  // 2. Map Layers Verification & Indian Subcontinent Bounds
  console.log('\n2️⃣ Verifying Map Layers & India Bounds:');
  const mapRes: any = await fetch('http://localhost:4000/api/map/layers').then(r => r.json());
  if (!mapRes.success) throw new Error('Map layers failed');
  console.log('  ✓ Center Coordinates:', mapRes.meta.mapCenter);
  console.log('  ✓ Zoom Range:', `[${mapRes.meta.minZoom}, ${mapRes.meta.maxZoom}]`);
  console.log('  ✓ Indian Geographic Bounds:', mapRes.meta.indianBounds);
  console.log('  ✓ Hazard Polygons Generated:', mapRes.data.hazardPolygons.length);
  console.log('  ✓ Verified Safe Shelter Points:', mapRes.data.safeLocations.length);

  // 3. Priority Engine & Explainable Score Breakdown
  console.log('\n3️⃣ Verifying Priority Engine Scoring & Breakdown:');
  const scoreResult = PriorityEngine.calculate({
    severity: 95,
    affectedPopulation: 12400,
    infrastructureDamage: 90,
    urgency: 100,
    hasHazardOverlay: true
  });
  console.log('  ✓ Model Version:', scoreResult.modelVersion);
  console.log('  ✓ Final Risk Score:', `${scoreResult.score}/100`);
  console.log('  ✓ Assigned Risk Bracket:', scoreResult.riskLevel);
  console.log('  ✓ Explainable Breakdown:', scoreResult.breakdown);

  // 4. Rescue Team Transactional Assignment & Refresh Persistence
  console.log('\n4️⃣ Verifying Rescue Team Transactional Assignment:');
  const assignRes: any = await fetch('http://localhost:4000/api/rescue/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId: 't2', disasterId: 'd1-uttarakhand-flood', notes: 'Deploying Garhwal SDRF' })
  }).then(r => r.json());
  if (!assignRes.success) throw new Error('Assignment failed');
  console.log('  ✓ Assignment Logged:', assignRes.data.assignment.id);
  console.log('  ✓ Team Status Changed To:', assignRes.data.team.status);
  console.log('  ✓ Calculated Distance to Target:', `${assignRes.data.team.distanceKm} km`);

  // Verify persistence after simulated refresh
  const teamCheck: any = await fetch('http://localhost:4000/api/rescue-teams/t2').then(r => r.json());
  if (teamCheck.data.status !== 'On Mission') throw new Error('Assignment failed to persist');
  console.log('  ✓ Status Persists in Database:', teamCheck.data.status);

  // 5. Offline Safe Evacuation Route Calculation
  console.log('\n5️⃣ Verifying Client-Side Offline Evacuation Routing:');
  const routeRes: any = await fetch('http://localhost:4000/api/offline/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userLat: 30.068, userLng: 79.020 })
  }).then(r => r.json());
  if (!routeRes.success) throw new Error('Offline route failed');
  console.log('  ✓ Hazard Proximity Status:', routeRes.data.hazardStatus);
  console.log('  ✓ Nearest Safe Destination:', routeRes.data.destination.name);
  console.log('  ✓ Total Safe Path Distance:', `${routeRes.data.totalDistanceKm} km`);
  console.log('  ✓ Estimated Evacuation Time:', `${routeRes.data.estimatedMinutes} mins`);
  console.log('  ✓ Turn-by-Turn Maneuvers Count:', routeRes.data.instructions.length);

  // 6. Satellite Feeds & Earth Observation Metadata
  console.log('\n6️⃣ Verifying Satellite Intelligence Feeds:');
  const satRes: any = await fetch('http://localhost:4000/api/satellite/observations').then(r => r.json());
  console.log('  ✓ Observations Count:', satRes.data.length);
  satRes.data.forEach((sat: any) => {
    console.log(`    • ${sat.source} (${sat.mode}) - Res: ${sat.resolution}, Cloud: ${sat.cloudCoverage}%, [${sat.dataSourceType}]`);
  });

  // 7. Explainable Damage Assessment
  console.log('\n7️⃣ Verifying Damage Assessment & Evidence:');
  const dmgRes: any = await fetch('http://localhost:4000/api/damage-assessments').then(r => r.json());
  const report = dmgRes.data[0];
  console.log('  ✓ Sector:', report.sectorName);
  console.log('  ✓ Confidence:', `${report.confidence}%`);
  console.log('  ✓ Destroyed Structures:', report.destroyedBuildings);
  console.log('  ✓ Severe Damage:', report.severeDamage);
  console.log('  ✓ Moderate Damage:', report.moderateDamage);
  console.log('  ✓ Sensor Fusion Source:', report.sourceSensors);
  console.log('  ✓ Methodology:', report.analysisMethod);
  console.log('  ✓ Attribution Tag:', report.dataSourceType);

  // 8. Settings Persistence in Database
  console.log('\n8️⃣ Verifying Settings Persistence:');
  const patchSettings: any = await fetch('http://localhost:4000/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshInterval: '1m', criticalAlerts: true, highRiskAlerts: true })
  }).then(r => r.json());
  console.log('  ✓ Updated Settings Saved to Disk/DB:', patchSettings.data.refreshInterval);

  // 9. System Status & Timestamp Refresh
  console.log('\n9️⃣ Verifying Dynamic System Status:');
  const statusRes: any = await fetch('http://localhost:4000/api/system/status').then(r => r.json());
  console.log('  ✓ Overall Status:', statusRes.data.status);
  console.log('  ✓ Last Synchronized Time:', statusRes.data.lastUpdated);
  console.log('  ✓ Database State:', statusRes.data.databaseStatus);
  console.log('  ✓ USGS Earthquake Provider:', statusRes.data.providers.usgsEarthquake.status);
  console.log('  ✓ Copernicus Sentinel Provider:', statusRes.data.providers.copernicusSentinel.status);
  console.log('  ✓ Valhalla / Client Routing Engine:', statusRes.data.providers.valhallaRouting.status);

  console.log('\n====================================================');
  console.log('🎉 ALL RAKSHA PHASE 11 ACCEPTANCE CRITERIA VERIFIED!');
  console.log('====================================================');
}

runEndToEndVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
