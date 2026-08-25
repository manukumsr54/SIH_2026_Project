import type { SatelliteObservation } from '../types/index.js';

export class SatelliteProvider {
  private lastSyncTime: string = 'Never';
  private status: 'ONLINE' | 'STANDBY' | 'DEMO_FALLBACK' = 'ONLINE';

  public getStatus() {
    return {
      status: this.status,
      lastSync: this.lastSyncTime
    };
  }

  public async fetchLatestObservations(): Promise<SatelliteObservation[]> {
    this.lastSyncTime = new Date().toISOString();
    
    // Check if Copernicus Data Space / STAC credentials exist
    const stacEndpoint = process.env.COPERNICUS_STAC_URL || 'https://catalogue.dataspace.copernicus.eu/stac';
    const clientId = process.env.COPERNICUS_CLIENT_ID;

    if (!clientId) {
      this.status = 'DEMO_FALLBACK';
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const searchUrl = `${stacEndpoint}/search?collections=SENTINEL-1,SENTINEL-2&bbox=68,6,98,36&limit=5`;
      const res = await fetch(searchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.status = 'ONLINE';
        const data = (await res.json()) as any;
        // Return normalized STAC features
        return (data.features || []).map((feat: any, idx: number) => ({
          id: feat.id || `stac-${idx}`,
          source: feat.collection?.includes('1') ? 'Sentinel-1 SAR' : 'Sentinel-2 Optical',
          sensor: feat.properties?.instruments?.[0] || 'C-SAR / MSI',
          mode: feat.properties?.['sar:instrument_mode'] || 'True Color (B4,B3,B2)',
          timestamp: feat.properties?.datetime || new Date().toISOString(),
          locationName: feat.properties?.['area:name'] || 'Indian Subcontinent Sector',
          lat: (feat.bbox?.[1] + feat.bbox?.[3]) / 2 || 22.0,
          lng: (feat.bbox?.[0] + feat.bbox?.[2]) / 2 || 80.0,
          bbox: feat.bbox || [78, 28, 80, 30],
          cloudCoverage: feat.properties?.['eo:cloud_cover'] || 0,
          resolution: '10m / px',
          imageUrl: feat.assets?.visual?.href || feat.assets?.thumbnail?.href || '',
          processingLevel: feat.properties?.['processing:level'] || 'Level-2A BOA',
          dataSourceType: 'REAL'
        }));
      }
    } catch (err: any) {
      this.status = 'DEMO_FALLBACK';
    }

    return [];
  }
}

export const satelliteProvider = new SatelliteProvider();
