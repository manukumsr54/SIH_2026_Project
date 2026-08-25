import React, { useState } from 'react';
import { Satellite, Radio, Calendar, Layers, ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const localFallbacks: Record<string, string> = {
  'sat-obs-001': '/assets/satellites/sentinel-1-sar.jpg',
  'sat-obs-002': '/assets/satellites/sentinel-2-optical.jpg',
  'sat-obs-003': '/assets/satellites/landsat-9.jpg'
};

export const SatelliteFeedView: React.FC = () => {
  const { satelliteFeeds } = useAppContext();
  const primaryFeeds = (satelliteFeeds || []).slice(0, 3);
  const [selectedFeedId, setSelectedFeedId] = useState(primaryFeeds[0]?.id || 'sat-obs-001');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const selectedFeed = primaryFeeds.find(f => f.id === selectedFeedId) || primaryFeeds[0];
  const feedKey = selectedFeed?.id || 'sat-obs-001';
  const isImageBroken = imageErrors[feedKey];
  const fallbackSrc = selectedFeed?.rawBandUrl || localFallbacks[selectedFeed?.id || ''] || '/assets/satellites/sentinel-1-sar.jpg';
  const displaySrc = isImageBroken ? fallbackSrc : (selectedFeed?.imageUrl || fallbackSrc);

  const handleImageError = () => {
    setImageErrors(prev => ({ ...prev, [feedKey]: true }));
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 lg:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white mb-1 flex items-center gap-2.5">
            <Satellite size={22} className="text-primary-500" />
            Live Satellite Intelligence Feed
          </h1>
          <p className="text-text-secondary text-xs lg:text-sm">Multi-spectral Earth observation & radar flood analysis across monitored Indian sectors</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface border border-border px-3 py-1.5 rounded-lg self-start sm:self-auto">
          <Radio size={14} className="text-status-safe animate-pulse" />
          <span>3 Monitored Constellations Ingested</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0">
        {/* Left/Top Area - Satellite List (Exactly 3 distinct sources) */}
        <div className="w-full lg:w-88 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 lg:pr-2 flex-shrink-0">
          {primaryFeeds.map(feed => (
            <div 
              key={feed.id} 
              onClick={() => setSelectedFeedId(feed.id)}
              className={`bg-surface border rounded-xl p-4 cursor-pointer transition-all min-w-[260px] lg:min-w-0 flex-shrink-0 ${
                selectedFeed?.id === feed.id 
                  ? 'border-primary-500 bg-surfaceHighlight shadow-[0_0_15px_rgba(29,78,216,0.25)]' 
                  : 'border-border hover:border-border/80 hover:bg-surfaceHighlight/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">{feed.satellite || feed.source.split(' ')[0]}</span>
                  <h3 className="font-semibold text-white text-sm">{feed.source}</h3>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary-600/20 text-primary-400 border border-primary-500/30">
                  {feed.observationStatus || 'RECENT OBSERVATION'}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-text-secondary mt-2">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-white font-medium truncate max-w-[140px]">{feed.locationName || 'Indian Sector'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sensor:</span>
                  <span className="text-white font-medium truncate max-w-[140px]">{feed.sensor || 'SAR / Optical'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acquisition:</span>
                  <span className="text-text-primary font-mono">{feed.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Main Area - Telemetry & Image Inspection */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-5 lg:p-6 flex flex-col">
          {selectedFeed ? (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">{selectedFeed.satellite || selectedFeed.source}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surfaceHighlight border border-border text-text-secondary font-mono">
                      {selectedFeed.processingLevel || 'Level-1 / 2A'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-status-safe/20 text-status-safe font-bold uppercase">
                      {selectedFeed.observationStatus || 'RECENT OBSERVATION'}
                    </span>
                  </div>
                  <h2 className="text-lg lg:text-xl font-semibold text-white">{selectedFeed.mode} — {selectedFeed.locationName || 'Indian Sector'}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Sensor: {selectedFeed.sensor || 'Multi-Spectral Payload'} • Source: Copernicus / NASA</p>
                </div>
                
                <div className="text-left md:text-right flex flex-col md:items-end">
                  <div className="text-[11px] text-text-tertiary uppercase tracking-wider flex items-center gap-1.5 md:justify-end">
                    <Calendar size={12} /> Acquisition Timestamp
                  </div>
                  <div className="text-sm font-semibold text-white font-mono">{selectedFeed.timestamp}</div>
                </div>
              </div>
              
              {/* Image Preview Canvas */}
              <div className="flex-1 rounded-xl border border-border overflow-hidden relative bg-[#070b14] flex items-center justify-center min-h-[280px] max-h-[460px] group">
                <img 
                  key={displaySrc}
                  src={displaySrc} 
                  alt={selectedFeed.source} 
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white text-xs font-medium flex items-center gap-2">
                  <Layers size={14} className="text-primary-400" />
                  <span>Band Composite: {selectedFeed.mode}</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white text-xs font-mono">
                  Ground Resolution: {selectedFeed.resolution || '10m / px'}
                </div>
              </div>
              
              {/* Metadata Telemetry Bar */}
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap justify-between items-center gap-4 text-xs text-text-secondary">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div><span>Resolution:</span> <span className="text-white font-medium">{selectedFeed.resolution || '10m / px'}</span></div>
                  <div><span>Coordinates:</span> <span className="text-white font-medium">{selectedFeed.lat ? `${selectedFeed.lat.toFixed(2)}°N, ${selectedFeed.lng?.toFixed(2)}°E` : '22.00°N, 80.00°E'}</span></div>
                  <div><span>Cloud Cover:</span> <span className="text-white font-medium">{selectedFeed.cloudCoverage !== undefined ? `${selectedFeed.cloudCoverage}%` : '0%'}</span></div>
                  <div><span>Dataset Tag:</span> <span className="text-primary-400 font-medium">{selectedFeed.dataSourceType || 'DEMO SATELLITE OBSERVATION'}</span></div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(displaySrc, '_blank')}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} /> Full Resolution
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
              No satellite observation feeds loaded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
