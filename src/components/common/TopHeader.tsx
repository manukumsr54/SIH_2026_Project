import React, { useState, useEffect, useRef } from 'react';
import { Satellite, Bell, ChevronDown, Menu, CheckCircle, AlertTriangle, Info, Flame, X, Radio, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import type { SatelliteStatusResponse, Notification } from '../../types';

export const TopHeader: React.FC = () => {
  const { setMobileSidebarOpen, isOffline, satelliteFeeds, notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead } = useAppContext();
  
  // Notification Dropdown State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Satellite Dropdown State
  const [isSatOpen, setIsSatOpen] = useState(false);
  const [satStatus, setSatStatus] = useState<SatelliteStatusResponse | null>(null);
  const [isLoadingSat, setIsLoadingSat] = useState(false);
  const satRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (satRef.current && !satRef.current.contains(e.target as Node)) {
        setIsSatOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsSatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchSatelliteStatus = async () => {
    setIsLoadingSat(true);
    try {
      const res = await api.getSatelliteStatus();
      if (res.success && res.data) {
        setSatStatus(res.data);
      }
    } catch (e) {
      // fallback handled gracefully
    } finally {
      setIsLoadingSat(false);
    }
  };

  const toggleSatelliteDropdown = () => {
    if (!isSatOpen) {
      setIsNotifOpen(false);
      fetchSatelliteStatus();
    }
    setIsSatOpen(!isSatOpen);
  };

  const toggleNotificationDropdown = () => {
    if (!isNotifOpen) {
      setIsSatOpen(false);
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const getSeverityIcon = (severity: Notification['severity']) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle size={14} className="text-status-critical" />;
      case 'High': return <Flame size={14} className="text-status-high" />;
      case 'Medium': return <AlertTriangle size={14} className="text-status-medium" />;
      case 'Success': return <CheckCircle size={14} className="text-status-safe" />;
      default: return <Info size={14} className="text-primary-500" />;
    }
  };

  const satCount = satelliteFeeds.length > 0 ? satelliteFeeds.length * 4 : 12;

  // Default satellite sources if not yet loaded
  const satelliteSources = satStatus?.sources || [
    { id: '1', name: 'Sentinel-1A', type: 'SAR', status: 'Online', isLiveConnected: true, resolution: '10m C-SAR', revisitDays: '6 days', operator: 'ESA / Copernicus' },
    { id: '2', name: 'Sentinel-1C', type: 'SAR', status: 'Online', isLiveConnected: true, resolution: '10m All-Weather', revisitDays: '6 days', operator: 'ESA / Copernicus' },
    { id: '3', name: 'Sentinel-2A', type: 'Optical', status: 'Online', isLiveConnected: true, resolution: '10m MSI (13 bands)', revisitDays: '5 days', operator: 'ESA / Copernicus' },
    { id: '4', name: 'Sentinel-2B', type: 'Optical', status: 'Online', isLiveConnected: true, resolution: '10m RGB+NIR+SWIR', revisitDays: '5 days', operator: 'ESA / Copernicus' },
    { id: '5', name: 'Landsat 9', type: 'Optical', status: 'Monitoring', isLiveConnected: false, resolution: '15m / 30m OLI-2', revisitDays: '16 days', operator: 'NASA / USGS' },
    { id: '6', name: 'INSAT-3DR', type: 'Meteorological', status: 'Monitoring', isLiveConnected: false, resolution: '1km VIS / 4km IR', revisitDays: 'Continuous', operator: 'ISRO' }
  ];

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-background relative z-40">
      <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden text-text-secondary hover:text-white transition-colors flex-shrink-0"
          aria-label="Toggle navigation"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-sm lg:text-base font-medium text-white truncate hidden sm:block">Satellite Disaster Intelligence System</h1>
        <h1 className="text-sm font-medium text-white sm:hidden">RAKSHA</h1>
        
        {!isOffline ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-status-safe shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] lg:text-xs font-semibold text-status-safe tracking-wider">LIVE</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-status-high shadow-[0_0_8px_#f97316]" />
            <span className="text-[10px] lg:text-xs font-semibold text-status-high tracking-wider">OFFLINE</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-shrink-0">
        {/* Satellites Online - Clickable to open Status Popup */}
        <div className="relative" ref={satRef}>
          <button 
            onClick={toggleSatelliteDropdown}
            className="flex items-center gap-2 lg:gap-2.5 text-text-secondary hover:text-white transition-colors group cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-surfaceHighlight"
            title="Click to view satellite network status"
            aria-expanded={isSatOpen}
          >
            <Satellite size={16} className="text-primary-500 group-hover:scale-110 transition-transform lg:w-[18px] lg:h-[18px]" />
            <span className="text-xs lg:text-sm underline-offset-4 group-hover:underline font-medium text-white whitespace-nowrap">
              {satCount} Satellites Online
            </span>
          </button>

          {/* Satellite Network Status Popup / Dropdown */}
          {isSatOpen && (
            <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 md:right-0 md:left-auto md:translate-x-0 mt-2 w-80 sm:w-[420px] bg-[#0B1423]/95 backdrop-blur-xl border border-[#1E2D4A] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-fadeIn">
              {/* Header */}
              <div className="p-4 bg-surfaceHighlight/80 border-b border-border/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/40 flex items-center justify-center text-primary-400">
                    <Satellite size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Satellite Network</h3>
                    <p className="text-[11px] text-text-secondary">Orbital Earth Observation Telemetry</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={fetchSatelliteStatus}
                    className="text-text-tertiary hover:text-white p-1.5 rounded-lg transition-colors"
                    title="Refresh status"
                  >
                    <RefreshCw size={14} className={isLoadingSat ? "animate-spin text-primary-400" : ""} />
                  </button>
                  <button 
                    onClick={() => setIsSatOpen(false)}
                    className="text-text-tertiary hover:text-white p-1.5 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Summary Stats Cards */}
              <div className="p-3 bg-surfaceHighlight/30 border-b border-border/60 grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0B1423]/70 border border-border/60 p-2.5 rounded-lg">
                  <div className="text-base font-bold text-white mb-0.5">
                    {satStatus?.totalSources || satelliteSources.length}
                  </div>
                  <div className="text-[9px] text-text-secondary uppercase tracking-wider">Available Sources</div>
                </div>
                <div className="bg-[#0B1423]/70 border border-border/60 p-2.5 rounded-lg">
                  <div className="text-base font-bold text-status-safe mb-0.5">
                    {satStatus?.onlineCount || satelliteSources.filter(s => s.status === 'Online').length}
                  </div>
                  <div className="text-[9px] text-text-secondary uppercase tracking-wider">Online</div>
                </div>
                <div className="bg-[#0B1423]/70 border border-border/60 p-2.5 rounded-lg">
                  <div className="text-base font-bold text-status-medium mb-0.5">
                    {satStatus?.monitoringCount || satelliteSources.filter(s => s.status !== 'Online').length}
                  </div>
                  <div className="text-[9px] text-text-secondary uppercase tracking-wider">Monitoring</div>
                </div>
              </div>

              {/* Constellation Source List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-border/40 p-2 space-y-1">
                {satelliteSources.map((source: any) => (
                  <div key={source.id} className="p-2.5 rounded-lg hover:bg-surfaceHighlight/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        source.status === 'Online' ? 'bg-status-safe shadow-[0_0_6px_#22c55e]' : 'bg-status-medium'
                      }`} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span className="truncate">{source.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface border border-border text-primary-400 font-mono flex-shrink-0">
                            {source.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-text-secondary truncate mt-0.5">
                          {source.resolution} • {source.operator}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        source.status === 'Online' ? 'bg-status-safe/20 text-status-safe' : 'bg-status-medium/20 text-status-medium'
                      }`}>
                        {source.status}
                      </span>
                      <div className="text-[9px] text-text-tertiary mt-0.5">
                        {source.revisitDays}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Synchronization & Data Notice */}
              <div className="p-3 bg-surfaceHighlight/50 border-t border-border/80 flex items-center justify-between text-[11px] text-text-tertiary">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-primary-500" />
                  <span>Last Synchronization:</span>
                </div>
                <span className="font-semibold text-text-secondary font-mono">
                  {satStatus?.lastSynchronization || (new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-border" />

        {/* Notifications Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={toggleNotificationDropdown}
            className="relative text-text-secondary hover:text-white transition-colors p-1.5 rounded-lg hover:bg-surfaceHighlight"
            title="Operational Alerts"
            aria-expanded={isNotifOpen}
          >
            <Bell size={18} className="lg:w-5 lg:h-5" />
            {!isOffline && unreadNotificationsCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-status-critical rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-background animate-pulse">
                {unreadNotificationsCount}
              </div>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B1423]/95 backdrop-blur-xl border border-[#1E2D4A] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-fadeIn">
              <div className="p-4 bg-surfaceHighlight/80 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Operational Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] bg-status-critical/20 text-status-critical px-2 py-0.5 rounded font-bold">
                      {unreadNotificationsCount} New
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button 
                    onClick={() => markAllNotificationsRead()}
                    className="text-[11px] text-primary-500 hover:text-primary-400 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Informational Alert Section */}
              <div className="px-4 py-2 bg-primary-600/10 border-b border-primary-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio size={12} className="text-primary-500 animate-pulse" />
                  <span className="text-[11px] text-primary-400 font-medium">LIVE ALERTS AVAILABLE</span>
                </div>
                <span className="text-[10px] text-text-tertiary">Realtime SSE Stream Active</span>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 hover:bg-surfaceHighlight/60 cursor-pointer transition-colors flex gap-3 ${
                        !notif.isRead ? 'bg-surfaceHighlight/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {getSeverityIcon(notif.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className={`text-xs font-medium truncate ${!notif.isRead ? 'text-white font-semibold' : 'text-text-primary'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-text-tertiary whitespace-nowrap ml-2 font-mono">
                            {notif.timestamp && !notif.timestamp.includes('T') ? notif.timestamp : (notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Just now')}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                          {notif.description}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-text-secondary">
                    No active notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-medium text-xs lg:text-sm">
            M
          </div>
          <span className="hidden sm:block text-xs lg:text-sm text-text-primary group-hover:text-white transition-colors">Muskan</span>
          <ChevronDown size={14} className="hidden sm:block text-text-tertiary group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
};
