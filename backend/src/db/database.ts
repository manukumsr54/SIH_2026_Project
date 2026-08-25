import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { 
  Disaster, 
  SatelliteObservation, 
  DamageAssessment, 
  RescueTeam, 
  RescueAssignment, 
  SafeLocation, 
  OfflineRegion, 
  SystemSettings,
  Notification,
  SystemAuditEvent
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InMemStore {
  disasters: Disaster[];
  satelliteObservations: SatelliteObservation[];
  damageAssessments: DamageAssessment[];
  rescueTeams: RescueTeam[];
  rescueAssignments: RescueAssignment[];
  safeLocations: SafeLocation[];
  offlineRegions: OfflineRegion[];
  notifications: Notification[];
  settings: SystemSettings;
  systemEvents: SystemAuditEvent[];
}

class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPgConnected: boolean = false;
  private storeFile: string = path.join(__dirname, '../../data_store.json');
  
  public store: InMemStore = {
    disasters: [],
    satelliteObservations: [],
    damageAssessments: [],
    rescueTeams: [],
    rescueAssignments: [],
    safeLocations: [],
    offlineRegions: [],
    notifications: [],
    settings: {
      refreshInterval: '30s',
      criticalAlerts: true,
      highRiskAlerts: true,
      evacuationAlerts: true,
      mapStyle: 'Satellite',
      autoSync: true,
      offlineRegionsCached: ['Northern India', 'Eastern India', 'Western India']
    },
    systemEvents: []
  };

  constructor() {
    this.loadFromDisk();
  }

  public async init(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/raksha';
    try {
      this.pool = new pg.Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 3000,
        max: 10
      });
      
      const client = await this.pool.connect();
      this.isPgConnected = true;
      console.log('✅ Connected to PostgreSQL database at', dbUrl.replace(/:[^:@]+@/, ':***@'));
      
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        try {
          await client.query(schemaSql);
          console.log('✅ PostgreSQL Schema initialized successfully');
        } catch (e: any) {
          console.warn('⚠️ PostgreSQL Schema execution notice:', e.message);
        }
      }
      client.release();
    } catch (err: any) {
      console.warn('ℹ️ PostgreSQL not directly accessible (' + err.message + '). Using local resilient state store with zero data loss.');
      this.isPgConnected = false;
    }
  }

  public isConnected(): boolean {
    return this.isPgConnected;
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }

  public saveToDisk(): void {
    try {
      fs.writeFileSync(this.storeFile, JSON.stringify(this.store, null, 2));
    } catch (err: any) {
      console.error('Failed to persist local store to disk:', err.message);
    }
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storeFile)) {
        const data = fs.readFileSync(this.storeFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.store = { ...this.store, ...parsed };
      }
    } catch (err: any) {
      console.warn('No existing disk store found, initializing fresh store.');
    }
  }

  private eventListeners: ((type: string, data: any) => void)[] = [];

  public onBroadcast(listener: (type: string, data: any) => void): void {
    this.eventListeners.push(listener);
  }

  private notifyListeners(type: string, data: any): void {
    for (const listener of this.eventListeners) {
      try {
        listener(type, data);
      } catch (err) {
        // non-blocking
      }
    }
  }

  public async addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.store.notifications.unshift(newNotif);
    if (this.store.notifications.length > 100) {
      this.store.notifications = this.store.notifications.slice(0, 100);
    }
    this.saveToDisk();
    this.notifyListeners('NOTIFICATION_ADDED', newNotif);
    return newNotif;
  }

  public async logEvent(
    eventTypeOrOptions: string | {
      eventType: string;
      category?: 'RESCUE' | 'DISASTER' | 'SATELLITE' | 'DAMAGE' | 'OFFLINE' | 'SYSTEM' | 'ALERT';
      severity?: 'Critical' | 'High' | 'Medium' | 'Info' | 'Success';
      title?: string;
      description?: string;
      entityType?: string;
      entityId?: string;
      metadata?: any;
      payload?: any;
      createNotification?: boolean;
    },
    legacyPayload?: any
  ): Promise<any> {
    let eventType: string;
    let category: 'RESCUE' | 'DISASTER' | 'SATELLITE' | 'DAMAGE' | 'OFFLINE' | 'SYSTEM' | 'ALERT' = 'SYSTEM';
    let severity: 'Critical' | 'High' | 'Medium' | 'Info' | 'Success' = 'Info';
    let title: string;
    let description: string;
    let entityType: string | undefined;
    let entityId: string | undefined;
    let metadata: any = {};
    let createNotification = false;

    if (typeof eventTypeOrOptions === 'string') {
      eventType = eventTypeOrOptions;
      metadata = legacyPayload || {};
      
      if (eventType.startsWith('TEAM_')) {
        category = 'RESCUE';
        severity = eventType.includes('ASSIGNED') ? 'Info' : 'Medium';
        title = eventType.includes('ASSIGNED') ? `Rescue Team Assigned: ${metadata.teamName || 'Team'}` : `Rescue Team De-assigned: ${metadata.teamName || 'Team'}`;
        description = metadata.disasterName ? `${metadata.teamName} deployed to ${metadata.disasterName}` : `${metadata.teamName} returned to available pool`;
        entityType = 'RescueTeam';
        entityId = metadata.teamId;
      } else if (eventType.startsWith('DISASTER_')) {
        category = 'DISASTER';
        severity = 'High';
        title = metadata.name ? `Disaster Incident: ${metadata.name}` : `Disaster Zone Updated`;
        description = `Risk Score: ${metadata.riskScore || 80}/100`;
        entityType = 'Disaster';
        entityId = metadata.disasterId;
      } else if (eventType.startsWith('SATELLITE_')) {
        category = 'SATELLITE';
        severity = 'Info';
        title = metadata.source ? `Satellite Data Ingested: ${metadata.source}` : `Satellite Telemetry Updated`;
        description = metadata.mode || 'Earth observation scan processed';
        entityType = 'Satellite';
      } else if (eventType.startsWith('DAMAGE_')) {
        category = 'DAMAGE';
        severity = 'Medium';
        title = metadata.sectorName ? `Damage Assessment: ${metadata.sectorName}` : `Infrastructure Damage Assessed`;
        description = metadata.analysisMethod || 'Structural triage updated';
        entityType = 'DamageAssessment';
      } else if (eventType.startsWith('OFFLINE_')) {
        category = 'OFFLINE';
        severity = 'Info';
        title = metadata.name ? `Offline Region Cached: ${metadata.name}` : `Offline Navigation Route Generated`;
        description = 'Available for disconnected emergency navigation';
        entityType = 'OfflineRegion';
      } else {
        category = 'SYSTEM';
        severity = 'Info';
        title = eventType.replace(/_/g, ' ');
        description = JSON.stringify(metadata);
      }
    } else {
      eventType = eventTypeOrOptions.eventType;
      category = eventTypeOrOptions.category || 'SYSTEM';
      severity = eventTypeOrOptions.severity || 'Info';
      title = eventTypeOrOptions.title || eventType.replace(/_/g, ' ');
      description = eventTypeOrOptions.description || '';
      entityType = eventTypeOrOptions.entityType;
      entityId = eventTypeOrOptions.entityId;
      metadata = eventTypeOrOptions.metadata || eventTypeOrOptions.payload || {};
      createNotification = eventTypeOrOptions.createNotification ?? false;
    }

    const now = new Date();
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      category,
      severity,
      title,
      description,
      entityType,
      entityId,
      metadata,
      payload: metadata,
      createdAt: now.toISOString(),
      timestamp: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST',
      acknowledged: false
    };

    this.store.systemEvents.unshift(event);
    if (this.store.systemEvents.length > 500) {
      this.store.systemEvents = this.store.systemEvents.slice(0, 500);
    }

    if (createNotification) {
      await this.addNotification({
        title,
        description,
        timestamp: 'Just now',
        severity,
        category,
        entityId
      });
    }

    this.saveToDisk();

    if (this.isPgConnected && this.pool) {
      try {
        await this.pool.query(
          'INSERT INTO system_events (id, event_type, payload, created_at) VALUES ($1, $2, $3, $4)',
          [event.id, event.eventType, JSON.stringify(event), event.createdAt]
        );
      } catch (err: any) {
        // non-blocking
      }
    }

    this.notifyListeners('EVENT_LOGGED', event);
    return event;
  }
}

export const db = new DatabaseService();
