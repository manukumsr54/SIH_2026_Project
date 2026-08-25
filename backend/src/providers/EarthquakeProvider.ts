import type { Disaster } from '../types/index.js';

export interface UsgsFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    url: string;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    title: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
}

export interface UsgsGeoJsonResponse {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    count: number;
  };
  features: UsgsFeature[];
}

export class EarthquakeProvider {
  public static readonly FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
  private lastSyncTime: string = 'Never';
  private lastCount: number = 0;
  private status: 'ONLINE' | 'STANDBY' | 'DEGRADED' = 'ONLINE';

  public getStatus() {
    return {
      status: this.status,
      lastSync: this.lastSyncTime,
      eventCount: this.lastCount
    };
  }

  public async fetchRealtimeEvents(): Promise<Disaster[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(EarthquakeProvider.FEED_URL, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`USGS HTTP ${res.status}`);
      }

      const data = (await res.json()) as UsgsGeoJsonResponse;
      this.lastSyncTime = new Date().toISOString();
      this.lastCount = data.features ? data.features.length : 0;
      this.status = 'ONLINE';

      // Filter and normalize quakes, with special highlight for Indian subcontinent [lat: 5 to 38, lng: 68 to 98]
      const results: Disaster[] = [];

      for (const f of data.features || []) {
        const [lng, lat, depth] = f.geometry.coordinates;
        const isIndiaRegion = lat >= 5.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0;
        const mag = f.properties.mag || 3.0;

        // Ingest if in India region OR significant global quake (mag >= 5.5)
        if (isIndiaRegion || mag >= 5.8) {
          const severity = Math.min(100, Math.round((mag / 8.0) * 100));
          const infraDamage = Math.min(100, Math.round(severity * (depth < 30 ? 0.9 : 0.6)));
          const urgency = Math.min(100, Math.round(severity * 0.95));
          const score = Math.round(severity * 0.35 + 20 + infraDamage * 0.20 + urgency * 0.20);
          
          let riskLevel: Disaster['riskLevel'] = 'Medium';
          if (score >= 90) riskLevel = 'Critical';
          else if (score >= 75) riskLevel = 'High';
          else if (score < 60) riskLevel = 'Safe';

          results.push({
            id: `usgs-${f.id}`,
            name: `${f.properties.place || 'Seismic Event'} (M${mag.toFixed(1)})`,
            sector: isIndiaRegion ? `Sector ${Math.abs(Math.round(lat)) % 20}` : 'Global Sector',
            type: 'Earthquake',
            riskLevel,
            riskScore: score,
            lat,
            lng,
            affectedPopulation: Math.round(mag * 4500),
            severity,
            infrastructureDamage: infraDamage,
            urgency,
            status: 'ACTIVE',
            source: 'USGS Real-time GeoJSON Feed',
            sourceEventId: f.id,
            confidence: 99,
            detectedAt: new Date(f.properties.time).toISOString(),
            lastUpdatedAt: new Date(f.properties.updated).toISOString(),
            country: isIndiaRegion ? 'India' : 'International',
            state: isIndiaRegion ? (f.properties.place.split(',')[1]?.trim() || 'Northern Boundary') : 'International',
            dataSourceType: 'REAL',
            scoreBreakdown: {
              severityWeight: +(severity * 0.35).toFixed(2),
              populationWeight: 20,
              infrastructureWeight: +(infraDamage * 0.20).toFixed(2),
              urgencyWeight: +(urgency * 0.20).toFixed(2),
              hazardFactor: depth < 20 ? 1.1 : 1.0
            }
          });
        }
      }

      return results;
    } catch (err: any) {
      console.warn('⚠️ USGS real-time fetch notice:', err.message, '- maintaining cached records.');
      this.status = 'STANDBY';
      return [];
    }
  }
}

export const earthquakeProvider = new EarthquakeProvider();
