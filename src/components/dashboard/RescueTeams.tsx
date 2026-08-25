import React from 'react';
import { Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export const RescueTeams: React.FC = () => {
  const { teams } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="card-panel col-span-1 lg:col-span-4 lg:h-[240px] flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-white font-medium text-sm">Rescue Teams</h2>
        <button 
          onClick={() => navigate('/rescue-teams')}
          className="text-primary-500 hover:text-primary-400 text-xs font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        {teams.map(team => (
          <div 
            key={team.id} 
            onClick={() => navigate('/rescue-teams')}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-surfaceHighlight/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
          >
            <div className="flex items-center gap-3">
              <Car size={16} className="text-text-secondary" />
              <span className="text-sm text-white font-medium truncate max-w-[140px]">{team.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-secondary">{team.distanceKm.toFixed(1)} km</span>
              <span className={`text-xs font-medium min-w-[70px] text-right ${
                team.status === 'Available' ? 'text-status-safe' : 'text-status-high'
              }`}>
                {team.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
