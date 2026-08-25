import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import clsx from 'clsx';
import { useAppContext } from '../../context/AppContext';

export const StatusCards: React.FC = () => {
  const { summaryMetrics, disasters } = useAppContext();

  // Dynamic values calculated directly from database records
  const criticalCount = summaryMetrics.criticalCount ?? disasters.filter(d => d.riskLevel === 'Critical').length;
  const highCount = summaryMetrics.highCount ?? disasters.filter(d => d.riskLevel === 'High').length;
  const mediumCount = summaryMetrics.mediumCount ?? disasters.filter(d => d.riskLevel === 'Medium').length;
  const safeCount = summaryMetrics.safeCount ?? disasters.filter(d => d.riskLevel === 'Safe').length;
  const totalPop = summaryMetrics.affectedPopulation ?? disasters.reduce((acc, d) => acc + (d.affectedPopulation || 0), 0);

  const formattedPop = totalPop >= 1000 ? `${(totalPop / 1000).toFixed(1)}K` : `${totalPop}`;

  const cards = [
    {
      id: 'critical',
      number: String(criticalCount).padStart(2, '0'),
      label: 'Critical',
      subtext: 'High Priority',
      icon: AlertTriangle,
      color: 'text-status-critical',
      bgBase: 'bg-status-critical/10',
      borderColor: 'border-status-critical/20'
    },
    {
      id: 'high',
      number: String(highCount).padStart(2, '0'),
      label: 'High',
      subtext: 'Need Attention',
      icon: Flame,
      color: 'text-status-high',
      bgBase: 'bg-status-high/10',
      borderColor: 'border-status-high/20'
    },
    {
      id: 'medium',
      number: String(mediumCount).padStart(2, '0'),
      label: 'Medium',
      subtext: 'Monitoring',
      icon: ShieldAlert,
      color: 'text-status-medium',
      bgBase: 'bg-status-medium/10',
      borderColor: 'border-status-medium/20'
    },
    {
      id: 'safe',
      number: String(safeCount).padStart(2, '0'),
      label: 'Safe',
      subtext: 'No Immediate Risk',
      icon: ShieldCheck,
      color: 'text-status-safe',
      bgBase: 'bg-status-safe/10',
      borderColor: 'border-status-safe/20'
    },
    {
      id: 'affected',
      number: formattedPop,
      label: 'Affected People',
      subtext: 'Across All Zones',
      icon: Users,
      color: 'text-primary-500',
      bgBase: 'bg-primary-500/10',
      borderColor: 'border-primary-500/20'
    }
  ];

  return (
    <div className="flex gap-4 mb-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible snap-x">
      {cards.map(card => (
        <div key={card.id} className="card-panel w-[160px] flex-shrink-0 lg:w-auto lg:flex-1 flex flex-row items-center gap-4 py-3 cursor-pointer hover:bg-surfaceHighlight transition-colors snap-start">
          <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center border", card.bgBase, card.color, card.borderColor)}>
            <card.icon size={18} />
          </div>
          <div className="flex flex-col">
            <div className={clsx("text-xl font-bold leading-none tracking-wide", card.color)}>
              {card.number}
            </div>
            <div className="text-white text-xs font-medium mt-1">{card.label}</div>
            <div className="text-text-tertiary text-[10px] truncate max-w-[90px]">{card.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
