import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const damageMarkerIcon = (color: string, label: string) => L.divIcon({
  className: 'damage-marker',
  html: `
    <div style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.8); font-size: 9px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px;">
      <span style="width: 5px; height: 5px; border-radius: 50%; background: white;"></span>
      ${label}
    </div>
  `,
  iconSize: [65, 20],
  iconAnchor: [32, 10]
});

export const DamageAssessmentView: React.FC = () => {
  const { disasters, damageReports } = useAppContext();
  const [selectedDisasterId, setSelectedDisasterId] = useState(disasters[0]?.id || 'd1-uttarakhand-flood');
  const [activeMode, setActiveMode] = useState<'comparison' | 'damageMap'>('comparison');
  const [sliderPosition, setSliderPosition] = useState(50);

  const selectedDisaster = disasters.find(d => d.id === selectedDisasterId) || disasters[0];
  const selectedReport = damageReports.find(r => r.disasterId === selectedDisaster?.id) || damageReports[0];

  const lat = selectedDisaster?.lat || 30.0668;
  const lng = selectedDisaster?.lng || 79.0193;

  return (
    <div className="flex flex-col h-full bg-background p-4 lg:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white mb-1 flex items-center gap-2.5">
            <Layers size={22} className="text-primary-500" />
            Infrastructure Damage Assessment
          </h1>
          <p className="text-text-secondary text-xs lg:text-sm">Explainable bi-temporal satellite change detection and structural classification</p>
        </div>
        
        {/* Mode switcher tabs */}
        <div className="flex bg-surface border border-border p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveMode('comparison')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeMode === 'comparison' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:text-white'
            }`}
          >
            Before / After Slider
          </button>
          <button
            onClick={() => setActiveMode('damageMap')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeMode === 'damageMap' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:text-white'
            }`}
          >
            Interactive Damage Map
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0">
        {/* Left Side: Report List */}
        <div className="w-full lg:w-96 flex flex-col gap-3 overflow-y-auto pr-2 flex-shrink-0 lg:flex-shrink">
          {disasters.map(disaster => {
            const rep = damageReports.find(r => r.disasterId === disaster.id);
            const conf = rep ? rep.confidence : disaster.confidence || 90;
            return (
              <div 
                key={disaster.id} 
                onClick={() => setSelectedDisasterId(disaster.id)}
                className={`bg-surface border rounded-xl p-4 cursor-pointer transition-colors group ${
                  selectedDisaster?.id === disaster.id ? 'border-primary-500 bg-surfaceHighlight' : 'border-border hover:border-border/60'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white text-sm group-hover:text-primary-500 transition-colors">{disaster.sector} - {disaster.name}</h3>
                  <span className="text-[10px] text-text-secondary bg-surfaceHighlight px-2 py-0.5 rounded font-mono font-bold">
                    {conf}% CONF
                  </span>
                </div>
                <div className="text-xs text-text-secondary mb-3">{disaster.type} • {disaster.state}</div>
                
                <div className="flex gap-2">
                  <div className="flex-1 h-1.5 bg-status-critical rounded-full" title="Destroyed"></div>
                  <div className="flex-1 h-1.5 bg-status-high rounded-full" title="Severe"></div>
                  <div className="flex-1 h-1.5 bg-status-medium rounded-full" title="Moderate"></div>
                  <div className="flex-1 h-1.5 bg-status-safe rounded-full opacity-30" title="Minor"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Before/After Slider or Interactive Map + Explainable Data */}
        <div className="flex-1 bg-surface border border-border rounded-xl flex flex-col overflow-hidden min-h-[300px]">
          {/* Controls Header */}
          <div className="p-4 lg:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base lg:text-lg font-medium text-white">{selectedDisaster?.name || 'Assessment'}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-status-medium/20 text-status-medium font-bold uppercase">
                  SIMULATED ASSESSMENT
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Method: {selectedReport?.analysisMethod || 'Bi-temporal Coherence Difference + Building Footprint Overlap'}
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-text-tertiary">
              Assessment: <span className="text-white font-medium">{selectedReport?.assessmentTimestamp || '2026-08-24 10:42 IST'}</span>
            </div>
          </div>

          {/* Main Display: Slider vs Map */}
          {activeMode === 'comparison' ? (
            /* Interactive Before/After Slider */
            <div 
              className="relative flex-1 w-full overflow-hidden select-none min-h-[260px]"
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  setSliderPosition((x / rect.width) * 100);
                }
              }}
              onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const touch = e.touches[0];
                const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                setSliderPosition((x / rect.width) * 100);
              }}
            >
              {/* After Image (Background) */}
              <div className="absolute inset-0">
                <img 
                  src={selectedReport?.afterImageUrl || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop&tint=sepia"} 
                  alt="After" 
                  className="w-full h-full object-cover sepia-[.3] hue-rotate-[180deg] brightness-75 pointer-events-none"
                />
              </div>
              
              {/* Before Image (Foreground, clipped) */}
              <div 
                className="absolute inset-0 border-r-2 border-white"
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src={selectedReport?.beforeImageUrl || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop"} 
                  alt="Before" 
                  className="w-full h-full object-cover grayscale opacity-80 pointer-events-none max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
                
                {/* Slider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-none"
                  style={{ left: `calc(${sliderPosition}% - 2px)` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    <div className="flex gap-1">
                      <div className="w-0.5 h-3 bg-gray-400"></div>
                      <div className="w-0.5 h-3 bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white shadow">
                BEFORE ({selectedReport?.beforeTimestamp || '2026-08-10'})
              </div>
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white shadow">
                AFTER ({selectedReport?.afterTimestamp || '2026-08-24'})
              </div>
            </div>
          ) : (
            /* Interactive Leaflet Damage Map with Damage Layers */
            <div className="relative flex-1 w-full min-h-[260px]">
              <MapContainer
                center={[lat, lng]}
                zoom={12}
                className="w-full h-full"
                style={{ background: '#0B1423' }}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; Esri'
                />
                {/* Destroyed Core Circle */}
                <Circle
                  center={[lat, lng]}
                  radius={1400}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6, weight: 2 }}
                >
                  <Popup>
                    <div className="text-xs p-1 text-slate-900 font-bold">
                      🔴 Destroyed Zone ({selectedReport?.destroyedBuildings || 142} structures collapsed)
                    </div>
                  </Popup>
                </Circle>
                {/* Severe Zone */}
                <Circle
                  center={[lat, lng]}
                  radius={2800}
                  pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.35, weight: 2 }}
                >
                  <Popup>
                    <div className="text-xs p-1 text-slate-900 font-bold">
                      🟠 Severe Damage Zone ({selectedReport?.severeDamage || 385} structures compromised)
                    </div>
                  </Popup>
                </Circle>

                {/* Sample Damaged Structural Clusters */}
                <Marker position={[lat + 0.006, lng + 0.005]} icon={damageMarkerIcon('#ef4444', 'Collapsed')}>
                  <Popup><div className="text-xs p-1 text-slate-900">Commercial Block — 100% Collapse</div></Popup>
                </Marker>
                <Marker position={[lat - 0.008, lng - 0.007]} icon={damageMarkerIcon('#f97316', 'Severe')}>
                  <Popup><div className="text-xs p-1 text-slate-900">Bridge Overpass — Severe Shear Cracking</div></Popup>
                </Marker>
                <Marker position={[lat + 0.015, lng - 0.012]} icon={damageMarkerIcon('#eab308', 'Moderate')}>
                  <Popup><div className="text-xs p-1 text-slate-900">Residential Ward 4 — Inundated Ground Floor</div></Popup>
                </Marker>
                <Marker position={[lat - 0.018, lng + 0.016]} icon={damageMarkerIcon('#22c55e', 'Minor')}>
                  <Popup><div className="text-xs p-1 text-slate-900">Substation — Minor Boundary Waterlogging</div></Popup>
                </Marker>
                <Marker position={[lat + 0.025, lng + 0.022]} icon={damageMarkerIcon('#3b82f6', 'Safe')}>
                  <Popup><div className="text-xs p-1 text-slate-900">High-Ground Evacuation Staging Hub — Structurally Intact</div></Popup>
                </Marker>
              </MapContainer>

              {/* Map Floating Legend */}
              <div className="absolute top-4 right-4 z-[400] bg-surfaceHighlight/90 backdrop-blur border border-border p-3 rounded-xl shadow-xl flex flex-col gap-1.5 text-[10px]">
                <div className="font-bold text-white mb-1 uppercase tracking-wider">Damage Classification</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-status-critical rounded"></div><span className="text-white">Destroyed (Structural Loss)</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-status-high rounded"></div><span className="text-white">Severe (Major Failure)</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-status-medium rounded"></div><span className="text-white">Moderate (Flooded / Cracks)</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-status-safe rounded"></div><span className="text-white">Minor (Cosmetic)</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-primary-500 rounded"></div><span className="text-white">Safe (Operational)</span></div>
              </div>
            </div>
          )}

          {/* Explainable Stats Grid with 5 categories */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-surfaceHighlight/50 border-t border-border">
            <div className="bg-surface border border-border p-3 rounded-lg text-center">
              <div className="text-lg lg:text-xl font-bold text-status-critical mb-0.5">
                {selectedReport?.destroyedBuildings || 142}
              </div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Destroyed</div>
            </div>
            <div className="bg-surface border border-border p-3 rounded-lg text-center">
              <div className="text-lg lg:text-xl font-bold text-status-high mb-0.5">
                {selectedReport?.severeDamage || 385}
              </div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Severe</div>
            </div>
            <div className="bg-surface border border-border p-3 rounded-lg text-center">
              <div className="text-lg lg:text-xl font-bold text-status-medium mb-0.5">
                {selectedReport?.moderateDamage || 890}
              </div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Moderate</div>
            </div>
            <div className="bg-surface border border-border p-3 rounded-lg text-center">
              <div className="text-lg lg:text-xl font-bold text-status-safe mb-0.5">
                {selectedReport?.minorDamage ? (selectedReport.minorDamage >= 1000 ? `${(selectedReport.minorDamage/1000).toFixed(1)}k` : selectedReport.minorDamage) : '2.1k'}
              </div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Minor</div>
            </div>
            <div className="bg-surface border border-border p-3 rounded-lg text-center col-span-2 sm:col-span-1">
              <div className="text-lg lg:text-xl font-bold text-primary-400 mb-0.5">
                {selectedReport?.safeBuildings ? (selectedReport.safeBuildings >= 1000 ? `${(selectedReport.safeBuildings/1000).toFixed(1)}k` : selectedReport.safeBuildings) : '4.8k'}
              </div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Safe</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
