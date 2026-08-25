import type { Disaster, RescueTeam, SatelliteFeed, DamageReport } from '../types';

export const mockDisasters: Disaster[] = [
  {
    id: 'd1',
    name: 'Uttarakhand Flood Zone',
    sector: 'Sector 04',
    type: 'Flash Flood',
    riskLevel: 'Critical',
    riskScore: 96,
    affectedPopulation: 12400,
    lat: 30.0668,
    lng: 79.0193, // Uttarakhand area
    timestamp: '10:24 AM IST',
    severity: 95,
    infrastructureDamage: 90,
    urgency: 100,
  },
  {
    id: 'd2',
    name: 'Odisha Coastal Cyclone',
    sector: 'Sector 08',
    type: 'Cyclone Impact',
    riskLevel: 'High',
    riskScore: 91,
    affectedPopulation: 31000,
    lat: 20.9517,
    lng: 85.0985, // Odisha area
    timestamp: '10:15 AM IST',
    severity: 85,
    infrastructureDamage: 80,
    urgency: 90,
  },
  {
    id: 'd3',
    name: 'Gujarat Landslide Risk',
    sector: 'Sector 12',
    type: 'Landslide Area',
    riskLevel: 'Medium',
    riskScore: 78,
    affectedPopulation: 24000,
    lat: 22.2587,
    lng: 71.1924, // Gujarat area
    timestamp: '09:45 AM IST',
    severity: 70,
    infrastructureDamage: 65,
    urgency: 75,
  },
  {
    id: 'd4',
    name: 'Kerala Heavy Rainfall',
    sector: 'Sector 15',
    type: 'Heavy Rainfall',
    riskLevel: 'Safe',
    riskScore: 65,
    affectedPopulation: 18000,
    lat: 10.8505,
    lng: 76.2711, // Kerala area
    timestamp: '09:30 AM IST',
    severity: 50,
    infrastructureDamage: 40,
    urgency: 50,
  }
];

// Placeholder realistic URLs - in a real app these would be tiles or actual satellite scans
export const mockSatelliteFeeds: SatelliteFeed[] = [
  {
    id: 'sat-obs-001',
    source: 'Sentinel-1 SAR',
    satellite: 'Sentinel-1',
    sensor: 'C-SAR (Synthetic Aperture Radar)',
    mode: 'SAR (Cloud Penetration)',
    timestamp: '10:24 AM IST',
    locationName: 'Odisha Coastal Reach / Mahanadi Delta',
    lat: 20.9517,
    lng: 85.0985,
    cloudCoverage: 0.0,
    resolution: '10m / px',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=800&auto=format&fit=crop',
    rawBandUrl: '/assets/satellites/sentinel-1-sar.jpg',
    processingLevel: 'Level-1 GRD (Ground Range Detected)',
    observationStatus: 'RECENT OBSERVATION',
    disasterId: 'd1'
  },
  {
    id: 'sat-obs-002',
    source: 'Sentinel-2 Optical',
    satellite: 'Sentinel-2',
    sensor: 'MSI (Multi-Spectral Instrument)',
    mode: 'True Color (B4, B3, B2 RGB)',
    timestamp: '10:15 AM IST',
    locationName: 'Gujarat Coastal Region / Gir Range',
    lat: 22.2587,
    lng: 71.1924,
    cloudCoverage: 6.2,
    resolution: '10m / px',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    rawBandUrl: '/assets/satellites/sentinel-2-optical.jpg',
    processingLevel: 'Level-2A Bottom of Atmosphere (BOA)',
    observationStatus: 'RECENT OBSERVATION',
    disasterId: 'd2'
  },
  {
    id: 'sat-obs-003',
    source: 'Landsat 9 Optical',
    satellite: 'Landsat 9',
    sensor: 'OLI-2 (Operational Land Imager 2)',
    mode: 'Multi-Spectral & SWIR',
    timestamp: '09:48 AM IST',
    locationName: 'Uttarakhand Mountain Basin / Chamoli',
    lat: 30.0668,
    lng: 79.0193,
    cloudCoverage: 4.1,
    resolution: '15m (Pan) / 30m',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop',
    rawBandUrl: '/assets/satellites/landsat-9.jpg',
    processingLevel: 'Collection 2 Level-2 Science Product',
    observationStatus: 'RECENT OBSERVATION',
    disasterId: 'd3'
  }
];

export const mockRescueTeams: RescueTeam[] = [
  {
    id: 't1',
    name: 'Team Alpha',
    distanceKm: 2.1,
    status: 'Available',
    lat: 29.9,
    lng: 79.1
  },
  {
    id: 't2',
    name: 'Team Bravo',
    distanceKm: 4.3,
    status: 'Available',
    lat: 30.1,
    lng: 78.9
  },
  {
    id: 't3',
    name: 'Team Charlie',
    distanceKm: 6.7,
    status: 'On Mission',
    assignedDisasterId: 'd2',
    lat: 21.0,
    lng: 85.0
  },
  {
    id: 't4',
    name: 'Team Delta',
    distanceKm: 8.9,
    status: 'Available',
    lat: 22.1,
    lng: 71.0
  }
];

export const mockDamageReports: DamageReport[] = [
  {
    id: 'r1',
    disasterId: 'd1',
    beforeImageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=400&auto=format&fit=crop', // City grid
    afterImageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=400&auto=format&fit=crop&tint=sepia', // Modified to look damaged/flooded
    damageMapUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0eddebd?q=80&w=400&auto=format&fit=crop', // Abstract gradient resembling heatmap
    confidence: 94,
    destroyedBuildings: 142,
    severeDamage: 385,
    moderateDamage: 890
  }
];
