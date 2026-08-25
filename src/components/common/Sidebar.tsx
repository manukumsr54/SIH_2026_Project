import React from 'react';
import { 
  LayoutDashboard, MapPin, Satellite, Sliders, 
  ClipboardCheck, Users, Network, BarChart2, Settings, Info
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAppContext } from '../../context/AppContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/live-map', icon: MapPin, label: 'Live Map' },
  { path: '/satellite-feed', icon: Satellite, label: 'Satellite Feed' },
  { path: '/priority-queue', icon: Sliders, label: 'Priority Queue' },
  { path: '/damage-assessment', icon: ClipboardCheck, label: 'Damage Assessment' },
  { path: '/rescue-teams', icon: Users, label: 'Rescue Teams' },
  { path: '/offline-maps', icon: Network, label: 'Offline Maps' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/about', icon: Info, label: 'About RAKSHA' }
];

export const Sidebar: React.FC = () => {
  const { isMobileSidebarOpen, setMobileSidebarOpen, systemStatus } = useAppContext();
  const lastUpdated = systemStatus?.lastUpdated || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';
  const isOperational = systemStatus?.status === 'OPERATIONAL' || !systemStatus;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      <aside className={clsx(
        "w-[260px] h-screen bg-background border-r border-border flex flex-col flex-shrink-0 z-50 transition-transform duration-300",
        "fixed lg:static top-0 bottom-0 left-0",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand / Official Logo */}
        <div className="p-5 pb-6 flex items-center gap-3 border-b border-border/40">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/95 flex items-center justify-center shadow-[0_0_15px_rgba(29,78,216,0.3)] border border-primary-500/40 flex-shrink-0">
            <img 
              src="/raksha-logo.jpg" 
              alt="RAKSHA Logo" 
              className="w-full h-full object-contain p-0.5" 
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-lg tracking-wider text-white leading-tight">RAKSHA</span>
            <span className="text-[9.5px] font-semibold text-primary-400 uppercase tracking-widest truncate">From Space to Safety</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary-600 text-white shadow-[0_0_15px_rgba(29,78,216,0.3)] border border-primary-500/50" 
                  : "text-text-secondary hover:text-white hover:bg-surfaceHighlight transparent"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={clsx("transition-colors", isActive ? "text-white" : "text-text-tertiary")} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Status */}
        <div className="p-4 mt-auto">
          <div className="bg-[#0B1423] border border-[#1E2D4A] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOperational ? 'bg-status-safe shadow-[0_0_8px_#22c55e]' : 'bg-status-high'} animate-pulse-dot`} />
              <span className="text-xs font-semibold text-text-secondary tracking-wider">SYSTEM STATUS</span>
            </div>
            <span className={`text-sm font-medium ${isOperational ? 'text-status-safe' : 'text-status-high'}`}>
              {isOperational ? 'All Systems Operational' : 'Degraded System Sync'}
            </span>
            
            {/* SVG Sparkline matching the reference */}
            <div className="mt-2 h-8 w-full">
              <svg viewBox="0 0 100 20" className="w-full h-full preserve-aspect-ratio-none">
                <polyline 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="1.5" 
                  points="0,15 10,12 20,18 30,8 40,16 50,4 60,14 70,8 80,16 90,6 100,10" 
                  vectorEffect="non-scaling-stroke"
                  className="opacity-80"
                />
              </svg>
            </div>
            
            <div className="text-[10px] text-text-tertiary mt-2">
              Last Updated: {lastUpdated}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
