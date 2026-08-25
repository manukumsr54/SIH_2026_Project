import React from 'react';
import { 
  ShieldCheck, 
  Satellite, 
  Flame, 
  Navigation, 
  Activity, 
  Layers, 
  Cpu, 
  Users, 
  Lightbulb, 
  Globe2, 
  CheckCircle2,
  ArrowRight,
  Database,
  Compass,
  Zap,
  Sparkles
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const teamMembers = [
    { name: 'Person 1', role: 'Research / Intelligence', focus: 'Disaster dynamics, hazard modeling & SAR methodologies' },
    { name: 'Person 2', role: 'Frontend / UI', focus: 'Emergency command UX, responsive design & design systems' },
    { name: 'Person 3', role: 'Backend / Systems', focus: 'Node/Express, PostgreSQL/PostGIS & real-time SSE telemetry' },
    { name: 'Person 4', role: 'Data / Analytics', focus: 'Priority scoring formulas, damage metrics & trend telemetry' },
    { name: 'Person 5', role: 'Maps / Geospatial', focus: 'Leaflet geospatial rendering, GeoJSON layers & offline road graphs' },
    { name: 'Person 6', role: 'Integration / Testing', focus: 'End-to-end verification, data pipelines & system reliability' }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'SATELLITE DATA',
      desc: 'Ingests multi-spectral & radar imagery from open constellations.',
      icon: Satellite,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30'
    },
    {
      step: '02',
      title: 'DISASTER DETECTION',
      desc: 'Rapid identification of flood inundation, thermal hotspots & seismic events.',
      icon: Flame,
      color: 'text-status-critical',
      bg: 'bg-status-critical/10',
      border: 'border-status-critical/30'
    },
    {
      step: '03',
      title: 'RISK & PRIORITY',
      desc: 'Dynamic 0-100 severity formula balancing population, urgency & hazard scale.',
      icon: Activity,
      color: 'text-status-high',
      bg: 'bg-status-high/10',
      border: 'border-status-high/30'
    },
    {
      step: '04',
      title: 'DAMAGE ASSESSMENT',
      desc: 'Before/after multi-spectral change analysis and structural triage.',
      icon: Layers,
      color: 'text-status-medium',
      bg: 'bg-status-medium/10',
      border: 'border-status-medium/30'
    },
    {
      step: '05',
      title: 'RESCUE COORDINATION',
      desc: 'Intelligent dispatch of emergency personnel and equipment tracking.',
      icon: Users,
      color: 'text-status-safe',
      bg: 'bg-status-safe/10',
      border: 'border-status-safe/30'
    },
    {
      step: '06',
      title: 'SAFE EVACUATION',
      desc: 'Disconnected graph-based routing steering evacuees away from hazard zones.',
      icon: Navigation,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
    }
  ];

  const researchAreas = [
    'Disaster monitoring & flood inundation tracking',
    'Satellite Earth observation (Optical & SAR)',
    'Emergency response & multi-agency command systems',
    'Evacuation planning & disconnected survivor guidance',
    'Offline navigation via localized vector road graphs',
    'Rescue team coordination & resource dispatch',
    'Damage assessment & structural impact triage'
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 lg:p-8 overflow-y-auto space-y-8">
      {/* Title / Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-primary-950/80 via-[#0B1423] to-[#0B1423] border border-[#1E2D4A] p-6 lg:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 max-w-4xl">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center shadow-[0_0_25px_rgba(29,78,216,0.4)] border border-primary-500/50 flex-shrink-0">
            <img 
              src="/raksha-logo.jpg" 
              alt="Official RAKSHA Logo" 
              className="w-full h-full object-contain p-1" 
            />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Satellite size={14} className="animate-pulse" /> Unified Disaster Intelligence Platform
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-1">
              RAKSHA
            </h1>
            <div className="text-sm lg:text-base font-bold text-primary-400 tracking-widest uppercase mb-2">
              FROM SPACE TO SAFETY
            </div>
            <p className="text-text-secondary text-xs lg:text-sm leading-relaxed">
              A comprehensive operational platform connecting orbital Earth observation telemetry with on-the-ground rescue logistics, risk assessment, and offline evacuation navigation.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Workflow Section: HOW RAKSHA WORKS */}
      <div className="card-panel">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-primary-500 font-semibold text-xs uppercase tracking-wider mb-1">
              <Zap size={14} /> End-To-End Operational Architecture
            </div>
            <h2 className="text-lg font-bold text-white">HOW RAKSHA WORKS</h2>
          </div>
          <span className="hidden sm:inline-flex text-[11px] px-2.5 py-1 rounded-full bg-primary-600/15 border border-primary-500/30 text-primary-400 font-mono">
            6-Stage Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl bg-surfaceHighlight/30 border ${step.border} flex flex-col justify-between relative group hover:bg-surfaceHighlight/50 transition-colors`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${step.bg} border ${step.border} flex items-center justify-center ${step.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-mono font-bold text-text-tertiary">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1.5 tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-text-tertiary">
                    <ArrowRight size={12} className="text-primary-500/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: WHY RAKSHA & HOW WE CAME UP WITH THE IDEA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Why We Built RAKSHA */}
        <div className="card-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-500 font-semibold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck size={16} /> Operational Mission
            </div>
            <h2 className="text-lg font-bold text-white mb-3">WHY WE BUILT RAKSHA</h2>
            <p className="text-text-secondary text-xs lg:text-sm leading-relaxed mb-3">
              During disasters, information can become fragmented, delayed, and difficult to act upon. While satellite imagery provides large-scale situational awareness, raw multi-band imagery alone is not enough to save lives.
            </p>
            <p className="text-text-secondary text-xs lg:text-sm leading-relaxed mb-4">
              RAKSHA combines six critical capabilities into one unified operational platform:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] text-white font-medium flex flex-col gap-1.5">
                <Satellite size={16} className="text-primary-400" />
                <span className="font-semibold text-xs">Satellite Intelligence</span>
              </div>
              <div className="p-3 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] text-white font-medium flex flex-col gap-1.5">
                <Flame size={16} className="text-status-critical" />
                <span className="font-semibold text-xs">Disaster Detection</span>
              </div>
              <div className="p-3 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] text-white font-medium flex flex-col gap-1.5">
                <Activity size={16} className="text-status-high" />
                <span className="font-semibold text-xs">Priority Analysis</span>
              </div>
              <div className="p-3 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] text-white font-medium flex flex-col gap-1.5">
                <Layers size={16} className="text-status-medium" />
                <span className="font-semibold text-xs">Damage Assessment</span>
              </div>
              <div className="p-3 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] text-white font-medium flex flex-col gap-1.5">
                <Users size={16} className="text-status-safe" />
                <span className="font-semibold text-xs">Rescue Coordination</span>
              </div>
              <div className="p-3 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] text-white font-medium flex flex-col gap-1.5">
                <Navigation size={16} className="text-cyan-400" />
                <span className="font-semibold text-xs">Offline Evacuation</span>
              </div>
            </div>
          </div>
        </div>

        {/* How We Came Up With The Idea */}
        <div className="card-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-500 font-semibold text-xs uppercase tracking-wider mb-2">
              <Lightbulb size={16} /> Conceptual Evolution
            </div>
            <h2 className="text-lg font-bold text-white mb-3">HOW WE CAME UP WITH THE IDEA</h2>
            <p className="text-text-secondary text-xs lg:text-sm leading-relaxed mb-3">
              The concept for RAKSHA emerged from examining systemic challenges in disaster response and identifying the critical gap between <strong>DATA</strong> and <strong>ACTION</strong>.
            </p>
            <p className="text-text-secondary text-xs lg:text-sm leading-relaxed mb-4">
              The project is dedicated to transforming complex satellite and geospatial information into immediate, actionable decisions across key research areas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {researchAreas.map((area, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-surfaceHighlight/30 border border-border/40 text-text-secondary">
                  <CheckCircle2 size={14} className="text-status-safe flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: DATA SOURCES & TECHNOLOGY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Sources */}
        <div className="card-panel">
          <div className="flex items-center gap-2 text-primary-500 font-semibold text-xs uppercase tracking-wider mb-2">
            <Globe2 size={16} /> Earth Observation & Telemetry Providers
          </div>
          <h2 className="text-lg font-bold text-white mb-1">DATA SOURCES / TECHNOLOGIES USED</h2>
          <p className="text-text-secondary text-xs mb-4">
            RAKSHA integrates normalized feeds from authoritative open geospatial and Earth observation sources:
          </p>

          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] flex justify-between items-start">
              <div>
                <div className="text-white font-bold text-sm">Copernicus / Sentinel</div>
                <div className="text-text-secondary mt-0.5">Earth observation imagery (Sentinel-1 SAR radar and Sentinel-2 Multi-Spectral optical)</div>
              </div>
              <span className="text-[10px] bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded font-mono flex-shrink-0 ml-2">
                Earth Observation
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] flex justify-between items-start">
              <div>
                <div className="text-white font-bold text-sm">USGS</div>
                <div className="text-text-secondary mt-0.5">Earthquake information & real-time seismic GeoJSON telemetry</div>
              </div>
              <span className="text-[10px] bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded font-mono flex-shrink-0 ml-2">
                Seismic Feed
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] flex justify-between items-start">
              <div>
                <div className="text-white font-bold text-sm">NASA FIRMS</div>
                <div className="text-text-secondary mt-0.5">Satellite fire/hotspot information (MODIS & VIIRS thermal anomalies)</div>
              </div>
              <span className="text-[10px] bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded font-mono flex-shrink-0 ml-2">
                Thermal Hotspots
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] flex justify-between items-start">
              <div>
                <div className="text-white font-bold text-sm">OpenStreetMap</div>
                <div className="text-text-secondary mt-0.5">Road and geographic data for regional offline graphs and safe routing</div>
              </div>
              <span className="text-[10px] bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded font-mono flex-shrink-0 ml-2">
                Geographic Data
              </span>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-text-tertiary italic">
            * Data sources are credited under open access licenses; no formal commercial endorsement is implied.
          </div>
        </div>

        {/* Technology Stack */}
        <div className="card-panel">
          <div className="flex items-center gap-2 text-primary-500 font-semibold text-xs uppercase tracking-wider mb-2">
            <Cpu size={16} /> Engineering Infrastructure
          </div>
          <h2 className="text-lg font-bold text-white mb-1">TECHNOLOGY STACK</h2>
          <p className="text-text-secondary text-xs mb-4">
            Production full-stack stack powering RAKSHA's real-time analytics and offline client capabilities:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A]">
              <div className="flex items-center gap-2 text-primary-400 font-bold mb-2">
                <Cpu size={15} /> Frontend
              </div>
              <ul className="text-text-secondary space-y-1.5">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> React</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> TypeScript</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Vite</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Leaflet</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Recharts</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A]">
              <div className="flex items-center gap-2 text-primary-400 font-bold mb-2">
                <Zap size={15} /> Backend
              </div>
              <ul className="text-text-secondary space-y-1.5">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Node.js</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Express</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> TypeScript</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A]">
              <div className="flex items-center gap-2 text-primary-400 font-bold mb-2">
                <Database size={15} /> Database
              </div>
              <ul className="text-text-secondary space-y-1.5">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> PostgreSQL</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> PostGIS</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A]">
              <div className="flex items-center gap-2 text-primary-400 font-bold mb-2">
                <Compass size={15} /> Offline / Geospatial
              </div>
              <ul className="text-text-secondary space-y-1.5">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> IndexedDB</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> OpenStreetMap</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Offline road graph</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="card-panel">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-primary-500 font-semibold text-xs uppercase tracking-wider">
            <Users size={16} /> Engineering & Research Contributors
          </div>
        </div>
        <h2 className="text-lg font-bold text-white mb-4">OUR TEAM</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surfaceHighlight/40 border border-[#1E2D4A] flex flex-col justify-between hover:border-primary-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white font-bold text-sm">{member.name}</span>
                  <span className="text-[10px] bg-[#0B1423] border border-border text-primary-400 px-2 py-0.5 rounded font-mono">
                    {member.role}
                  </span>
                </div>
                <p className="text-text-secondary text-xs leading-relaxed mt-2">
                  {member.focus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Scope */}
      <div className="card-panel">
        <div className="flex items-center gap-2 text-primary-500 font-semibold text-xs uppercase tracking-wider mb-2">
          <Sparkles size={16} /> Product Roadmap
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">FUTURE SCOPE</h2>
          <span className="text-[11px] text-text-tertiary font-mono">
            Upcoming Capabilities (Next Phases)
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surfaceHighlight/30 border border-[#1E2D4A] flex flex-col gap-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400" />
              AI-powered damage segmentation
            </h4>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              Automated building footprint extraction and neural severity segmentation directly on high-resolution multi-spectral satellite tiles.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surfaceHighlight/30 border border-[#1E2D4A] flex flex-col gap-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400" />
              Predictive disaster intelligence
            </h4>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              Hydrodynamic elevation flood propagation simulations and wildfire spread vector forecasting 6-12 hours in advance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surfaceHighlight/30 border border-[#1E2D4A] flex flex-col gap-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400" />
              Expanded satellite coverage
            </h4>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              Integration of sub-daily commercial SAR constellations and thermal infrared cubesats for near real-time global refresh rates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surfaceHighlight/30 border border-[#1E2D4A] flex flex-col gap-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400" />
              Larger offline regions
            </h4>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              Multi-state vector tile compression and regional elevation caching for complete offline statewide tactical operations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surfaceHighlight/30 border border-[#1E2D4A] flex flex-col gap-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400" />
              Advanced rescue optimization
            </h4>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              Multi-agent vehicle routing heuristics factoring fuel constraints, medical priority scores, and dynamically flooded roadways.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surfaceHighlight/30 border border-[#1E2D4A] flex flex-col gap-1.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400" />
              More automated emergency alerts
            </h4>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              Direct CAP (Common Alerting Protocol) broadcast dispatch over cell broadcast and localized mesh communication relays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
