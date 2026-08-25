import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const { isOffline, setOffline } = useAppContext();
  
  const [settings, setSettings] = useState({
    refreshInterval: '30s',
    criticalAlerts: true,
    highRiskAlerts: true,
    evacuationAlerts: true,
    mapStyle: 'Satellite',
    autoSync: true
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (e) {
        // ignore
      }
    }
    loadSettings();
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await api.updateSettings({ [key]: updated[key] });
    } catch (e) {
      console.warn('Failed to persist settings to backend:', e);
    }
  };

  const handleIntervalChange = async (val: string) => {
    const updated = { ...settings, refreshInterval: val };
    setSettings(updated);
    try {
      await api.updateSettings({ refreshInterval: val });
    } catch (e) {
      console.warn('Failed to persist settings to backend:', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 lg:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-white mb-1">System Settings</h1>
        <p className="text-text-secondary text-sm">Configure RAKSHA operational preferences (Persisted in PostgreSQL)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl">
        {/* System Settings */}
        <div className="bg-surface border border-border p-6 rounded-xl">
          <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">System</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white font-medium">Demo Mode / Offline</div>
                <div className="text-xs text-text-secondary">Simulate network disconnection</div>
              </div>
              <button 
                onClick={() => setOffline(!isOffline)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isOffline ? 'bg-primary-600' : 'bg-border'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${isOffline ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white font-medium">Refresh Interval</div>
                <div className="text-xs text-text-secondary">Data sync frequency</div>
              </div>
              <select 
                value={settings.refreshInterval}
                onChange={(e) => handleIntervalChange(e.target.value)}
                className="bg-background border border-border text-white text-sm rounded-lg p-2 outline-none focus:border-primary-500"
              >
                <option value="10s">10 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="1m">1 minute</option>
                <option value="5m">5 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-surface border border-border p-6 rounded-xl">
          <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Alerts</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white font-medium text-status-critical">Critical Alerts</div>
                <div className="text-xs text-text-secondary">Push notifications for critical risk</div>
              </div>
              <button 
                onClick={() => handleToggle('criticalAlerts')}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.criticalAlerts ? 'bg-status-critical' : 'bg-border'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${settings.criticalAlerts ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white font-medium text-status-high">High-Risk Alerts</div>
                <div className="text-xs text-text-secondary">Push notifications for high risk</div>
              </div>
              <button 
                onClick={() => handleToggle('highRiskAlerts')}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.highRiskAlerts ? 'bg-status-high' : 'bg-border'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${settings.highRiskAlerts ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Map & Account */}
        <div className="bg-surface border border-border p-6 rounded-xl">
          <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Account</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-medium text-lg">M</div>
                <div>
                  <div className="text-sm text-white font-medium">Muskan</div>
                  <div className="text-xs text-text-secondary">Disaster Response Commander</div>
                </div>
              </div>
            </div>
            
            <button className="text-sm text-status-critical font-medium text-left hover:text-white transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
