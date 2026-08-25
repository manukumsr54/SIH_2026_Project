import type { SafeLocation, Disaster, EvacuationRoute } from '../types/index.js';

export class SafeRouteService {
  // Haversine distance in kilometers
  public static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
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

  // Check if coordinates are inside or near hazard zone
  public static checkHazardProximity(lat: number, lng: number, disasters: Disaster[]): {
    status: 'INSIDE_HAZARD' | 'NEAR_HAZARD' | 'SAFE';
    closestDisaster: Disaster | null;
    minDistanceKm: number;
  } {
    let minDistance = Infinity;
    let closest: Disaster | null = null;

    for (const d of disasters) {
      const dist = this.calculateDistanceKm(lat, lng, d.lat, d.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = d;
      }
    }

    if (minDistance <= 3.5) {
      return { status: 'INSIDE_HAZARD', closestDisaster: closest, minDistanceKm: minDistance };
    } else if (minDistance <= 15.0) {
      return { status: 'NEAR_HAZARD', closestDisaster: closest, minDistanceKm: minDistance };
    }
    return { status: 'SAFE', closestDisaster: closest, minDistanceKm: minDistance };
  }

  // Calculate safe evacuation route prioritizing safety over shortest path
  public static calculateEvacuationRoute(params: {
    userLat: number;
    userLng: number;
    safeLocations: SafeLocation[];
    disasters: Disaster[];
  }): EvacuationRoute {
    const { userLat, userLng, safeLocations, disasters } = params;

    // 1. Evaluate safe destinations with Cost = Distance + RiskPenalty
    let bestDestination: SafeLocation = safeLocations[0];
    let minCost = Infinity;

    for (const shelter of safeLocations) {
      const dist = this.calculateDistanceKm(userLat, userLng, shelter.lat, shelter.lng);
      // Penalty if shelter is close to active disaster
      let shelterRiskPenalty = 0;
      for (const d of disasters) {
        const hazardDist = this.calculateDistanceKm(shelter.lat, shelter.lng, d.lat, d.lng);
        if (hazardDist < 5.0) shelterRiskPenalty += (5.0 - hazardDist) * 20;
      }

      // Capacity penalty
      const occupancyRatio = shelter.capacity > 0 ? shelter.currentOccupancy / shelter.capacity : 0;
      const capacityPenalty = occupancyRatio > 0.9 ? 50 : 0;

      const totalCost = dist + shelterRiskPenalty + capacityPenalty;
      if (totalCost < minCost) {
        minCost = totalCost;
        bestDestination = shelter;
      }
    }

    const hazardCheck = this.checkHazardProximity(userLat, userLng, disasters);

    // 2. Generate waypoint path avoiding hazard center
    const pathCoordinates: [number, number][] = [];
    pathCoordinates.push([userLat, userLng]);

    // If near hazard, bend path away from hazard center
    if (hazardCheck.closestDisaster && hazardCheck.status !== 'SAFE') {
      const dLat = hazardCheck.closestDisaster.lat;
      const dLng = hazardCheck.closestDisaster.lng;

      // Vector from hazard to user
      const vLat = userLat - dLat;
      const vLng = userLng - dLng;
      const mag = Math.sqrt(vLat * vLat + vLng * vLng) || 1;

      // Safe waypoint 4km further away from disaster
      const waypoint1: [number, number] = [
        userLat + (vLat / mag) * 0.04,
        userLng + (vLng / mag) * 0.04
      ];
      pathCoordinates.push(waypoint1);

      // Intermediate midpoint
      const midLat = (waypoint1[0] + bestDestination.lat) / 2;
      const midLng = (waypoint1[1] + bestDestination.lng) / 2;
      pathCoordinates.push([midLat, midLng]);
    } else {
      // Normal midpoint
      pathCoordinates.push([(userLat + bestDestination.lat) / 2, (userLng + bestDestination.lng) / 2]);
    }

    pathCoordinates.push([bestDestination.lat, bestDestination.lng]);

    // Total distance along path
    let totalDistKm = 0;
    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      totalDistKm += this.calculateDistanceKm(
        pathCoordinates[i][0],
        pathCoordinates[i][1],
        pathCoordinates[i + 1][0],
        pathCoordinates[i + 1][1]
      );
    }

    // Road speed ~ 35 km/h in emergency terrain
    const estimatedMinutes = Math.max(5, Math.round((totalDistKm / 35.0) * 60));

    // Turn-by-turn maneuvers
    const instructions = [
      {
        maneuver: hazardCheck.status === 'INSIDE_HAZARD' ? 'URGENT: Depart hazard area heading North-West' : 'Head towards secondary relief corridor',
        distanceMeters: 450,
        street: 'Arterial Evacuation Route 1'
      },
      {
        maneuver: 'Turn right onto designated Green Corridor',
        distanceMeters: Math.round(totalDistKm * 400),
        street: 'National Highway Feeder / SDRF Clear Path'
      },
      {
        maneuver: 'Continue straight through Emergency Checkpoint',
        distanceMeters: Math.round(totalDistKm * 450),
        street: `${bestDestination.name} Access Road`
      },
      {
        maneuver: `Arrive at Safe Haven: ${bestDestination.name}`,
        distanceMeters: 100,
        street: 'Shelter Reception & Medical Triage'
      }
    ];

    return {
      id: `route-${Date.now()}`,
      userLat,
      userLng,
      destination: bestDestination,
      pathCoordinates,
      totalDistanceKm: +totalDistKm.toFixed(2),
      estimatedMinutes,
      riskScore: hazardCheck.status === 'INSIDE_HAZARD' ? 88 : hazardCheck.status === 'NEAR_HAZARD' ? 52 : 15,
      hazardStatus: hazardCheck.status,
      instructions,
      isOfflineCalculated: true,
      calculatedAt: new Date().toISOString()
    };
  }
}
