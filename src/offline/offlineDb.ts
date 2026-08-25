import type { Disaster, SafeLocation, OfflineRegion } from '../types';

const DB_NAME = 'raksha_offline_db';
const DB_VERSION = 1;

export class OfflineDatabase {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return;
      }
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('regions')) {
          db.createObjectStore('regions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('disasters')) {
          db.createObjectStore('disasters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('safeLocations')) {
          db.createObjectStore('safeLocations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('locationHistory')) {
          db.createObjectStore('locationHistory', { keyPath: 'timestamp' });
        }
      };
      req.onsuccess = (e: any) => resolve(e.target.result);
      req.onerror = (e: any) => reject(e.target.error);
    });
  }

  public async saveCachedRegion(region: OfflineRegion, disasters: Disaster[], safeLocations: SafeLocation[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['regions', 'disasters', 'safeLocations'], 'readwrite');
    
    tx.objectStore('regions').put(region);
    disasters.forEach(d => tx.objectStore('disasters').put(d));
    safeLocations.forEach(s => tx.objectStore('safeLocations').put(s));

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getCachedDisasters(): Promise<Disaster[]> {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction('disasters', 'readonly');
      const req = tx.objectStore('disasters').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  public async getCachedSafeLocations(): Promise<SafeLocation[]> {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction('safeLocations', 'readonly');
      const req = tx.objectStore('safeLocations').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  public saveLastKnownLocation(lat: number, lng: number, accuracy: number): void {
    try {
      localStorage.setItem('raksha_last_location', JSON.stringify({
        lat,
        lng,
        accuracy,
        timestamp: Date.now()
      }));
    } catch (e) {
      // ignore
    }
  }

  public getLastKnownLocation(): { lat: number; lng: number; accuracy: number; timestamp: number } | null {
    try {
      const data = localStorage.getItem('raksha_last_location');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
}

export const offlineDb = new OfflineDatabase();
