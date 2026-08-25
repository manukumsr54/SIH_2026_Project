import React, { useState } from 'react';
import { Car, MapPin, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const RescueTeamsView: React.FC = () => {
  const { teams, disasters, assignTeam, deassignTeam, auditEvents } = useAppContext();
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || 't1');
  const [selectedDisasterId, setSelectedDisasterId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeassignModalOpen, setIsDeassignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const assignedDisaster = selectedTeam?.assignedDisasterId 
    ? disasters.find(d => d.id === selectedTeam.assignedDisasterId)
    : null;

  const handleAssign = async () => {
    if (selectedTeamId && selectedDisasterId) {
      setIsAssigning(true);
      await assignTeam(selectedTeamId, selectedDisasterId);
      const dis = disasters.find(d => d.id === selectedDisasterId);
      setToastMessage(`Team ${selectedTeam.name} successfully deployed to ${dis?.name || 'zone'}`);
      setSelectedDisasterId('');
      setIsAssigning(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleConfirmDeassign = async () => {
    if (selectedTeam) {
      setIsAssigning(true);
      await deassignTeam(selectedTeam.id);
      setIsDeassignModalOpen(false);
      setToastMessage(`Team ${selectedTeam.name} has been deassigned and returned to Available pool.`);
      setIsAssigning(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-status-safe/20 text-status-safe border border-status-safe/30';
      case 'On Mission':
      case 'Assigned':
        return 'bg-status-high/20 text-status-high border border-status-high/30';
      case 'En Route':
        return 'bg-primary-600/20 text-primary-400 border border-primary-500/30';
      default:
        return 'bg-surfaceHighlight text-text-secondary border border-border';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 lg:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white mb-1 flex items-center gap-2">
            <Car size={22} className="text-primary-500" />
            Rescue Teams Dispatch & Fleet Control
          </h1>
          <p className="text-text-secondary text-xs lg:text-sm">Manage ground units, assign operational disaster zones, and deassign completed missions</p>
        </div>
        {toastMessage && (
          <div className="bg-status-safe/20 border border-status-safe text-status-safe px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium animate-fadeIn">
            <CheckCircle2 size={14} /> {toastMessage}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0">
        {/* Left Side: Team List */}
        <div className="w-full lg:w-[380px] flex flex-col gap-3 overflow-y-auto pr-2 flex-shrink-0 lg:flex-shrink">
          {teams.map(team => (
            <div 
              key={team.id} 
              onClick={() => setSelectedTeamId(team.id)}
              className={`bg-surface border rounded-xl p-4 cursor-pointer transition-all ${
                selectedTeamId === team.id 
                  ? 'border-primary-500 bg-surfaceHighlight shadow-[0_0_15px_rgba(29,78,216,0.25)]' 
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Car size={16} className="text-primary-400" />
                  <h3 className="font-semibold text-white text-sm">{team.name}</h3>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getStatusBadge(team.status)}`}>
                  {team.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>Distance to Sector:</span>
                <span className="text-white font-medium">{team.distanceKm.toFixed(1)} km</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Team Details & Dispatch / Deassign Panel */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-6 flex flex-col">
          {selectedTeam ? (
            <>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 border-b border-border pb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-1.5">{selectedTeam.name}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className={`font-bold px-2 py-0.5 rounded ${getStatusBadge(selectedTeam.status)}`}>
                      {selectedTeam.status}
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span className="text-text-secondary flex items-center gap-1">
                      <MapPin size={13} className="text-primary-400" /> {selectedTeam.lat.toFixed(4)}°N, {selectedTeam.lng.toFixed(4)}°E
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span className="text-text-secondary">Base: {selectedTeam.baseStation || 'Main Sector Hub'}</span>
                  </div>
                </div>

                {/* Quick action button for deployed team */}
                {selectedTeam.status === 'On Mission' && (
                  <button 
                    onClick={() => setIsDeassignModalOpen(true)}
                    className="bg-status-critical/15 hover:bg-status-critical/25 text-status-critical border border-status-critical/40 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 self-start"
                  >
                    <X size={14} /> Deassign Team
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Team Info */}
                <div className="flex flex-col gap-4 bg-surfaceHighlight/30 p-5 rounded-xl border border-border/60">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Unit Specifications</h3>
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-text-tertiary">Personnel:</span> 
                      <span className="text-white font-medium">
                        {selectedTeam.members ? `${selectedTeam.members.length} Specialists` : `${selectedTeam.capacity || 12} Specialists`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-text-tertiary">Equipment:</span> 
                      <span className="text-white font-medium truncate max-w-[200px]" title={selectedTeam.equipment?.join(', ')}>
                        {selectedTeam.equipment ? selectedTeam.equipment.join(', ') : 'Boats, Ropes, Trauma Kit'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-text-tertiary">Active Target:</span> 
                      <span className={`font-semibold ${assignedDisaster ? 'text-status-high' : 'text-text-secondary'}`}>
                        {assignedDisaster ? `${assignedDisaster.name} (${assignedDisaster.sector})` : 'None (In Staging Base)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-tertiary">Last Telemetry Ping:</span> 
                      <span className="text-text-secondary">Just now (Live GPS)</span>
                    </div>
                  </div>
                </div>
                
                {/* Command & Control Dispatcher */}
                <div className="bg-surfaceHighlight/50 rounded-xl p-5 border border-border flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Command Dispatch</h3>
                    
                    {selectedTeam.status === 'Available' ? (
                      <div className="flex flex-col gap-3">
                        <label className="text-xs text-text-secondary">Select Target Disaster Sector</label>
                        <select 
                          value={selectedDisasterId}
                          onChange={(e) => setSelectedDisasterId(e.target.value)}
                          className="bg-background border border-border text-white text-xs rounded-lg p-2.5 outline-none focus:border-primary-500"
                        >
                          <option value="">-- Select an active disaster --</option>
                          {disasters.map(d => (
                            <option key={d.id} value={d.id}>{d.sector} - {d.name} ({d.riskLevel})</option>
                          ))}
                        </select>
                        
                        <button 
                          onClick={handleAssign}
                          disabled={!selectedDisasterId || isAssigning}
                          className="mt-2 w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/30 disabled:text-white/50 text-white py-2.5 rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(29,78,216,0.3)]"
                        >
                          {isAssigning ? 'Dispatching...' : 'Assign & Deploy Team'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-status-high/20 text-status-high flex items-center justify-center mb-2">
                          <Car size={18} />
                        </div>
                        <p className="text-sm text-white font-semibold mb-0.5">On Active Mission</p>
                        <p className="text-xs text-text-secondary mb-3">
                          Deployed to {assignedDisaster?.name || 'assigned zone'}.
                        </p>
                        
                        <button 
                          onClick={() => setIsDeassignModalOpen(true)}
                          className="bg-status-critical/20 hover:bg-status-critical text-status-critical hover:text-white border border-status-critical/50 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        >
                          Deassign / Close Mission
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-text-tertiary">
                    All assignments execute transactional PostgreSQL updates & broadcast live SSE events.
                  </div>
                </div>
              </div>

              {/* Assignment & Deployment History Log for Selected Team */}
              <div className="mt-auto bg-surfaceHighlight/20 rounded-xl p-4 border border-border/60">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mission & Deployment History</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary-600/20 text-primary-400 font-mono">
                      {selectedTeam.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-tertiary">Persistent DB Audit Log</span>
                </div>

                <div className="max-h-40 overflow-y-auto flex flex-col gap-2 text-xs pr-1">
                  {/* Active deployment if any */}
                  {assignedDisaster && (
                    <div className="p-2.5 rounded-lg bg-status-high/10 border border-status-high/30 flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-status-high animate-pulse" />
                        <div>
                          <span className="text-white font-semibold">Active Mission: {assignedDisaster.name}</span>
                          <span className="text-[10px] text-text-secondary block">{assignedDisaster.sector} • ETA ~ {Math.round((selectedTeam.distanceKm / 35) * 60)} mins</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-status-high/20 text-status-high border border-status-high/30">
                        DEPLOYED
                      </span>
                    </div>
                  )}

                  {/* Team Audit Events */}
                  {auditEvents.filter(e => e.entityId === selectedTeam.id || e.metadata?.teamId === selectedTeam.id).length > 0 ? (
                    auditEvents
                      .filter(e => e.entityId === selectedTeam.id || e.metadata?.teamId === selectedTeam.id)
                      .map((evt: any) => (
                        <div key={evt.id} className="p-2.5 rounded-lg bg-surfaceHighlight/50 border border-border/50 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${evt.eventType?.includes('ASSIGNED') ? 'bg-primary-500' : 'bg-status-safe'}`} />
                            <span className="text-white font-medium text-[11px]">{evt.description || evt.title}</span>
                          </div>
                          <span className="text-[10px] text-text-tertiary font-mono whitespace-nowrap ml-2">
                            {evt.timestamp || (evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString() : 'Recent')}
                          </span>
                        </div>
                      ))
                  ) : (
                    <div className="p-2.5 rounded-lg bg-surfaceHighlight/30 border border-border/40 flex justify-between items-center text-text-secondary text-[11px]">
                      <span>Staging base readiness verified at {selectedTeam.baseStation || 'Main Sector Hub'}.</span>
                      <span className="text-[10px] text-text-tertiary">Operational</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
               Select a rescue team from the list.
             </div>
          )}
        </div>
      </div>

      {/* Deassign Confirmation Modal */}
      {isDeassignModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-status-high/20 border border-status-high/40 flex items-center justify-center text-status-high">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Confirm Mission Deassignment</h3>
                <p className="text-xs text-text-secondary">Release ground unit back to staging pool</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              Remove <strong className="text-white">{selectedTeam.name}</strong> from assignment to <strong className="text-white">{assignedDisaster?.name || 'current sector'}</strong>? The mission will be marked as finished and the team will return to <span className="text-status-safe font-semibold">Available</span> status.
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeassignModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surfaceHighlight hover:bg-border text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeassign}
                disabled={isAssigning}
                className="px-4 py-2 rounded-lg bg-status-critical hover:bg-status-critical/80 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {isAssigning ? <RefreshCw size={12} className="animate-spin" /> : null}
                Confirm Deassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
