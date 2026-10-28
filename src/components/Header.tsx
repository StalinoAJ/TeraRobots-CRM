import React from 'react';
import {
  Table,
  Kanban,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ObjectMetadata, CrmView } from '../types/crm';

interface HeaderProps {
  currentObject?: ObjectMetadata;
  activeViewType: 'TABLE' | 'KANBAN';
  onToggleViewType: (type: 'TABLE' | 'KANBAN') => void;
  views: CrmView[];
  activeViewId?: string;
  onSelectView: (viewId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateRecord: () => void;
  onRefresh: () => void;
  isCustomObject?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentObject,
  activeViewType,
  onToggleViewType,
  views,
  activeViewId,
  onSelectView,
  searchQuery,
  onSearchChange,
  onOpenCreateRecord,
  onRefresh,
}) => {
  if (!currentObject) return null;

  const supportsKanban =
    currentObject.id === 'opportunity' ||
    currentObject.id === 'task' ||
    currentObject.fields.some((f) => f.fieldType === 'SELECT');

  return (
    <header className="h-14 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6 flex items-center justify-between gap-3 select-none shrink-0 min-w-0">
      {/* Title & View tabs */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0 overflow-x-auto py-1">
        <div className="shrink-0">
          <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{currentObject.labelPlural}</span>
            {currentObject.isCustom && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shrink-0">
                Custom
              </span>
            )}
          </h1>
        </div>

        {/* View Selection Dropdown or Tabs */}
        {views.length > 1 && (
          <div className="flex items-center bg-slate-100/80 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shrink-0">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  onSelectView(v.id);
                  if (v.viewType) onToggleViewType(v.viewType);
                }}
                className={`px-3 py-1 text-xs rounded-md font-medium cursor-pointer transition-all duration-150 whitespace-nowrap active:scale-[0.98] ${
                  activeViewId === v.id
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Table / Kanban switch */}
        {supportsKanban && (
          <div className="flex items-center bg-slate-100/80 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shrink-0">
            <button
              onClick={() => onToggleViewType('TABLE')}
              title="Spreadsheet Table View"
              className={`p-1.5 rounded-md cursor-pointer transition-all duration-150 active:scale-95 ${
                activeViewType === 'TABLE'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewType('KANBAN')}
              title="Kanban Board View"
              className={`p-1.5 rounded-md cursor-pointer transition-all duration-150 active:scale-95 ${
                activeViewType === 'KANBAN'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Actions & Search */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder={`Filter ${currentObject.labelPlural.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-32 sm:w-44 md:w-52 transition-all duration-150 shadow-2xs"
          />
        </div>

        <button
          onClick={onRefresh}
          title="Refresh Data from Rust Storage"
          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-all duration-150 cursor-pointer shrink-0 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenCreateRecord}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-100 text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New {currentObject.labelSingular}</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
};
