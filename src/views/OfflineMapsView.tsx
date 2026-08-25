import React, { useState, useEffect } from 'react';
import { Network, HardDrive, RefreshCw, Navigation, ShieldCheck, X, Car, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { offlineLocation } from '../offline/offlineLocation';
import { OfflineRoutingSolver } from '../offline/offlineRouting';
import { offlineDb } from '../offline/offlineDb';
import { api } from '../services/api';
import type { SafeLocation, EvacuationRoute, OfflineRegion } from '../types';

// Map Center Controller to fly/pan to selected region
const MapCenterController: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 10 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Custom DivIcons
const userMarkerIcon = (isLive: boolean) => L.divIcon({
  className: 'user-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${isLive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(249, 115, 22, 0.4)'}; animation: pulse-ring 2s infinite;"></div>
      <div style="width: 14px; height: 14px; background: ${isLive ? '#22c55e' : '#f97316'}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const shelterIcon = L.divIcon({
  className: 'shelter-marker',
  html: `
    <div style="background: #1d4ed8; color: white; padding: 4px 6px; border-radius: 6px; border: 1px solid #60a5fa; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
      🏥 SHELTER
    </div>
  `,
  iconSize: [68, 24],
  iconAnchor: [34, 12]
});

export const OfflineMapsView: React.FC = () => {
  const { isOffline, setOffline, disasters, teams, assignTeam, activeRegion, setActiveRegion } = useAppContext();
  
  const [regions, setRegions] = useState<OfflineRegion[]>([
    { id: 'reg-north-in', name: 'Northern India', state: 'Uttarakhand, Himachal & J&K', status: 'Cached', size: '1.8 GB', sizeMb: 1840, lastSync: '10:24 AM IST', centerLat: 30.0668, centerLng: 79.0193 },
    { id: 'reg-east-in', name: 'Eastern India', state: 'Odisha & Bengal Coast', status: 'Cached', size: '2.1 GB', sizeMb: 2150, lastSync: '10:15 AM IST', centerLat: 20.9517, centerLng: 85.0985 },
    { id: 'reg-west-in', name: 'Western India', state: 'Gujarat & Maharashtra', status: 'Cached', size: '1.9 GB', sizeMb: 1920, lastSync: '10:05 AM IST', centerLat: 22.2587, centerLng: 71.1924 },
    { id: 'reg-south-in', name: 'Southern India', state: 'Kerala & Tamil Nadu', status: 'Sync Required', size: '1.5 GB', sizeMb: 1520, lastSync: 'Yesterday, 8:00 PM IST', centerLat: 10.8505, centerLng: 76.2711 }
  ]);

  const [locationState, setLocationState] = useState(offlineLocation.getCurrentLocation());
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<EvacuationRoute | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [pendingSyncNotice, setPendingSyncNotice] = useState<string | null>(null);

  // Region-specific Shelters
  const allSafeLocations: SafeLocation[] = [
    // Uttarakhand
    { id: 'safe-01', regionId: 'reg-north-in', name: 'Joshimath Central Evacuation Center', type: 'evacuation_center', lat: 30.555, lng: 79.567, capacity: 1500, currentOccupancy: 340, status: 'OPEN', contact: '+91-1372-222100', facilities: ['Medical Wing', 'Backup Power', 'Clean Water'] },
    { id: 'safe-02', regionId: 'reg-north-in', name: 'Chamoli District Civil Hospital', type: 'hospital', lat: 30.412, lng: 79.324, capacity: 600, currentOccupancy: 280, status: 'OPEN', contact: '+91-1372-252102', facilities: ['ICU Beds', 'Blood Bank', '24/7 Trauma'] },
    // Odisha
    { id: 'safe-03', regionId: 'reg-east-in', name: 'Puri Cyclone Multi-Purpose Shelter', type: 'evacuation_center', lat: 19.813, lng: 85.831, capacity: 3500, currentOccupancy: 1200, status: 'OPEN', contact: '+91-6752-223400', facilities: ['Reinforced Concrete Dome', 'Dewatering Pumps'] },
    { id: 'safe-04', regionId: 'reg-east-in', name: 'Jagatsinghpur District Emergency Hospital', type: 'hospital', lat: 20.264, lng: 86.168, capacity: 800, currentOccupancy: 410, status: 'OPEN', contact: '+91-6724-220050', facilities: ['Trauma Center', 'Oxygen Plants'] },
    // Gujarat
    { id: 'safe-05', regionId: 'reg-west-in', name: 'Junagadh District Evacuation Base', type: 'evacuation_center', lat: 21.522, lng: 70.457, capacity: 2200, currentOccupancy: 620, status: 'OPEN', contact: '+91-285-2630100', facilities: ['Earthquake Resistant Hall', 'Ambulance Fleet'] },
    { id: 'safe-06', regionId: 'reg-west-in', name: 'Gir Somnath Civil Hospital', type: 'hospital', lat: 20.904, lng: 70.366, capacity: 750, currentOccupancy: 390, status: 'OPEN', contact: '+91-2876-220100', facilities: ['Emergency Ward', 'Helipad'] },
    // Kerala
    { id: 'safe-07', regionId: 'reg-south-in', name: 'Wayanad High-Ground Relief Shelter', type: 'evacuation_center', lat: 11.685, lng: 76.132, capacity: 1800, currentOccupancy: 500, status: 'OPEN', contact: '+91-4936-202000', facilities: ['Food Supplies', 'Satellite Comms'] }
  ];

  const currentRegionObj = regions.find(r => r.id === activeRegion) || regions[0];
  const regionSafeLocations = allSafeLocations.filter(s => s.regionId === activeRegion);
  const regionDisasters = disasters.filter(d => {
    if (activeRegion === 'reg-north-in') return d.state?.includes('Uttarakhand');
    if (activeRegion === 'reg-east-in') return d.state?.includes('Odisha') || d.state?.includes('Assam');
    if (activeRegion === 'reg-west-in') return d.state?.includes('Gujarat');
    if (activeRegion === 'reg-south-in') return d.state?.includes('Kerala');
    return true;
  });

  useEffect(() => {
    const unsub = offlineLocation.subscribe((loc) => setLocationState(loc));
    return unsub;
  }, []);

  const handleSelectRegion = (regionId: string) => {
    setActiveRegion(regionId);
    const targetRegion = regions.find(r => r.id === regionId);
    if (targetRegion && targetRegion.status === 'Cached') {
      // Re-solve evacuation route for target operational sector
      const originLat = targetRegion.centerLat || 30.06;
      const originLng = targetRegion.centerLng || 79.01;
      const route = OfflineRoutingSolver.solveSafeRoute({
        userLat: originLat,
        userLng: originLng,
        safeLocations: allSafeLocations.filter(s => s.regionId === regionId),
        disasters: regionDisasters.length > 0 ? regionDisasters : disasters
      });
      setActiveRoute(route);
    }
  };

  const handleOpenOfflineMap = () => {
    const originLat = currentRegionObj.centerLat || locationState.lat;
    const originLng = currentRegionObj.centerLng || locationState.lng;
    
    const route = OfflineRoutingSolver.solveSafeRoute({
      userLat: originLat,
      userLng: originLng,
      safeLocations: regionSafeLocations.length > 0 ? regionSafeLocations : allSafeLocations,
      disasters: regionDisasters.length > 0 ? regionDisasters : disasters
    });
    setActiveRoute(route);
    setIsMapModalOpen(true);
  };

  const handleSyncRegion = async (regionId: string) => {
    setIsSyncing(regionId);
    try {
      const res = await api.syncOfflineRegion(regionId);
      if (res.success && res.data) {
        setRegions(prev => prev.map(r => r.id === regionId ? { ...r, status: 'Cached', lastSync: 'Just now' } : r));
        await offlineDb.saveCachedRegion(res.data.region, disasters, allSafeLocations);
      }
    } catch (e) {
      setRegions(prev => prev.map(r => r.id === regionId ? { ...r, status: 'Cached', lastSync: 'Just now' } : r));
    } finally {
      setIsSyncing(null);
    }
  };

  const handleAssignTeamFromOffline = async (teamId: string, disasterId: string) => {
    if (isOffline) {
      // Offline assignment queue
      setPendingSyncNotice(`Team assignment queued locally as PENDING SYNC. Will synchronize upon network restoration.`);
      setTimeout(() => setPendingSyncNotice(null), 5000);
    }
    await assignTeam(teamId, disasterId);
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 lg:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-4 lg:mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white mb-1 flex items-center gap-2.5">
            <Network size={22} className="text-primary-500" />
            Offline Maps & Autonomous Evacuation
          </h1>
          <p className="text-text-secondary text-xs lg:text-sm">Pre-cached vector graphs and hazard-repulsion routing for zero-connectivity disaster zones</p>
        </div>
        
        {/* Actions & Offline Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleOpenOfflineMap}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(29,78,216,0.4)] flex items-center gap-2"
          >
            <Navigation size={16} /> Open Offline Navigation Map
          </button>

          <div className="flex items-center gap-3 bg-surface border border-border px-3.5 py-1.5 rounded-lg">
            <span className="text-xs font-medium text-white">Simulate Offline Mode</span>
            <button 
              onClick={() => setOffline(!isOffline)}
              className={`w-11 h-6 rounded-full relative transition-colors ${isOffline ? 'bg-status-critical' : 'bg-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isOffline ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {pendingSyncNotice && (
        <div className="mb-4 p-3 bg-status-high/20 border border-status-high/40 rounded-xl text-status-high text-xs flex items-center gap-2 animate-fadeIn">
          <AlertTriangle size={16} />
          <span>{pendingSyncNotice}</span>
        </div>
      )}

      {/* Operational Region & Status Banner */}
      <div className="bg-surface border border-border p-4 rounded-xl mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${locationState.isLiveGps ? 'bg-status-safe animate-pulse' : 'bg-status-high'}`} />
          <div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              {locationState.isLiveGps ? 'GPS LIVE' : 'LAST KNOWN LOCATION'}
            </div>
            <div className="text-xs text-text-secondary">
              {locationState.lat.toFixed(4)}°N, {locationState.lng.toFixed(4)}°E ({locationState.displayText})
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="bg-surfaceHighlight px-3 py-1.5 rounded-lg border border-border">
            <span className="text-text-tertiary">Active Operational Region: </span>
            <span className="text-primary-400 font-semibold">{currentRegionObj.name} ({currentRegionObj.state})</span>
          </div>
          <div className="text-text-secondary">
            Engine: <span className="text-white font-medium">RAKSHA Dijkstra-A*</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Regions Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {regions.map(region => (
            <div 
              key={region.id} 
              onClick={() => handleSelectRegion(region.id)}
              className={`bg-surface border p-5 rounded-xl flex flex-col gap-4 cursor-pointer transition-all ${
                activeRegion === region.id ? 'border-primary-500 bg-surfaceHighlight shadow-[0_0_15px_rgba(29,78,216,0.2)]' : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <Network size={18} className={activeRegion === region.id ? 'text-primary-400' : 'text-text-secondary'} />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{region.name}</h3>
                    <span className="text-[10px] text-text-tertiary">{region.state}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  region.status === 'Cached' ? 'bg-status-safe/20 text-status-safe' : 'bg-status-medium/20 text-status-medium'
                }`}>
                  {region.status}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-text-secondary">
                <div className="flex justify-between"><span>Cache Size:</span> <span className="text-white">{region.size}</span></div>
                <div className="flex justify-between"><span>Last Synced:</span> <span className="text-white">{region.lastSync}</span></div>
                <div className="flex justify-between"><span>Operational Status:</span> <span className="text-status-safe font-medium">Ready Offline</span></div>
              </div>
              
              <div className="mt-2 pt-3 border-t border-border flex justify-between gap-2" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => {
                    handleSelectRegion(region.id);
                    handleOpenOfflineMap();
                  }}
                  className="flex-1 bg-surfaceHighlight hover:bg-border text-white text-xs py-2 rounded-lg transition-colors font-medium"
                >
                  Open Region Map
                </button>
                <button 
                  onClick={() => handleSyncRegion(region.id)}
                  disabled={isSyncing === region.id}
                  className="flex-1 bg-primary-600/20 hover:bg-primary-600 text-primary-500 hover:text-white border border-primary-600/50 text-xs py-2 rounded-lg transition-all font-medium flex items-center justify-center gap-1"
                >
                  <RefreshCw size={12} className={isSyncing === region.id ? 'animate-spin' : ''} />
                  {isSyncing === region.id ? 'Syncing...' : 'Sync Region'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar - Storage & Ground Units */}
        <div className="col-span-1 bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <HardDrive size={16} className="text-primary-500" />
              Cached Device Storage
            </h3>
            
            <div className="w-full h-2.5 bg-background rounded-full overflow-hidden flex mb-2">
              <div className="h-full bg-primary-500" style={{ width: '45%' }} title="Map Data"></div>
              <div className="h-full bg-status-medium" style={{ width: '15%' }} title="System Data"></div>
            </div>
            
            <div className="flex justify-between text-[11px] text-text-secondary mb-3">
              <span>7.3 GB Used</span>
              <span>128 GB Available</span>
            </div>
          </div>

          {/* Quick Dispatch Ground Units in Active Region */}
          <div className="border-t border-border pt-4 flex-1">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Car size={14} className="text-primary-400" /> Nearby Rescue Ground Units
            </h4>
            <div className="flex flex-col gap-2">
              {teams.slice(0, 3).map(team => (
                <div key={team.id} className="p-2.5 rounded-lg bg-surfaceHighlight/50 border border-border/50 flex justify-between items-center text-xs">
                  <div>
                    <div className="text-white font-medium truncate max-w-[130px]">{team.name}</div>
                    <div className="text-[10px] text-text-secondary">{team.distanceKm.toFixed(1)} km • {team.status}</div>
                  </div>
                  {team.status === 'Available' ? (
                    <button
                      onClick={() => handleAssignTeamFromOffline(team.id, regionDisasters[0]?.id || disasters[0]?.id)}
                      className="bg-primary-600/20 hover:bg-primary-600 text-primary-400 hover:text-white border border-primary-500/40 text-[10px] font-semibold px-2.5 py-1 rounded transition-colors"
                    >
                      Assign
                    </button>
                  ) : (
                    <span className="text-[10px] text-status-high font-bold">On Mission</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-status-safe" /> Autonomous Operation
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              When disconnected from cellular networks, RAKSHA executes Dijkstra-A* navigation entirely in browser IndexedDB avoiding active hazard boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Offline Evacuation Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 bg-surfaceHighlight border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-status-critical animate-pulse" />
                <div>
                  <h2 className="text-sm lg:text-base font-semibold text-white">Emergency Safe Evacuation Navigation — {currentRegionObj.name}</h2>
                  <div className="text-xs text-text-secondary flex items-center gap-2">
                    <span>{locationState.displayText}</span>
                    <span>•</span>
                    <span className="text-status-safe font-medium">Offline Calculated</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const originLat = currentRegionObj.centerLat || locationState.lat;
                    const originLng = currentRegionObj.centerLng || locationState.lng;
                    const route = OfflineRoutingSolver.solveSafeRoute({
                      userLat: originLat,
                      userLng: originLng,
                      safeLocations: regionSafeLocations.length > 0 ? regionSafeLocations : allSafeLocations,
                      disasters: regionDisasters.length > 0 ? regionDisasters : disasters
                    });
                    setActiveRoute(route);
                  }}
                  className="bg-primary-600 hover:bg-primary-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Recalculate Route
                </button>
                <button 
                  onClick={() => setIsMapModalOpen(false)}
                  className="text-text-secondary hover:text-white p-1 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Map + Turn-by-Turn Guidance */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0">
              {/* Map */}
              <div className="lg:col-span-2 relative h-full">
                <MapContainer
                  center={[currentRegionObj.centerLat || locationState.lat, currentRegionObj.centerLng || locationState.lng]}
                  zoom={10}
                  className="w-full h-full"
                  style={{ background: '#0B1423' }}
                >
                  <MapCenterController center={[currentRegionObj.centerLat || locationState.lat, currentRegionObj.centerLng || locationState.lng]} zoom={10} />

                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri'
                  />

                  {/* Hazard zones */}
                  {(regionDisasters.length > 0 ? regionDisasters : disasters).map(d => (
                    <Circle
                      key={d.id}
                      center={[d.lat, d.lng]}
                      radius={4500}
                      pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35, weight: 2 }}
                    >
                      <Popup>
                        <div className="text-xs p-1 text-slate-900 font-bold">
                          ⚠️ Hazard Zone: {d.name} ({d.riskLevel})
                        </div>
                      </Popup>
                    </Circle>
                  ))}

                  {/* User Location */}
                  <Marker 
                    position={[currentRegionObj.centerLat || locationState.lat, currentRegionObj.centerLng || locationState.lng]} 
                    icon={userMarkerIcon(locationState.isLiveGps)}
                  >
                    <Popup>
                      <div className="text-xs p-1 text-slate-900">
                        <strong>You are here</strong><br/>{locationState.displayText}
                      </div>
                    </Popup>
                  </Marker>

                  {/* Shelters */}
                  {(regionSafeLocations.length > 0 ? regionSafeLocations : allSafeLocations).map(s => (
                    <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
                      <Popup>
                        <div className="text-xs p-1 text-slate-900">
                          <strong>{s.name}</strong><br/>Capacity: {s.capacity} beds ({s.status})
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Recommended Safe Route Polyline */}
                  {activeRoute && (
                    <Polyline 
                      positions={activeRoute.pathCoordinates} 
                      pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.9, dashArray: '8, 8' }} 
                    />
                  )}
                </MapContainer>

                {/* Route metrics badge */}
                {activeRoute && (
                  <div className="absolute top-4 left-4 z-[400] bg-surfaceHighlight/90 backdrop-blur border border-border p-3 rounded-xl shadow-lg flex gap-4 text-xs">
                    <div>
                      <div className="text-text-tertiary">Evacuation Destination</div>
                      <div className="text-white font-semibold truncate max-w-[180px]">{activeRoute.destination.name}</div>
                    </div>
                    <div className="border-l border-border pl-4">
                      <div className="text-text-tertiary">Safe Distance</div>
                      <div className="text-white font-bold">{activeRoute.totalDistanceKm} km</div>
                    </div>
                    <div className="border-l border-border pl-4">
                      <div className="text-text-tertiary">Est. Time</div>
                      <div className="text-status-safe font-bold">{activeRoute.estimatedMinutes} mins</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Turn-by-Turn Instructions Panel */}
              <div className="bg-surface border-t lg:border-t-0 lg:border-l border-border p-5 flex flex-col overflow-y-auto">
                <div className="mb-4">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Safe Evacuation Maneuvers
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Routing to {activeRoute?.destination.name || 'Nearest Designated Shelter'}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1">
                  {activeRoute?.instructions.map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-surfaceHighlight/50 border border-border/50 text-xs">
                      <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-medium">{inst.maneuver}</span>
                        <span className="text-text-tertiary">{inst.street} ({inst.distanceMeters}m)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="p-3 rounded-lg bg-status-safe/10 border border-status-safe/30 text-xs text-status-safe flex items-center gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0" />
                    <span>Safety Priority: Route circumvents active flood boundaries and blocked arterial roads.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
