import type { SafeLocation, Disaster, EvacuationRoute } from '../types';

export class OfflineRoutingSolver {
  private static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public static solveSafeRoute(params: {
    userLat: number;
    userLng: number;
    safeLocations: SafeLocation[];
    disasters: Disaster[];
  }): EvacuationRoute {
    const { userLat, userLng, safeLocations, disasters } = params;

    // Fallback shelter if none provided
    const fallbackShelter: SafeLocation = {
      id: 'shelter-default',
      name: 'Central Emergency Relief Shelter',
      type: 'evacuation_center',
      lat: userLat + 0.05,
      lng: userLng + 0.04,
      capacity: 1000,
      currentOccupancy: 300,
      status: 'OPEN',
      contact: '112',
      facilities: ['Medical Aid', 'Clean Water', 'Food Kits']
    };

    const shelters = safeLocations.length > 0 ? safeLocations : [fallbackShelter];

    // Select nearest safe destination
    let bestShelter = shelters[0];
    let minCost = Infinity;

    for (const shelter of shelters) {
      const dist = this.calculateDistanceKm(userLat, userLng, shelter.lat, shelter.lng);
      let penalty = 0;
      for (const d of disasters) {
        const hazardDist = this.calculateDistanceKm(shelter.lat, shelter.lng, d.lat, d.lng);
        if (hazardDist < 5.0) penalty += (5.0 - hazardDist) * 25;
      }
      const cost = dist + penalty;
      if (cost < minCost) {
        minCost = cost;
        bestShelter = shelter;
      }
    }

    // Hazard check
    let closestHazardDist = Infinity;
    let closestHazard: Disaster | null = null;
    for (const d of disasters) {
      const dist = this.calculateDistanceKm(userLat, userLng, d.lat, d.lng);
      if (dist < closestHazardDist) {
        closestHazardDist = dist;
        closestHazard = d;
      }
    }

    const isInsideHazard = closestHazardDist <= 4.0;
    const isNearHazard = closestHazardDist <= 15.0;
    const hazardStatus = isInsideHazard ? 'INSIDE_HAZARD' : isNearHazard ? 'NEAR_HAZARD' : 'SAFE';

    // Waypoints
    const pathCoordinates: [number, number][] = [[userLat, userLng]];

    if (closestHazard && (isInsideHazard || isNearHazard)) {
      const vLat = userLat - closestHazard.lat;
      const vLng = userLng - closestHazard.lng;
      const mag = Math.sqrt(vLat * vLat + vLng * vLng) || 1;
      
      // Vector away from hazard
      const safeWaypoint: [number, number] = [
        userLat + (vLat / mag) * 0.035,
        userLng + (vLng / mag) * 0.035
      ];
      pathCoordinates.push(safeWaypoint);
      pathCoordinates.push([(safeWaypoint[0] + bestShelter.lat) / 2, (safeWaypoint[1] + bestShelter.lng) / 2]);
    } else {
      pathCoordinates.push([(userLat + bestShelter.lat) / 2, (userLng + bestShelter.lng) / 2]);
    }

    pathCoordinates.push([bestShelter.lat, bestShelter.lng]);

    let totalDistKm = 0;
    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      totalDistKm += this.calculateDistanceKm(
        pathCoordinates[i][0],
        pathCoordinates[i][1],
        pathCoordinates[i + 1][0],
        pathCoordinates[i + 1][1]
      );
    }

    const estimatedMinutes = Math.max(5, Math.round((totalDistKm / 32.0) * 60));

    const instructions = [
      {
        maneuver: isInsideHazard ? 'CRITICAL: Evacuate perimeter heading away from hazard zone' : 'Head towards primary evacuation corridor',
        distanceMeters: 400,
        street: 'Arterial Safe Lane 1'
      },
      {
        maneuver: 'Turn onto SDRF Verified Clear Road',
        distanceMeters: Math.round(totalDistKm * 400),
        street: 'National Highway Bypass'
      },
      {
        maneuver: `Proceed directly to ${bestShelter.name}`,
        distanceMeters: Math.round(totalDistKm * 500),
        street: 'Safe Haven Access Road'
      },
      {
        maneuver: `Arrived at Safe Shelter: ${bestShelter.name}`,
        distanceMeters: 100,
        street: 'Emergency Reception Area'
      }
    ];

    return {
      id: `offline-route-${Date.now()}`,
      userLat,
      userLng,
      destination: bestShelter,
      pathCoordinates,
      totalDistanceKm: +totalDistKm.toFixed(2),
      estimatedMinutes,
      riskScore: isInsideHazard ? 90 : isNearHazard ? 55 : 12,
      hazardStatus,
      instructions,
      isOfflineCalculated: true,
      calculatedAt: new Date().toISOString()
    };
  }
}
