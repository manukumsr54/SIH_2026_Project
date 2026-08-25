import React, { useState } from 'react';
import { LiveDisasterMap } from '../components/dashboard/LiveDisasterMap';
import { Filter } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const LiveMapView: React.FC = () => {
  const { disasters, teams } = useAppContext();
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  const filteredDisasters = disasters.filter(d => 
    (filterRisk === 'All' || d.riskLevel === filterRisk) &&
    (filterType === 'All' || d.type === filterType)
  );

  const criticalCount = disasters.filter(d => d.riskLevel === 'Critical').length;
  const totalAffected = disasters.reduce((acc, curr) => acc + curr.affectedPopulation, 0);
  const activeTeams = teams.filter(t => t.status === 'On Mission').length;

  return (
    <div className="flex flex-col h-full bg-background p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white mb-1 flex items-center gap-3">
            Live Disaster Map
            <span className="text-[10px] bg-status-critical/20 text-status-critical border border-status-critical/50 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              LIVE
            </span>
          </h1>
          <p className="text-text-secondary text-xs lg:text-sm">Real-time satellite-derived disaster intelligence</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:flex gap-2 lg:gap-4">
          <div className="bg-surface border border-border rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Active Zones</div>
            <div className="text-white font-medium">{disasters.length}</div>
          </div>
          <div className="bg-surface border border-status-critical/30 rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] text-status-critical uppercase tracking-wider mb-1">Critical Zones</div>
            <div className="text-status-critical font-medium">{criticalCount}</div>
          </div>
          <div className="bg-surface border border-primary-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] text-primary-500 uppercase tracking-wider mb-1">Affected Pop</div>
            <div className="text-primary-500 font-medium">{(totalAffected / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-surface border border-status-high/30 rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] text-status-high uppercase tracking-wider mb-1">Active Teams</div>
            <div className="text-status-high font-medium">{activeTeams}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-4 mb-4">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 lg:flex-none">
          <Filter size={14} className="text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary">Risk:</span>
          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-transparent text-white text-xs outline-none border-none cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Safe">Safe</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 lg:flex-none">
          <Filter size={14} className="text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary">Type:</span>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-white text-xs outline-none border-none cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Flash Flood">Flood</option>
            <option value="Cyclone Impact">Cyclone</option>
            <option value="Landslide Area">Landslide</option>
            <option value="Heavy Rainfall">Heavy Rainfall</option>
          </select>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-border">
        {/* We can pass filters down later, but for now reuse the existing map. In a real scenario we'd pass filteredDisasters */}
        <LiveDisasterMap className="absolute inset-0" hideHeader={true} customDisasters={filteredDisasters} />
      </div>
    </div>
  );
};
