import { offlineDb } from './offlineDb';

export interface LocationState {
  lat: number;
  lng: number;
  accuracy: number;
  isLiveGps: boolean;
  timestamp: number;
  displayText: string;
}

export class OfflineLocationManager {
  private listeners: ((loc: LocationState) => void)[] = [];
  private currentLocation: LocationState;

  constructor() {
    const last = offlineDb.getLastKnownLocation();
    if (last) {
      this.currentLocation = {
        lat: last.lat,
        lng: last.lng,
        accuracy: last.accuracy,
        isLiveGps: false,
        timestamp: last.timestamp,
        displayText: this.formatTimeAgo(last.timestamp)
      };
    } else {
      // Default to Uttarakhand demo coordinate
      this.currentLocation = {
        lat: 30.0668,
        lng: 79.0193,
        accuracy: 15,
        isLiveGps: false,
        timestamp: Date.now() - 120000,
        displayText: 'Last Known Location — 2 mins ago'
      };
    }

    this.startTracking();
  }

  public subscribe(cb: (loc: LocationState) => void): () => void {
    this.listeners.push(cb);
    cb(this.currentLocation);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public getCurrentLocation(): LocationState {
    return this.currentLocation;
  }

  private startTracking(): void {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.watchPosition(
      (pos) => {
        const state: LocationState = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          isLiveGps: true,
          timestamp: pos.timestamp,
          displayText: `GPS LIVE (±${Math.round(pos.coords.accuracy)}m)`
        };
        this.currentLocation = state;
        offlineDb.saveLastKnownLocation(state.lat, state.lng, state.accuracy);
        this.notify();
      },
      (err) => {
        console.warn('Geolocation degraded to last known position:', err.message);
        this.currentLocation.isLiveGps = false;
        this.currentLocation.displayText = this.formatTimeAgo(this.currentLocation.timestamp);
        this.notify();
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  }

  private formatTimeAgo(ts: number): string {
    const seconds = Math.round((Date.now() - ts) / 1000);
    if (seconds < 60) return `Last Known Location — ${seconds}s ago`;
    const mins = Math.round(seconds / 60);
    return `Last Known Location — ${mins} min${mins > 1 ? 's' : ''} ago`;
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.currentLocation));
  }
}

export const offlineLocation = new OfflineLocationManager();
