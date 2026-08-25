export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Safe';
export type DataSourceType = 'REAL' | 'DEMO' | 'CACHED';
export type TeamStatus = 'Available' | 'On Mission' | 'Assigned' | 'En Route' | 'Returning' | 'Offline';

export interface SystemAuditEvent {
  id: string;
  eventType: string;
  category: 'RESCUE' | 'DISASTER' | 'SATELLITE' | 'DAMAGE' | 'OFFLINE' | 'SYSTEM' | 'ALERT';
  severity: 'Critical' | 'High' | 'Medium' | 'Info' | 'Success';
  title: string;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  payload?: any;
  createdAt: string;
  timestamp?: string;
  acknowledged?: boolean;
}

export type AuditLogEvent = SystemAuditEvent;

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Info' | 'Success';
  isRead: boolean;
  category: 'DISASTER' | 'RESCUE' | 'SATELLITE' | 'DAMAGE' | 'OFFLINE' | 'SYSTEM' | 'ALERT';
  entityId?: string;
  createdAt: string;
}

export interface SatelliteSourceStatus {
  id: string;
  name: string;
  type: 'SAR' | 'Optical' | 'Meteorological' | 'Thermal';
  status: 'Online' | 'Monitoring' | 'Standby';
  isLiveConnected: boolean;
  resolution: string;
  revisitDays: string;
  operator: string;
}

export interface SatelliteStatusResponse {
  totalSources: number;
  onlineCount: number;
  monitoringCount: number;
  lastSynchronization: string;
  sources: SatelliteSourceStatus[];
  disclaimer: string;
}

export interface Disaster {
  id: string;
  name: string;
  sector: string;
  type: string;
  riskLevel: RiskLevel;
  riskScore: number;
  lat: number;
  lng: number;
  affectedPopulation: number;
  severity: number;
  infrastructureDamage: number;
  urgency: number;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  source: string;
  sourceEventId?: string;
  confidence: number;
  detectedAt: string;
  lastUpdatedAt: string;
  country: string;
  state: string;
  district?: string;
  cityArea?: string;
  dataSourceType: DataSourceType;
  geometry?: any;
  scoreBreakdown?: {
    severityWeight: number;
    populationWeight: number;
    infrastructureWeight: number;
    urgencyWeight: number;
    hazardFactor: number;
  };
}

export interface DisasterZone {
  id: string;
  disasterId: string;
  name: string;
  riskLevel: RiskLevel;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  polygonGeojson?: any;
  affectedFacilities: string[];
}

export interface SatelliteObservation {
  id: string;
  source: string; // e.g. Sentinel-1 SAR, Sentinel-2 Optical, Landsat 9
  satellite: string;
  sensor: string;
  mode: string;
  timestamp: string;
  locationName: string;
  lat: number;
  lng: number;
  bbox: [number, number, number, number];
  cloudCoverage: number;
  resolution: string;
  imageUrl: string;
  rawBandUrl?: string;
  processingLevel: string;
  dataSourceType: DataSourceType;
  disasterId?: string;
  observationStatus: 'RECENT OBSERVATION' | 'ARCHIVED' | 'SYNCHRONIZING';
  acquisitionDate: string;
}

export interface DamageAssessment {
  id: string;
  disasterId: string;
  sectorName: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  damageMapUrl: string;
  confidence: number;
  destroyedBuildings: number;
  severeDamage: number;
  moderateDamage: number;
  minorDamage: number;
  safeBuildings: number;
  populationAffected: number;
  sourceSensors: string;
  beforeTimestamp: string;
  afterTimestamp: string;
  assessmentTimestamp: string;
  dataSourceType: DataSourceType;
  analysisMethod: string;
  evidenceNotes: string;
  damageZonesGeojson?: any;
}

export interface RescueTeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
}

export interface RescueTeam {
  id: string;
  name: string;
  status: 'Available' | 'On Mission' | 'Assigned' | 'En Route' | 'Returning' | 'Offline';
  lat: number;
  lng: number;
  distanceKm: number;
  capacity: number;
  equipment: string[];
  members: RescueTeamMember[];
  assignedDisasterId?: string;
  lastLocationUpdate: string;
  baseStation: string;
}

export interface RescueAssignment {
  id: string;
  teamId: string;
  disasterId: string;
  assignedAt: string;
  endedAt?: string;
  status: 'DEPLOYED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED' | 'DEASSIGNED' | 'CANCELLED';
  notes?: string;
}

export interface SafeLocation {
  id: string;
  name: string;
  type: 'evacuation_center' | 'hospital' | 'relief_camp' | 'safe_zone';
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  status: 'OPEN' | 'NEAR_CAPACITY' | 'FULL';
  contact: string;
  facilities: string[];
  regionId?: string;
}

export interface OfflineRegion {
  id: string;
  name: string;
  state: string;
  status: 'Cached' | 'Sync Required' | 'Available';
  sizeMb: number;
  lastSync: string;
  centerLat: number;
  centerLng: number;
  bounds: [[number, number], [number, number]];
  safeLocationsCount: number;
  roadNodesCount: number;
}

export interface EvacuationRoute {
  id: string;
  userLat: number;
  userLng: number;
  destination: SafeLocation;
  pathCoordinates: [number, number][];
  totalDistanceKm: number;
  estimatedMinutes: number;
  riskScore: number;
  hazardStatus: 'INSIDE_HAZARD' | 'NEAR_HAZARD' | 'SAFE';
  instructions: {
    maneuver: string;
    distanceMeters: number;
    street: string;
  }[];
  isOfflineCalculated: boolean;
  calculatedAt: string;
}

export interface SystemSettings {
  refreshInterval: string;
  criticalAlerts: boolean;
  highRiskAlerts: boolean;
  evacuationAlerts: boolean;
  mapStyle: string;
  autoSync: boolean;
  offlineRegionsCached: string[];
}

export interface SystemStatus {
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  lastUpdated: string;
  databaseStatus: 'HEALTHY' | 'DISCONNECTED';
  providers: {
    usgsEarthquake: { status: 'ONLINE' | 'STANDBY' | 'DEGRADED'; lastSync: string; eventCount: number };
    nasaFirms: { status: 'ONLINE' | 'STANDBY' | 'DEGRADED'; lastSync: string; hotspotCount: number };
    copernicusSentinel: { status: 'ONLINE' | 'STANDBY' | 'DEMO_FALLBACK'; lastSync: string };
    valhallaRouting: { status: 'ONLINE' | 'CLIENT_OFFLINE_READY'; cachedRegions: number };
  };
  activeDisastersCount: number;
  criticalDisastersCount: number;
  activeRescueTeamsCount: number;
  totalAffectedPopulation: number;
}

export interface DashboardSummary {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  safeCount: number;
  affectedPopulation: number;
  activeDisasters: Disaster[];
  latestSatelliteObservation: SatelliteObservation | null;
  satelliteFeeds: SatelliteObservation[];
  priorityQueue: Disaster[];
  rescueTeams: RescueTeam[];
  damageReports: DamageAssessment[];
  systemStatus: SystemStatus;
  notifications: Notification[];
}
