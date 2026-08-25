import React from 'react';
import { StatusCards } from '../components/dashboard/StatusCards';
import { LiveDisasterMap } from '../components/dashboard/LiveDisasterMap';
import { SatelliteFeed } from '../components/dashboard/SatelliteFeed';
import { PriorityQueue } from '../components/dashboard/PriorityQueue';
import { DamageAssessment } from '../components/dashboard/DamageAssessment';
import { RescueTeams } from '../components/dashboard/RescueTeams';
import { OfflineModeCard } from '../components/dashboard/OfflineModeCard';

export const DashboardView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background h-full w-full">
      <StatusCards />
      
      {/* Main Grid: 12 columns total on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100%-80px)] lg:min-h-[700px]">
        {/* Top left main area: Map (Col span 8, Row span 2) */}
        <LiveDisasterMap />
        
        {/* Top right side: Satellite (Col span 4) */}
        <SatelliteFeed />
        
        {/* Middle right side: Priority Queue (Col span 4) */}
        <PriorityQueue />
        
        {/* Bottom panels */}
        <DamageAssessment />
        <RescueTeams />
        <OfflineModeCard />
      </div>
    </div>
  );
};
