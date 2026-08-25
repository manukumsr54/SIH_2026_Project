import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../../context/AppContext';

// Simple marker icons for damage levels
const createDamageIcon = (color: string) => L.divIcon({
  className: 'damage-pin',
  html: `<div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; border: 1.5px solid white; box-shadow: 0 0 6px ${color};"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

export const DamageAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { damageReports, disasters } = useAppContext();
  const [activeTab, setActiveTab] = useState<'comparison' | 'map'>('comparison');
  
  const currentReport = damageReports[0];
  const currentDisaster = disasters.find(d => d.id === currentReport?.disasterId) || disasters[0];
  const lat = currentDisaster?.lat || 30.0668;
  const lng = currentDisaster?.lng || 79.0193;

  return (
    <div className="card-panel col-span-1 lg:col-span-5 lg:h-[240px] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-medium text-sm">Damage Assessment</h2>
          <div className="flex bg-surfaceHighlight p-0.5 rounded border border-border text-[10px]">
            <button 
              onClick={() => setActiveTab('comparison')}
              className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'comparison' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:text-white'}`}
            >
              Imagery
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'map' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:text-white'}`}
            >
              Damage Map
            </button>
          </div>
        </div>
        <button 
          onClick={() => navigate('/damage-assessment')}
          className="text-primary-500 hover:text-primary-400 text-xs font-medium transition-colors"
        >
          View Report
        </button>
      </div>

      {activeTab === 'comparison' ? (
        <div className="flex gap-2 h-[125px]">
          {/* Before */}
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">Before (10 Aug)</span>
            <div className="flex-1 rounded-lg border border-border overflow-hidden">
              <img 
                src={currentReport?.beforeImageUrl || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=400&auto=format&fit=crop"} 
                alt="Before" 
                className="w-full h-full object-cover grayscale opacity-80"
              />
            </div>
          </div>
          
          {/* After */}
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">After (24 Aug)</span>
            <div className="flex-1 rounded-lg border border-border overflow-hidden">
              <img 
                src={currentReport?.afterImageUrl || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=400&auto=format&fit=crop&tint=sepia"} 
                alt="After" 
                className="w-full h-full object-cover sepia-[.3] hue-rotate-[180deg] brightness-75"
              />
            </div>
          </div>

          {/* Damage Map preview */}
          <div 
            onClick={() => setActiveTab('map')}
            className="flex-1 flex flex-col gap-1 cursor-pointer group"
          >
            <span className="text-[10px] text-text-secondary uppercase tracking-wider group-hover:text-primary-400">Damage Overlay</span>
            <div className="flex-1 rounded-lg border border-border overflow-hidden relative">
              <img 
                src={currentReport?.damageMapUrl || "https://images.unsplash.com/photo-1533134486753-c833f0eddebd?q=80&w=400&auto=format&fit=crop"} 
                alt="Damage Map" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-status-critical/70 via-status-high/40 to-transparent mix-blend-overlay"></div>
              <div className="absolute bottom-1 right-1 text-[8px] bg-black/80 px-1 py-0.2 rounded text-white font-mono">
                Click for Map
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Actual interactive Leaflet Damage Map */
        <div className="h-[125px] rounded-lg border border-border overflow-hidden relative">
          <MapContainer
            center={[lat, lng]}
            zoom={12}
            className="w-full h-full"
            style={{ background: '#0B1423' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {/* Destroyed Core Circle */}
            <Circle
              center={[lat, lng]}
              radius={1200}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6, weight: 1.5 }}
            />
            {/* Severe Zone Circle */}
            <Circle
              center={[lat, lng]}
              radius={2400}
              pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.35, weight: 1.5 }}
            />
            {/* Sample Cluster Markers */}
            <Marker position={[lat + 0.005, lng + 0.004]} icon={createDamageIcon('#ef4444')} />
            <Marker position={[lat - 0.006, lng - 0.005]} icon={createDamageIcon('#f97316')} />
            <Marker position={[lat + 0.012, lng - 0.008]} icon={createDamageIcon('#eab308')} />
            <Marker position={[lat - 0.014, lng + 0.012]} icon={createDamageIcon('#22c55e')} />
          </MapContainer>
        </div>
      )}

      {/* 5-Level Damage Legend */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50 px-1 text-[9px] text-text-secondary">
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-status-critical rounded-sm"></div><span>Destroyed ({currentReport?.destroyedBuildings || 142})</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-status-high rounded-sm"></div><span>Severe ({currentReport?.severeDamage || 385})</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-status-medium rounded-sm"></div><span>Moderate ({currentReport?.moderateDamage || 890})</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-status-safe rounded-sm"></div><span>Minor</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-primary-500 rounded-sm"></div><span>Safe</span></div>
      </div>
    </div>
  );
};
