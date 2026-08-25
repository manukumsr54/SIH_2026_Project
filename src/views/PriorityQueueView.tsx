import React from 'react';
import { useAppContext } from '../context/AppContext';

export const PriorityQueueView: React.FC = () => {
  const { disasters } = useAppContext();

  // Sort by risk score descending
  const sortedDisasters = [...disasters].sort((a, b) => b.riskScore - a.riskScore);

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Critical': return 'text-status-critical';
      case 'High': return 'text-status-high';
      case 'Medium': return 'text-status-medium';
      case 'Safe': return 'text-status-safe';
      default: return 'text-white';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-1">Priority Queue</h1>
        <p className="text-text-secondary text-sm">AI-assisted disaster response prioritization</p>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-xl flex flex-col min-h-0 overflow-hidden">
        {/* Table Header - hidden on mobile */}
        <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-border bg-surfaceHighlight text-xs font-semibold text-text-secondary uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-2">Sector</div>
          <div className="col-span-2">Disaster</div>
          <div className="col-span-1 text-center">Severity</div>
          <div className="col-span-1 text-center">Population</div>
          <div className="col-span-1 text-center">Infra</div>
          <div className="col-span-1 text-center">Urgency</div>
          <div className="col-span-1 text-center">Score</div>
          <div className="col-span-2 text-right">Recommended Action</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {sortedDisasters.map((disaster, index) => (
            <div 
              key={disaster.id}
              className="flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-4 p-4 border-b border-border/50 hover:bg-surfaceHighlight/50 cursor-pointer transition-colors lg:items-center text-sm"
            >
              {/* Mobile Card Header / Desktop Col 1-4 */}
              <div className="flex justify-between items-start lg:col-span-5 lg:grid lg:grid-cols-5 lg:gap-4 lg:items-center w-full">
                <div className="flex items-center gap-3 lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:w-full">
                  <div className="text-white font-bold text-lg lg:text-sm lg:col-span-1">{String(index + 1).padStart(2, '0')}</div>
                  <div className="text-white font-medium lg:col-span-2">{disaster.sector}</div>
                </div>
                <div className="flex flex-col items-end lg:items-start lg:col-span-2">
                  <span className="text-white font-medium lg:font-normal">{disaster.type}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${getRiskColor(disaster.riskLevel)}`}>{disaster.riskLevel}</span>
                </div>
              </div>

              {/* Mobile Card Body / Desktop Col 5-12 */}
              <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-4 mt-2 lg:mt-0 lg:col-span-7 lg:items-center w-full">
                <div className="flex flex-col lg:block text-center lg:col-span-1">
                  <span className="text-[10px] text-text-tertiary uppercase lg:hidden">Severity</span>
                  <span className="text-text-secondary">{disaster.severity}/100</span>
                </div>
                <div className="flex flex-col lg:block text-center lg:col-span-1">
                  <span className="text-[10px] text-text-tertiary uppercase lg:hidden">Pop</span>
                  <span className="text-text-secondary">{disaster.affectedPopulation >= 1000 ? (disaster.affectedPopulation/1000).toFixed(1) + 'k' : disaster.affectedPopulation}</span>
                </div>
                <div className="flex flex-col lg:block text-center lg:col-span-1">
                  <span className="text-[10px] text-text-tertiary uppercase lg:hidden">Infra</span>
                  <span className="text-text-secondary">{disaster.infrastructureDamage}/100</span>
                </div>
                <div className="flex flex-col lg:block text-center lg:col-span-1">
                  <span className="text-[10px] text-text-tertiary uppercase lg:hidden">Urgency</span>
                  <span className="text-text-secondary">{disaster.urgency}/100</span>
                </div>
                <div className="flex justify-between items-center col-span-4 lg:col-span-3 mt-3 pt-3 border-t border-border/30 lg:mt-0 lg:pt-0 lg:border-t-0 lg:block lg:text-right w-full">
                  <div className="flex items-center gap-2 lg:justify-center">
                    <span className="text-[10px] text-text-tertiary uppercase lg:hidden">Score</span>
                    <span className="font-bold text-white flex items-baseline">
                      {disaster.riskScore}
                      <span className="text-[9px] text-text-tertiary font-normal ml-0.5">/100</span>
                    </span>
                  </div>
                  <div className="text-xs text-primary-500 font-medium">
                    {disaster.riskLevel === 'Critical' ? 'Evacuate & Rescue' : 'Monitor & Dispatch'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
