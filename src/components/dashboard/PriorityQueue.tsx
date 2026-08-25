import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { RiskLevel } from '../../types';

export const PriorityQueue: React.FC = () => {
  const { disasters, setSelectedDisaster } = useAppContext();
  const navigate = useNavigate();

  const getRiskColor = (risk: RiskLevel) => {
    switch(risk) {
      case 'Critical': return 'text-status-critical';
      case 'High': return 'text-status-high';
      case 'Medium': return 'text-status-medium';
      case 'Safe': return 'text-status-safe';
      default: return 'text-white';
    }
  };

  const getRiskBadgeColor = (risk: RiskLevel) => {
    switch(risk) {
      case 'Critical': return 'bg-status-critical/10 border-status-critical/30 text-status-critical';
      case 'High': return 'bg-status-high/10 border-status-high/30 text-status-high';
      case 'Medium': return 'bg-status-medium/10 border-status-medium/30 text-status-medium';
      case 'Safe': return 'bg-status-safe/10 border-status-safe/30 text-status-safe';
      default: return 'bg-surfaceHighlight border-border text-white';
    }
  };

  // Sort by risk score descending
  const sortedDisasters = [...disasters].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="card-panel col-span-1 lg:col-span-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-medium text-sm">Priority Queue</h2>
        <button 
          onClick={() => navigate('/priority-queue')}
          className="text-primary-500 hover:text-primary-400 text-xs font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
        {sortedDisasters.map((disaster, index) => (
          <div 
            key={disaster.id}
            onClick={() => {
              setSelectedDisaster(disaster);
              navigate('/priority-queue');
            }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-surfaceHighlight/50 cursor-pointer transition-colors border border-transparent hover:border-border/50 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-md border flex items-center justify-center font-bold text-sm ${getRiskBadgeColor(disaster.riskLevel)}`}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{disaster.sector}</span>
                <span className="text-[11px] text-text-secondary">{disaster.type} • {disaster.riskLevel} Risk</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <span className={`text-xs font-bold ${getRiskColor(disaster.riskLevel)}`}>
                {disaster.riskScore}/100
              </span>
              <div className="flex items-center gap-1.5 text-text-secondary group-hover:text-white transition-colors">
                <Users size={12} />
                <span className="text-xs">{disaster.affectedPopulation >= 1000 ? (disaster.affectedPopulation/1000).toFixed(0) + 'k' : disaster.affectedPopulation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
