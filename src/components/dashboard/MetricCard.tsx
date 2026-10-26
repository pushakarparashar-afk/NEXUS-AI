import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number; // e.g. +12.5 or -4.2
  changeLabel?: string;
  sparklineData?: number[];
  icon: LucideIcon;
  iconColor?: string;
  sparklineColor?: string;
  tooltipText?: string;
  inverseTrend?: boolean; // if true, negative change is positive (e.g. resolution time)
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  changePercent,
  changeLabel = 'vs previous period',
  sparklineData,
  icon: Icon,
  iconColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  sparklineColor = '#6366f1',
  tooltipText,
  inverseTrend = false,
}) => {
  const isPositive = (changePercent ?? 0) > 0;
  const isNeutral = changePercent === undefined || changePercent === 0;

  // For metrics where a decrease is good (like resolution time or unassigned count)
  const isGood = inverseTrend ? !isPositive : isPositive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all text-slate-100"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>{title}</span>
          {tooltipText && (
            <div className="relative group/tip cursor-help">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tip:block w-48 p-2 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-slate-300 shadow-xl z-20 pointer-events-none text-center">
                {tooltipText}
              </div>
            </div>
          )}
        </div>
        <div className={cn('p-2 rounded-xl border', iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Value & Sparkline */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        {sparklineData && <Sparkline data={sparklineData} color={sparklineColor} height={26} />}
      </div>

      {/* Change Percentage */}
      {changePercent !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'flex items-center font-semibold px-1.5 py-0.5 rounded text-[11px]',
              isNeutral
                ? 'bg-slate-800 text-slate-400'
                : isGood
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            )}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3 mr-0.5" />
            ) : isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {Math.abs(changePercent)}%
          </span>
          <span className="text-[11px] text-slate-400 truncate">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
};
