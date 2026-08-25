import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';
import { TopHeader } from './components/common/TopHeader';
import { DashboardView } from './views/DashboardView';
import { LiveMapView } from './views/LiveMapView';
import { SatelliteFeedView } from './views/SatelliteFeedView';
import { PriorityQueueView } from './views/PriorityQueueView';
import { DamageAssessmentView } from './views/DamageAssessmentView';
import { RescueTeamsView } from './views/RescueTeamsView';
import { OfflineMapsView } from './views/OfflineMapsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { AppProvider } from './context/AppContext';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-text-primary">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-hidden relative z-0 isolate">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/live-map" element={<LiveMapView />} />
            <Route path="/satellite-feed" element={<SatelliteFeedView />} />
            <Route path="/priority-queue" element={<PriorityQueueView />} />
            <Route path="/damage-assessment" element={<DamageAssessmentView />} />
            <Route path="/rescue-teams" element={<RescueTeamsView />} />
            <Route path="/offline-maps" element={<OfflineMapsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
