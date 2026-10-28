import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  CheckCircle2,
  Target,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { AnalyticsSummary, TimelineActivity, CrmRecord } from '../types/crm';

interface DashboardViewProps {
  analytics: AnalyticsSummary | null;
  timeline: TimelineActivity[];
  records: CrmRecord[];
  onSelectRecord: (record: CrmRecord) => void;
  onOpenCreateDeal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  timeline,
  records,
  onSelectRecord,
  onOpenCreateDeal,
}) => {
  if (!analytics) return null;

  const oppRecords = records
    .filter((r) => r.objectId === 'opportunity')
    .sort((a, b) => (Number(b.values.amount) || 0) - (Number(a.values.amount) || 0))
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-zinc-950 select-none space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            TeraRobots CRM Executive Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Real-time pipeline metrics and stage velocity in INR (₹) powered by local Rust SQLite
          </p>
        </div>
        <button
          onClick={onOpenCreateDeal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs shadow-xs hover:shadow-sm hover:bg-slate-800 dark:hover:bg-zinc-100 transition-all duration-150 cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <Target className="w-3.5 h-3.5" />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-xs transition-all duration-150 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Total Pipeline Value</span>
            <span className="font-bold text-blue-500 text-sm">₹</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-zinc-100 mt-2 truncate">
            ₹{analytics.totalPipelineValue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span className="tabular-nums">{analytics.activeDealsCount} active open opportunities</span>
          </div>
        </div>

        {/* Weighted Pipeline */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-xs transition-all duration-150 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Weighted Pipeline</span>
            <Target className="w-4 h-4 text-purple-500 shrink-0" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-zinc-100 mt-2 truncate">
            ₹{Math.round(analytics.weightedPipelineValue).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 truncate">
            Probability adjusted revenue
          </div>
        </div>

        {/* Closed Won */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-xs transition-all duration-150 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Closed Won</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400 mt-2 truncate">
            {analytics.wonDealsCount} Deals
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
            {analytics.conversionRate.toFixed(1)}% win rate
          </div>
        </div>

        {/* Accounts & Contacts */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-xs transition-all duration-150 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Accounts & People</span>
            <Users className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-zinc-100 mt-2 truncate">
            {analytics.totalCompaniesCount} / {analytics.totalPeopleCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
            {analytics.pendingTasksCount} tasks pending review
          </div>
        </div>
      </div>

      {/* Pipeline Stage Distribution Funnel */}
      <div className="p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-4">
        <h3 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
          Deal Pipeline by Stage
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {analytics.dealsByStage.map((s) => (
            <div
              key={s.stage}
              className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 flex flex-col justify-between min-w-0 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 truncate">
                  {s.label}
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-zinc-100 mt-1 truncate">
                  {s.count} <span className="text-xs font-normal text-slate-400">deals</span>
                </div>
              </div>
              <div className="text-xs font-mono tabular-nums font-semibold text-slate-700 dark:text-zinc-300 mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800 truncate">
                ₹{s.value.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Top Deals & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top High-Value Deals */}
        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Top Deals in Pipeline
            </h3>
            <span className="text-[11px] text-slate-400">Sorted by ARR</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {oppRecords.map((opp) => (
              <div
                key={opp.id}
                onClick={() => onSelectRecord(opp)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/40 px-2 rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.99]"
              >
                <div>
                  <div className="font-medium text-xs text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {opp.values.name}
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
                    Stage: {opp.values.stage} · {opp.values.probability}% prob
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-zinc-100">
                    ₹{Number(opp.values.amount).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {opp.values.closeDate || 'No close date'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Recent Workspace Activity
            </h3>
            <span className="text-[11px] text-slate-400">Live Audit Trail</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
            {timeline.slice(0, 6).map((act) => (
              <div key={act.id} className="py-2.5 px-2 flex items-start gap-2.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    {act.description}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {new Date(act.createdAt).toLocaleString()} · {act.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
