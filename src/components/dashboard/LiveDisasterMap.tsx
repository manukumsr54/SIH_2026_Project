import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { RiskLevel, Disaster } from '../../types';

// Custom Map Markers with SVG pulse animations
const createCustomMarker = (riskLevel: RiskLevel) => {
  const colorMap = {
    'Critical': '#ef4444',
    'High': '#f97316',
    'Medium': '#eab308',
    'Safe': '#22c55e'
  };
  const color = colorMap[riskLevel] || '#22c55e';
  
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1px solid ${color}; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
        <div style="position: absolute; width: 60%; height: 60%; border-radius: 50%; border: 1px solid ${color}; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; animation-delay: 0.5s;"></div>
        <div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

interface Props {
  className?: string;
  hideHeader?: boolean;
  customDisasters?: Disaster[];
}

export const LiveDisasterMap: React.FC<Props> = ({ 
  className = "card-panel col-span-1 lg:col-span-8 lg:row-span-2 relative min-h-[360px] lg:min-h-[auto]", 
  hideHeader = false, 
  customDisasters 
}) => {
  const { disasters: allDisasters, setSelectedDisaster } = useAppContext();
  const navigate = useNavigate();
  const disasters = customDisasters || allDisasters;

  // Indian Subcontinent Bounding Box
  const indiaBounds: L.LatLngBoundsLiteral = [
    [6.0, 68.0],
    [37.5, 97.5]
  ];

  return (
    <div className={className}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-3 z-10 relative pointer-events-none">
          <h2 className="text-white font-medium text-sm">Live Disaster Overview</h2>
          <button 
            onClick={() => navigate('/live-map')}
            className="text-primary-500 hover:text-primary-400 text-xs font-medium flex items-center gap-1 pointer-events-auto transition-colors"
          >
            View Full Map <ExternalLink size={12} />
          </button>
        </div>
      )}
      
      <div className={`absolute rounded-lg overflow-hidden border border-border ${hideHeader ? 'inset-0' : 'inset-0 top-12'}`}>
        <MapContainer 
          center={[22.0, 80.0]} // Center on India
          zoom={4.5}
          minZoom={4}
          maxZoom={18}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#0B1423' }}
        >
          {/* Satellite basemap */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            className="map-tiles"
          />
          {/* Subtle dark overlay to match RAKSHA theme */}
          <div className="absolute inset-0 bg-background/25 pointer-events-none z-[400]" />

          <ZoomControl position="bottomleft" />

          {disasters.map(disaster => (
            <Marker 
              key={disaster.id} 
              position={[disaster.lat, disaster.lng]}
              icon={createCustomMarker(disaster.riskLevel)}
              eventHandlers={{
                click: () => setSelectedDisaster(disaster)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[160px] text-background">
                  <div className="font-bold text-sm mb-0.5 text-slate-900">{disaster.name}</div>
                  <div className="text-[11px] text-slate-600 mb-1">{disaster.sector} • {disaster.type}</div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-slate-800">Risk Score: {disaster.riskScore}/100</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-bold uppercase">{disaster.riskLevel}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedDisaster(disaster);
                      navigate('/damage-assessment');
                    }}
                    className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1 rounded transition-colors"
                  >
                    View Damage Intel
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-surfaceHighlight/90 backdrop-blur border border-border p-3 rounded-lg z-[400] shadow-lg">
          <h3 className="text-white text-xs font-medium mb-2">Risk Level</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-status-critical shadow-[0_0_5px_#ef4444]" /><span className="text-xs text-text-secondary">Critical</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-status-high shadow-[0_0_5px_#f97316]" /><span className="text-xs text-text-secondary">High</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-status-medium shadow-[0_0_5px_#eab308]" /><span className="text-xs text-text-secondary">Medium</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-status-safe shadow-[0_0_5px_#22c55e]" /><span className="text-xs text-text-secondary">Safe</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
