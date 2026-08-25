import { request } from './apiClient';
import type { 
  Disaster, 
  RescueTeam, 
  SatelliteFeed, 
  DamageReport, 
  OfflineRegion, 
  EvacuationRoute, 
  SystemStatus,
  Notification,
  SatelliteStatusResponse
} from '../../types';

export interface DashboardSummaryData {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  safeCount: number;
  affectedPopulation: number;
  activeDisasters: Disaster[];
  latestSatelliteObservation: SatelliteFeed | null;
  satelliteFeeds: SatelliteFeed[];
  priorityQueue: Disaster[];
  rescueTeams: RescueTeam[];
  damageReports: DamageReport[];
  systemStatus: SystemStatus;
  notifications?: Notification[];
}

export const api = {
  // Dashboard
  getDashboardSummary: () => request<DashboardSummaryData>('/dashboard/summary'),

  // Disasters
  getDisasters: (params?: { riskLevel?: string; type?: string; state?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<Disaster[]>(`/disasters${query ? `?${query}` : ''}`);
  },
  getActiveDisasters: () => request<Disaster[]>('/disasters/active'),
  getDisasterById: (id: string) => request<Disaster>(`/disasters/${id}`),
  createDisaster: (data: Partial<Disaster>) => 
    request<Disaster>('/disasters', { method: 'POST', body: JSON.stringify(data) }),

  // Map
  getMapLayers: () => request<any>('/map/layers'),

  // Satellite
  getSatelliteFeeds: () => request<SatelliteFeed[]>('/satellite/observations'),
  getSatelliteFeedById: (id: string) => request<SatelliteFeed>(`/satellite/observations/${id}`),
  getSatelliteStatus: () => request<SatelliteStatusResponse>('/satellite/status'),

  // Damage
  getDamageReports: (disasterId?: string) => 
    request<DamageReport[]>(`/damage-assessments${disasterId ? `?disasterId=${disasterId}` : ''}`),
  getDamageReportById: (id: string) => request<DamageReport>(`/damage-assessments/${id}`),

  // Rescue
  getRescueTeams: () => request<RescueTeam[]>('/rescue-teams'),
  getRescueAssignments: () => request<any[]>('/rescue/assignments'),
  getRescueTeamHistory: (teamId: string) => request<{ teamId: string; assignments: any[]; events: any[] }>(`/rescue/teams/${teamId}/history`),
  assignTeam: (teamId: string, disasterId: string, notes?: string) =>
    request<{ assignment: any; team: RescueTeam; event: any }>('/rescue/assignments', {
      method: 'POST',
      body: JSON.stringify({ teamId, disasterId, notes })
    }),
  deassignTeam: (teamId: string) =>
    request<{ team: RescueTeam; assignment: any; event: any }>(`/rescue/teams/${teamId}/deassign`, {
      method: 'POST'
    }),
  syncSatelliteFeed: () => request<SatelliteFeed[]>('/satellite/sync', { method: 'POST' }),
  updateDamageAssessment: (id: string, updates: any) =>
    request<DamageReport>(`/damage-assessments/${id}/update`, {
      method: 'POST',
      body: JSON.stringify(updates)
    }),

  // Offline & Routing
  getOfflineRegions: () => request<OfflineRegion[]>('/offline/regions'),
  syncOfflineRegion: (id: string) => 
    request<{ region: OfflineRegion; safeLocations: any[]; disasters: any[] }>(`/offline/regions/${id}/sync`, { method: 'POST' }),
  calculateSafeRoute: (userLat: number, userLng: number) =>
    request<EvacuationRoute>('/offline/route', {
      method: 'POST',
      body: JSON.stringify({ userLat, userLng })
    }),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) => request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),

  // Analytics
  getAnalyticsOverview: (range: string = '7d') => request<any>(`/analytics/overview?range=${range}`),
  getAnalyticsHistory: () => request<any[]>('/analytics/history'),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (updates: any) => 
    request<any>('/settings', { method: 'PATCH', body: JSON.stringify(updates) }),

  // System
  getSystemStatus: () => request<SystemStatus>('/system/status'),
  syncSystem: () => request<SystemStatus>('/system/sync', { method: 'POST' })
};
