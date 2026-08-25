import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Disaster, RescueTeam, SatelliteFeed, DamageReport, SystemStatus, Notification } from '../types';
import { mockDisasters, mockRescueTeams, mockSatelliteFeeds, mockDamageReports } from '../data/mockData';
import { api } from '../services/api';
import { offlineDb } from '../offline/offlineDb';

interface AppContextType {
  isOffline: boolean;
  setOffline: (offline: boolean) => void;
  disasters: Disaster[];
  teams: RescueTeam[];
  satelliteFeeds: SatelliteFeed[];
  damageReports: DamageReport[];
  notifications: Notification[];
  auditEvents: any[];
  unreadNotificationsCount: number;
  selectedDisaster: Disaster | null;
  setSelectedDisaster: (disaster: Disaster | null) => void;
  assignTeam: (teamId: string, disasterId: string, notes?: string) => Promise<void>;
  deassignTeam: (teamId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  activeRegion: string;
  setActiveRegion: (regionId: string) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  systemStatus: SystemStatus | null;
  refreshData: () => Promise<void>;
  summaryMetrics: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    safeCount: number;
    affectedPopulation: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isOffline, setOffline] = useState(false);
  const [disasters, setDisasters] = useState<Disaster[]>(mockDisasters);
  const [teams, setTeams] = useState<RescueTeam[]>(mockRescueTeams);
  const [satelliteFeeds, setSatelliteFeeds] = useState<SatelliteFeed[]>(mockSatelliteFeeds);
  const [damageReports, setDamageReports] = useState<DamageReport[]>(mockDamageReports);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-01',
      title: 'High-risk flood zone detected',
      description: 'Odisha coastal sector requires immediate attention. Surge level exceeds 2.8m above datum.',
      timestamp: '2 min ago',
      severity: 'Critical',
      isRead: false,
      category: 'DISASTER',
      entityId: 'd2-odisha-cyclone',
      createdAt: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: 'notif-02',
      title: 'Sentinel-1 SAR Observation Ingested',
      description: 'Cloud-penetrating SAR scan of Alaknanda River Basin updated with 10m resolution flood extent.',
      timestamp: '14 min ago',
      severity: 'Medium',
      isRead: false,
      category: 'SATELLITE',
      entityId: 'sat-obs-001',
      createdAt: new Date(Date.now() - 840000).toISOString()
    },
    {
      id: 'notif-03',
      title: 'Rescue Unit Alpha Dispatched',
      description: 'NDRF Team Alpha mobilized to Uttarakhand Flash Flood Zone with amphibious crafts.',
      timestamp: '28 min ago',
      severity: 'Info',
      isRead: true,
      category: 'RESCUE',
      entityId: 't1',
      createdAt: new Date(Date.now() - 1680000).toISOString()
    }
  ]);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('reg-north-in');
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [summaryMetrics, setSummaryMetrics] = useState({
    criticalCount: 1,
    highCount: 2,
    mediumCount: 1,
    safeCount: 1,
    affectedPopulation: 127800
  });

  const refreshData = useCallback(async () => {
    try {
      const res = await api.getDashboardSummary();
      if (res.success && res.data) {
        const data = res.data;
        if (data.activeDisasters && data.activeDisasters.length > 0) {
          setDisasters(data.activeDisasters);
        }
        if (data.rescueTeams && data.rescueTeams.length > 0) {
          setTeams(data.rescueTeams);
        }
        if (data.satelliteFeeds && data.satelliteFeeds.length > 0) {
          setSatelliteFeeds(data.satelliteFeeds);
        }
        if (data.damageReports && data.damageReports.length > 0) {
          setDamageReports(data.damageReports);
        }
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
        if (data.systemStatus) {
          setSystemStatus(data.systemStatus);
        }
        setSummaryMetrics({
          criticalCount: data.criticalCount,
          highCount: data.highCount,
          mediumCount: data.mediumCount,
          safeCount: data.safeCount,
          affectedPopulation: data.affectedPopulation
        });
      } else {
        const cached = await offlineDb.getCachedDisasters();
        if (cached && cached.length > 0) {
          setDisasters(cached);
        }
      }

      // Also refresh audit history
      try {
        const histRes = await api.getAnalyticsHistory();
        if (histRes.success && Array.isArray(histRes.data)) {
          setAuditEvents(histRes.data);
        }
      } catch (e) {
        // non-blocking
      }
    } catch (err) {
      console.warn('Backend sync degraded, using cached state:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic status & notifications refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.getSystemStatus();
        if (res.success && res.data) {
          setSystemStatus(res.data);
        }
        const notifRes = await api.getNotifications();
        if (notifRes.success && notifRes.data) {
          setNotifications(notifRes.data);
        }
      } catch (e) {
        // ignore
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Server-Sent Events (SSE) live stream connection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('http://localhost:4000/api/events/stream');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'STATUS_UPDATED' && parsed.data) {
            setSystemStatus(parsed.data);
          } else if (parsed.type === 'NOTIFICATION_ADDED' && parsed.data) {
            setNotifications(prev => {
              if (prev.some(n => n.id === parsed.data.id)) return prev;
              return [parsed.data, ...prev];
            });
          } else if (parsed.type === 'EVENT_LOGGED' && parsed.data) {
            setAuditEvents(prev => {
              if (prev.some(e => e.id === parsed.data.id)) return prev;
              return [parsed.data, ...prev];
            });
            refreshData();
          } else if (parsed.type === 'DISASTERS_UPDATED' || parsed.type === 'TEAMS_UPDATED') {
            refreshData();
          }
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      // ignore
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [refreshData]);

  // Transactional Rescue Team Assignment
  const assignTeam = async (teamId: string, disasterId: string, notes?: string) => {
    // Optimistic UI update
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, status: 'On Mission', assignedDisasterId: disasterId } 
        : team
    ));

    try {
      const res = await api.assignTeam(teamId, disasterId, notes);
      if (res.success && res.data) {
        if (res.data.team) {
          setTeams(prev => prev.map(t => t.id === teamId ? res.data.team : t));
        }
        if (res.data.event) {
          setAuditEvents(prev => [res.data.event, ...prev.filter(e => e.id !== res.data.event.id)]);
        }
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to assign team on backend:', err);
    }
  };

  // Deassign Team
  const deassignTeam = async (teamId: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, status: 'Available', assignedDisasterId: undefined } 
        : team
    ));

    try {
      const res = await api.deassignTeam(teamId);
      if (res.success && res.data) {
        if (res.data.team) {
          setTeams(prev => prev.map(t => t.id === teamId ? res.data.team : t));
        }
        if (res.data.event) {
          setAuditEvents(prev => [res.data.event, ...prev.filter(e => e.id !== res.data.event.id)]);
        }
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to deassign team on backend:', err);
    }
  };

  // Mark notification read
  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await api.markNotificationRead(id);
    } catch (e) {
      // ignore
    }
  };

  // Mark all notifications read
  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (e) {
      // ignore
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider value={{
      isOffline, setOffline,
      disasters, teams, satelliteFeeds, damageReports,
      notifications, auditEvents, unreadNotificationsCount,
      selectedDisaster, setSelectedDisaster,
      assignTeam, deassignTeam,
      markNotificationRead, markAllNotificationsRead,
      activeRegion, setActiveRegion,
      isMobileSidebarOpen, setMobileSidebarOpen,
      systemStatus,
      refreshData,
      summaryMetrics
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
