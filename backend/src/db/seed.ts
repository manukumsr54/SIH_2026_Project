import { db } from './database.js';
import type { 
  Disaster, 
  SatelliteObservation, 
  DamageAssessment, 
  RescueTeam, 
  SafeLocation, 
  OfflineRegion,
  Notification
} from '../types/index.js';

export const initialNotifications: Notification[] = [
  {
    id: 'notif-01',
    title: 'High-risk flood zone detected',
    description: 'Odisha coastal sector requires immediate attention. Surge level exceeds 2.8m above datum.',
    timestamp: '2 min ago',
    severity: 'Critical',
    isRead: false,
    category: 'DISASTER',
    entityId: 'd2-odisha-cyclone',
    createdAt: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'notif-02',
    title: 'Sentinel-1 SAR Observation Ingested',
    description: 'Cloud-penetrating SAR scan of Alaknanda River Basin updated with 10m resolution flood extent.',
    timestamp: '14 min ago',
    severity: 'Medium',
    isRead: false,
    category: 'SATELLITE',
    entityId: 'sat-obs-001',
    createdAt: new Date(Date.now() - 840000).toISOString()
  },
  {
    id: 'notif-03',
    title: 'Rescue Unit Alpha Dispatched',
    description: 'NDRF Team Alpha mobilized to Uttarakhand Flash Flood Zone with amphibious crafts.',
    timestamp: '28 min ago',
    severity: 'Info',
    isRead: true,
    category: 'RESCUE',
    entityId: 't1',
    createdAt: new Date(Date.now() - 1680000).toISOString()
  },
  {
    id: 'notif-04',
    title: 'Damage Assessment Model Executed',
    description: 'Automated bi-temporal change detection classified 142 destroyed and 385 severely damaged buildings.',
    timestamp: '45 min ago',
    severity: 'High',
    isRead: true,
    category: 'DAMAGE',
    entityId: 'dmg-rep-001',
    createdAt: new Date(Date.now() - 2700000).toISOString()
  },
  {
    id: 'notif-05',
    title: 'Northern India Offline Pack Synced',
    description: '1,540 road network nodes and 42 emergency shelters successfully cached for disconnected use.',
    timestamp: '1 hour ago',
    severity: 'Success',
    isRead: true,
    category: 'OFFLINE',
    entityId: 'reg-north-in',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const initialDisasters: Disaster[] = [
  {
    id: 'd1-uttarakhand-flood',
    name: 'Uttarakhand Flash Flood Zone',
    sector: 'Sector 04',
    type: 'Flash Flood',
    riskLevel: 'Critical',
    riskScore: 96,
    lat: 30.0668,
    lng: 79.0193,
    affectedPopulation: 12400,
    severity: 95,
    infrastructureDamage: 90,
    urgency: 100,
    status: 'ACTIVE',
    source: 'Sentinel-1 SAR + CWC River Sensor',
    confidence: 96,
    detectedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    country: 'India',
    state: 'Uttarakhand',
    district: 'Chamoli',
    cityArea: 'Alaknanda River Basin',
    dataSourceType: 'DEMO',
    scoreBreakdown: {
      severityWeight: 33.25,
      populationWeight: 25.0,
      infrastructureWeight: 18.0,
      urgencyWeight: 20.0,
      hazardFactor: 1.05
    }
  },
  {
    id: 'd2-odisha-cyclone',
    name: 'Odisha Coastal Cyclone Impact',
    sector: 'Sector 08',
    type: 'Cyclone Impact',
    riskLevel: 'High',
    riskScore: 91,
    lat: 20.9517,
    lng: 85.0985,
    affectedPopulation: 31000,
    severity: 85,
    infrastructureDamage: 80,
    urgency: 90,
    status: 'ACTIVE',
    source: 'INSAT-3DR + Sentinel-2 Optical',
    confidence: 93,
    detectedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    country: 'India',
    state: 'Odisha',
    district: 'Puri & Jagatsinghpur',
    cityArea: 'Bay of Bengal Coastline',
    dataSourceType: 'DEMO',
    scoreBreakdown: {
      severityWeight: 29.75,
      populationWeight: 24.5,
      infrastructureWeight: 16.0,
      urgencyWeight: 18.0,
      hazardFactor: 1.03
    }
  },
  {
    id: 'd3-gujarat-landslide',
    name: 'Gujarat Hill Slope Landslide Risk',
    sector: 'Sector 12',
    type: 'Landslide Area',
    riskLevel: 'Medium',
    riskScore: 78,
    lat: 22.2587,
    lng: 71.1924,
    affectedPopulation: 24000,
    severity: 70,
    infrastructureDamage: 65,
    urgency: 75,
    status: 'ACTIVE',
    source: 'Cartosat-3 Terrain InSAR',
    confidence: 88,
    detectedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    country: 'India',
    state: 'Gujarat',
    district: 'Gir Somnath / Junagadh',
    cityArea: 'Western Range',
    dataSourceType: 'DEMO',
    scoreBreakdown: {
      severityWeight: 24.5,
      populationWeight: 20.0,
      infrastructureWeight: 13.0,
      urgencyWeight: 15.0,
      hazardFactor: 1.0
    }
  },
  {
    id: 'd4-kerala-heavyrain',
    name: 'Kerala Heavy Rainfall & Siltation',
    sector: 'Sector 15',
    type: 'Heavy Rainfall',
    riskLevel: 'Safe',
    riskScore: 65,
    lat: 10.8505,
    lng: 76.2711,
    affectedPopulation: 18000,
    severity: 50,
    infrastructureDamage: 40,
    urgency: 50,
    status: 'ACTIVE',
    source: 'IMD Doppler Radar + Sentinel-3 OLCI',
    confidence: 91,
    detectedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    country: 'India',
    state: 'Kerala',
    district: 'Wayanad / Idukki',
    cityArea: 'Western Ghats Catchment',
    dataSourceType: 'DEMO',
    scoreBreakdown: {
      severityWeight: 17.5,
      populationWeight: 18.0,
      infrastructureWeight: 8.0,
      urgencyWeight: 10.0,
      hazardFactor: 1.0
    }
  },
  {
    id: 'd5-assam-brahmaputra',
    name: 'Assam Brahmaputra River Spate',
    sector: 'Sector 02',
    type: 'River Inundation',
    riskLevel: 'High',
    riskScore: 88,
    lat: 26.2006,
    lng: 92.9376,
    affectedPopulation: 42000,
    severity: 82,
    infrastructureDamage: 76,
    urgency: 84,
    status: 'ACTIVE',
    source: 'Sentinel-1 SAR Water Extent',
    confidence: 95,
    detectedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    country: 'India',
    state: 'Assam',
    district: 'Kaziranga & Nagaon',
    cityArea: 'Central Brahmaputra Basin',
    dataSourceType: 'DEMO',
    scoreBreakdown: {
      severityWeight: 28.7,
      populationWeight: 25.0,
      infrastructureWeight: 15.2,
      urgencyWeight: 16.8,
      hazardFactor: 1.02
    }
  }
];

export const initialSatelliteFeeds: SatelliteObservation[] = [
  {
    id: 'sat-obs-001',
    source: 'Sentinel-1 SAR',
    satellite: 'SENTINEL-1',
    sensor: 'C-SAR (Synthetic Aperture Radar)',
    mode: 'SAR (Cloud Penetration)',
    timestamp: '24 Aug 2026, 10:24 IST',
    acquisitionDate: '2026-08-24T04:54:00Z',
    locationName: 'Odisha Coastal Reach / Mahanadi Delta',
    lat: 20.9517,
    lng: 85.0985,
    bbox: [84.7, 20.6, 85.4, 21.2],
    cloudCoverage: 0.0,
    resolution: '10m / px',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=800&auto=format&fit=crop',
    rawBandUrl: '/assets/satellites/sentinel-1-sar.jpg',
    processingLevel: 'Level-1 GRD (Ground Range Detected)',
    dataSourceType: 'DEMO',
    observationStatus: 'RECENT OBSERVATION',
    disasterId: 'd2-odisha-cyclone'
  },
  {
    id: 'sat-obs-002',
    source: 'Sentinel-2 Optical',
    satellite: 'SENTINEL-2',
    sensor: 'MSI (Multi-Spectral Instrument)',
    mode: 'True Color (B4, B3, B2 RGB)',
    timestamp: '23 Aug 2026, 16:42 IST',
    acquisitionDate: '2026-08-23T11:12:00Z',
    locationName: 'Gujarat Coastal Region / Gir Range',
    lat: 22.2587,
    lng: 71.1924,
    bbox: [70.8, 21.8, 71.6, 22.6],
    cloudCoverage: 6.2,
    resolution: '10m / px',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    rawBandUrl: '/assets/satellites/sentinel-2-optical.jpg',
    processingLevel: 'Level-2A Bottom of Atmosphere (BOA)',
    dataSourceType: 'DEMO',
    observationStatus: 'RECENT OBSERVATION',
    disasterId: 'd3-gujarat-landslide'
  },
  {
    id: 'sat-obs-003',
    source: 'Landsat 9 Optical',
    satellite: 'LANDSAT 9',
    sensor: 'OLI-2 (Operational Land Imager 2)',
    mode: 'Multi-Spectral & SWIR',
    timestamp: '23 Aug 2026, 11:18 IST',
    acquisitionDate: '2026-08-23T05:48:00Z',
    locationName: 'Uttarakhand Mountain Basin / Chamoli',
    lat: 30.0668,
    lng: 79.0193,
    bbox: [78.8, 29.8, 79.3, 30.3],
    cloudCoverage: 4.1,
    resolution: '15m (Pan) / 30m',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop',
    rawBandUrl: '/assets/satellites/landsat-9.jpg',
    processingLevel: 'Collection 2 Level-2 Science Product',
    dataSourceType: 'DEMO',
    observationStatus: 'RECENT OBSERVATION',
    disasterId: 'd1-uttarakhand-flood'
  }
];

export const initialDamageReports: DamageAssessment[] = [
  {
    id: 'dmg-rep-001',
    disasterId: 'd1-uttarakhand-flood',
    sectorName: 'Sector 04 (Alaknanda Basin)',
    beforeImageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop&tint=sepia',
    damageMapUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0eddebd?q=80&w=800&auto=format&fit=crop',
    confidence: 94,
    destroyedBuildings: 142,
    severeDamage: 385,
    moderateDamage: 890,
    minorDamage: 2100,
    safeBuildings: 4850,
    populationAffected: 12400,
    sourceSensors: 'Sentinel-1 SAR Interferometry + Sentinel-2 MSI Multi-Temporal',
    beforeTimestamp: '2026-08-10 09:30 IST',
    afterTimestamp: '2026-08-24 10:24 IST',
    assessmentTimestamp: '2026-08-24 10:42 IST',
    dataSourceType: 'DEMO',
    analysisMethod: 'Bi-temporal Coherence Difference + Building Footprint Overlap',
    evidenceNotes: 'SAR backscatter loss indicating extensive riverbed expansion and structural washouts across 3.4 sq km.'
  },
  {
    id: 'dmg-rep-002',
    disasterId: 'd2-odisha-cyclone',
    sectorName: 'Sector 08 (Puri Coastal Reach)',
    beforeImageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop&tint=sepia',
    damageMapUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0eddebd?q=80&w=800&auto=format&fit=crop',
    confidence: 91,
    destroyedBuildings: 98,
    severeDamage: 412,
    moderateDamage: 1120,
    minorDamage: 3400,
    safeBuildings: 9200,
    populationAffected: 31000,
    sourceSensors: 'Sentinel-2 Optical + INSAT-3DR Wind Radiance',
    beforeTimestamp: '2026-08-15 11:00 IST',
    afterTimestamp: '2026-08-24 10:15 IST',
    assessmentTimestamp: '2026-08-24 10:30 IST',
    dataSourceType: 'DEMO',
    analysisMethod: 'Optical NDWI (Normalized Difference Water Index) Thresholding',
    evidenceNotes: 'Coastal storm surge inundation detected reaching 1.2 km inland across low-lying agricultural zones.'
  }
];

export const initialRescueTeams: RescueTeam[] = [
  {
    id: 't1',
    name: 'NDRF Team Alpha (Uttarakhand)',
    status: 'Available',
    lat: 29.98,
    lng: 79.15,
    distanceKm: 2.1,
    capacity: 18,
    equipment: ['Amphibious Craft', 'Heavy Inflatable Boats', 'Hydraulic Cutters', 'Mobile Trauma Kit'],
    members: [
      { id: 'm1', name: 'Capt. Rajesh Varma', role: 'Team Commander' },
      { id: 'm2', name: 'Dr. Anita Roy', role: 'Chief Medical Officer' },
      { id: 'm3', name: 'Sgt. Vikram Rawat', role: 'SAR Diver' },
      { id: 'm4', name: 'Karan Negi', role: 'Drone Operator' }
    ],
    lastLocationUpdate: new Date().toISOString(),
    baseStation: 'Joshimath Forward Staging Base'
  },
  {
    id: 't2',
    name: 'SDRF Team Bravo (Garhwal)',
    status: 'Available',
    lat: 30.12,
    lng: 78.92,
    distanceKm: 4.3,
    capacity: 14,
    equipment: ['High-Altitude Ropes', 'Satellite Comms SatPhone', 'Thermal SAR Scanner'],
    members: [
      { id: 'm5', name: 'Insp. Sunita Bisht', role: 'Field Lead' },
      { id: 'm6', name: 'Praveen Joshi', role: 'Mountain Rescue Specialist' }
    ],
    lastLocationUpdate: new Date().toISOString(),
    baseStation: 'Rishikesh Emergency Hub'
  },
  {
    id: 't3',
    name: 'ODRAF Coastal Taskforce Charlie',
    status: 'On Mission',
    assignedDisasterId: 'd2-odisha-cyclone',
    lat: 20.95,
    lng: 85.12,
    distanceKm: 6.7,
    capacity: 22,
    equipment: ['Tree Clearing Chainsaws', 'High-Discharge Dewatering Pumps', 'Ambulance Unit'],
    members: [
      { id: 'm7', name: 'Maj. Pradeep Jena', role: 'Coastal Operations Lead' },
      { id: 'm8', name: 'Subrat Patnaik', role: 'Paramedic' }
    ],
    lastLocationUpdate: new Date().toISOString(),
    baseStation: 'Bhubaneswar Disaster HQ'
  },
  {
    id: 't4',
    name: 'Gujarat Quick Response Delta',
    status: 'Available',
    lat: 22.18,
    lng: 71.05,
    distanceKm: 8.9,
    capacity: 12,
    equipment: ['Earth Movers Support', 'Structural Shoring', 'Canine Search Unit'],
    members: [
      { id: 'm9', name: 'Ramesh Patel', role: 'Civil Defense Engineer' }
    ],
    lastLocationUpdate: new Date().toISOString(),
    baseStation: 'Rajkot Emergency Operations Center'
  }
];

export const initialSafeLocations: SafeLocation[] = [
  // Uttarakhand Safe Locations
  {
    id: 'safe-01',
    name: 'Joshimath Central Evacuation Center',
    type: 'evacuation_center',
    lat: 30.555,
    lng: 79.567,
    capacity: 1500,
    currentOccupancy: 340,
    status: 'OPEN',
    contact: '+91-1372-222100',
    facilities: ['Emergency Medical Wing', 'High-Capacity Generators', 'RO Drinking Water', 'Helipad Access'],
    regionId: 'reg-north-in'
  },
  {
    id: 'safe-02',
    name: 'Chamoli District Civil Hospital',
    type: 'hospital',
    lat: 30.412,
    lng: 79.324,
    capacity: 600,
    currentOccupancy: 280,
    status: 'OPEN',
    contact: '+91-1372-252102',
    facilities: ['ICU Beds', 'Blood Bank', 'Surgical Suites', '24/7 Trauma Service'],
    regionId: 'reg-north-in'
  },
  {
    id: 'safe-03',
    name: 'Gopeshwar SDRF Relief Shelter',
    type: 'relief_camp',
    lat: 30.408,
    lng: 79.338,
    capacity: 2000,
    currentOccupancy: 850,
    status: 'OPEN',
    contact: '+91-1372-251000',
    facilities: ['Food Ration Supplies', 'Satellite Wifi Hotspot', 'Sanitation Facilities'],
    regionId: 'reg-north-in'
  },
  // Odisha Safe Locations
  {
    id: 'safe-04',
    name: 'Puri Multi-Purpose Cyclone Shelter',
    type: 'evacuation_center',
    lat: 19.813,
    lng: 85.831,
    capacity: 3500,
    currentOccupancy: 1200,
    status: 'OPEN',
    contact: '+91-6752-223400',
    facilities: ['Reinforced Concrete Dome', 'Dewatering Pumps', 'Emergency Kitchen'],
    regionId: 'reg-east-in'
  },
  {
    id: 'safe-05',
    name: 'Jagatsinghpur District Emergency Hospital',
    type: 'hospital',
    lat: 20.264,
    lng: 86.168,
    capacity: 800,
    currentOccupancy: 410,
    status: 'OPEN',
    contact: '+91-6724-220050',
    facilities: ['Trauma Center', 'Oxygen Plants', 'Power Backup'],
    regionId: 'reg-east-in'
  },
  // Gujarat Safe Locations
  {
    id: 'safe-06',
    name: 'Junagadh District Evacuation Base',
    type: 'evacuation_center',
    lat: 21.522,
    lng: 70.457,
    capacity: 2200,
    currentOccupancy: 620,
    status: 'OPEN',
    contact: '+91-285-2630100',
    facilities: ['Earthquake Resistant Hall', 'Ambulance Fleet', 'Ration Stockpile'],
    regionId: 'reg-west-in'
  },
  {
    id: 'safe-07',
    name: 'Gir Somnath Civil Hospital',
    type: 'hospital',
    lat: 20.904,
    lng: 70.366,
    capacity: 750,
    currentOccupancy: 390,
    status: 'OPEN',
    contact: '+91-2876-220100',
    facilities: ['Emergency Ward', 'Helipad', 'Triage Station'],
    regionId: 'reg-west-in'
  }
];

export const initialOfflineRegions: OfflineRegion[] = [
  {
    id: 'reg-north-in',
    name: 'Northern India',
    state: 'Uttarakhand, Himachal & J&K',
    status: 'Cached',
    sizeMb: 1840,
    lastSync: '10:24 AM IST',
    centerLat: 30.0668,
    centerLng: 79.0193,
    bounds: [[28.5, 77.5], [31.5, 81.0]],
    safeLocationsCount: 42,
    roadNodesCount: 1540
  },
  {
    id: 'reg-east-in',
    name: 'Eastern India',
    state: 'Odisha, West Bengal & Assam',
    status: 'Cached',
    sizeMb: 2150,
    lastSync: '10:15 AM IST',
    centerLat: 20.9517,
    centerLng: 85.0985,
    bounds: [[19.0, 83.5], [23.5, 87.5]],
    safeLocationsCount: 56,
    roadNodesCount: 2180
  },
  {
    id: 'reg-south-in',
    name: 'Southern India',
    state: 'Kerala, Tamil Nadu & Andhra',
    status: 'Sync Required',
    sizeMb: 1520,
    lastSync: 'Yesterday, 8:00 PM IST',
    centerLat: 10.8505,
    centerLng: 76.2711,
    bounds: [[8.2, 74.8], [13.5, 78.5]],
    safeLocationsCount: 38,
    roadNodesCount: 1390
  },
  {
    id: 'reg-west-in',
    name: 'Western India',
    state: 'Gujarat, Maharashtra & Rajasthan',
    status: 'Cached',
    sizeMb: 1920,
    lastSync: '10:05 AM IST',
    centerLat: 22.2587,
    centerLng: 71.1924,
    bounds: [[20.0, 68.5], [24.8, 74.0]],
    safeLocationsCount: 49,
    roadNodesCount: 1870
  }
];

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding RAKSHA database...');
  db.store.disasters = initialDisasters;
  db.store.satelliteObservations = initialSatelliteFeeds;
  db.store.damageAssessments = initialDamageReports;
  db.store.rescueTeams = initialRescueTeams;
  db.store.safeLocations = initialSafeLocations;
  db.store.offlineRegions = initialOfflineRegions;
  db.store.notifications = initialNotifications;
  
  await db.logEvent('SYSTEM_INITIALIZED', { 
    disastersCount: initialDisasters.length,
    rescueTeamsCount: initialRescueTeams.length,
    notificationsCount: initialNotifications.length,
    seedTime: new Date().toISOString()
  });

  db.saveToDisk();
  console.log('✅ Database seeded with', initialDisasters.length, 'disasters,', initialNotifications.length, 'notifications, and', initialSafeLocations.length, 'safe shelters.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  db.init().then(() => seedDatabase()).then(() => process.exit(0));
}
