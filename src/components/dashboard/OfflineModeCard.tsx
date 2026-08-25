import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export const OfflineModeCard: React.FC = () => {
  const { isOffline, setOffline } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="card-panel col-span-1 lg:col-span-3 lg:h-[240px] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-white font-medium text-sm">Offline Mode</h2>
        {isOffline ? (
          <span className="text-[10px] bg-status-critical/20 text-status-critical px-2 py-0.5 rounded font-bold uppercase">
            ACTIVE
          </span>
        ) : (
          <span className="text-[10px] bg-status-safe/20 text-status-safe px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
            <ShieldCheck size={10} /> READY
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-3 cursor-pointer group" onClick={() => setOffline(!isOffline)}>
          <div className={`absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity ${isOffline ? 'bg-status-critical' : 'bg-primary-500'}`}></div>
          <div className="w-12 h-12 rounded-full border border-border bg-surfaceHighlight flex items-center justify-center relative z-10">
            <WifiOff size={20} className={isOffline ? 'text-status-critical' : 'text-primary-500'} />
          </div>
        </div>
        
        <h3 className={`text-sm font-semibold mb-1 ${isOffline ? 'text-status-critical' : 'text-primary-500'}`}>
          {isOffline ? 'No Internet Connection' : 'Offline Ready'}
        </h3>
        <p className="text-xs text-text-secondary">
          {isOffline ? 'Running on cached offline routing engine.' : 'Click icon to simulate offline disconnection.'}
        </p>
        <p className="text-[11px] text-text-tertiary mt-1">
          4 Regional Packs & Shelter DB Stored.
        </p>
      </div>

      <button 
        onClick={() => navigate('/offline-maps')}
        className="w-full btn-primary bg-primary-600/20 hover:bg-primary-600 text-primary-500 hover:text-white border border-primary-600/50 transition-all text-xs py-2 font-medium"
      >
        View Offline Maps
      </button>
    </div>
  );
};
