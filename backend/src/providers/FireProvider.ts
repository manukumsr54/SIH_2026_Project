import type { Disaster } from '../types/index.js';

export class FireProvider {
  private lastSyncTime: string = 'Never';
  private lastCount: number = 0;
  private status: 'ONLINE' | 'STANDBY' | 'DEGRADED' = 'ONLINE';

  public getStatus() {
    return {
      status: this.status,
      lastSync: this.lastSyncTime,
      hotspotCount: this.lastCount
    };
  }

  public async fetchFireHotspots(): Promise<Disaster[]> {
    const mapKey = process.env.NASA_FIRMS_MAP_KEY;
    this.lastSyncTime = new Date().toISOString();
    
    if (!mapKey) {
      this.status = 'STANDBY';
      return [];
    }

    try {
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/70,10,90,30/1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NASA FIRMS HTTP ${res.status}`);
      const text = await res.text();
      const lines = text.trim().split('\n');
      
      this.lastCount = Math.max(0, lines.length - 1);
      this.status = 'ONLINE';
      return [];
    } catch (err: any) {
      this.status = 'STANDBY';
      return [];
    }
  }
}

export const fireProvider = new FireProvider();
