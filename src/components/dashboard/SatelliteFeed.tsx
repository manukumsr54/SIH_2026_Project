import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const localFallbacks: Record<string, string> = {
  'sat-obs-001': '/assets/satellites/sentinel-1-sar.jpg',
  'sat-obs-002': '/assets/satellites/sentinel-2-optical.jpg',
  'sat-obs-003': '/assets/satellites/landsat-9.jpg'
};

export const SatelliteFeed: React.FC = () => {
  const { satelliteFeeds } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  // Exactly 3 satellite feed entries
  const primaryFeeds = (satelliteFeeds || []).slice(0, 3);
  if (!primaryFeeds.length) return null;

  const currentFeed = primaryFeeds[currentIndex] || primaryFeeds[0];
  const feedKey = currentFeed.id || `feed-${currentIndex}`;
  const isImageBroken = imageErrors[feedKey];
  const fallbackSrc = currentFeed.rawBandUrl || localFallbacks[currentFeed.id] || '/assets/satellites/sentinel-1-sar.jpg';
  const displaySrc = isImageBroken ? fallbackSrc : (currentFeed.imageUrl || fallbackSrc);

  const handleImageError = () => {
    setImageErrors(prev => ({ ...prev, [feedKey]: true }));
  };

  return (
    <div className="card-panel col-span-1 lg:col-span-4 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-medium text-sm">Live Satellite Feed</h2>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-status-safe/20 text-status-safe font-bold uppercase tracking-wider">
            3 Feeds Live
          </span>
        </div>
        <button 
          onClick={() => navigate('/satellite-feed')}
          className="text-primary-500 hover:text-primary-400 text-xs font-medium transition-colors"
        >
          View All
        </button>
      </div>

      {/* Satellite Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#070b14] p-1 rounded-lg border border-border mb-2.5">
        {primaryFeeds.map((feed, idx) => {
          const label = feed.satellite || feed.source.split(' ')[0] || `Sat ${idx + 1}`;
          const isSelected = idx === currentIndex;
          return (
            <button
              key={feed.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`py-1 text-[10px] font-semibold rounded transition-all truncate px-1 ${
                isSelected 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-text-secondary hover:text-white hover:bg-surfaceHighlight'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div 
        onClick={() => navigate('/satellite-feed')}
        className="relative rounded-lg overflow-hidden border border-border aspect-[16/9] mb-3 group cursor-pointer bg-[#070b14]"
      >
        <img 
          key={displaySrc}
          src={displaySrc} 
          alt={currentFeed.source} 
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-status-critical/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">
          {currentFeed.dataSourceType || 'LIVE'}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-[10px] text-white font-medium px-2 py-0.5 rounded border border-white/10">
          {currentFeed.satellite || currentFeed.source}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[11px] text-text-secondary mb-3">
        <div className="flex justify-between">
          <span>Source: <span className="text-white font-medium">{currentFeed.source}</span></span>
          <span>Time: <span className="text-white font-mono">{currentFeed.timestamp}</span></span>
        </div>
        <div className="truncate">Mode: <span className="text-white font-medium">{currentFeed.mode}</span></div>
      </div>

      <div className="flex justify-center gap-1.5 mt-auto">
        {primaryFeeds.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Select satellite ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex ? 'w-4 bg-primary-500' : 'w-1.5 bg-border hover:bg-surfaceHighlight'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
