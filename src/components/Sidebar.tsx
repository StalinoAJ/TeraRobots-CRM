import React from 'react';
import {
  Building2,
  User,
  Target,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Settings,
  Plus,
  Search,
  Layers,
  Download,
  RotateCcw,
  Sun,
  Moon,
  Database,
} from 'lucide-react';
import { ObjectMetadata, CrmRecord } from '../types/crm';

interface SidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  objects: ObjectMetadata[];
  records: CrmRecord[];
  onOpenCommandMenu: () => void;
  onOpenCreateObject: () => void;
  onExportData: () => void;
  onResetData: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  User,
  Target,
  CheckSquare,
  FileText,
  Layers,
  LayoutDashboard,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  objects,
  records,
  onOpenCommandMenu,
  onOpenCreateObject,
  onExportData,
  onResetData,
  isDark,
  onToggleTheme,
}) => {
  const getRecordCount = (objectId: string) => {
    return records.filter((r) => r.objectId === objectId).length;
  };

  const standardObjects = objects.filter((o) => !o.isCustom);
  const customObjects = objects.filter((o) => o.isCustom);

  return (
    <aside className="w-64 flex flex-col h-full border-r border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950 select-none text-slate-800 dark:text-zinc-200 shrink-0">
      {/* Workspace Brand */}
      <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm flex items-center justify-center shadow-xs select-none">
            T
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight leading-none text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              TeraRobots CRM
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                Rust
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-none">
              TeraRobots Workspace
            </div>
          </div>
        </div>
      </div>

      {/* Global Command / Search Trigger */}
      <div className="p-2.5">
        <button
          onClick={onOpenCommandMenu}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 text-xs text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-800 dark:hover:text-zinc-200 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span>Search or command...</span>
          </span>
          <kbd className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-400 dark:text-zinc-500 border border-slate-200/80 dark:border-zinc-700/80">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1">
        {/* Core Dashboards */}
        <div>
          <button
            onClick={() => onSelectView('dashboard')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              currentView === 'dashboard'
                ? 'bg-slate-200/80 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              <span>Dashboard & Funnel</span>
            </span>
          </button>
        </div>

        {/* Workspace Standard Objects */}
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Workspace Objects
          </div>
          <div className="space-y-0.5">
            {standardObjects.map((obj) => {
              const IconComp = ICON_MAP[obj.icon] || Layers;
              const count = getRecordCount(obj.id);
              const isSelected = currentView === obj.id;

              return (
                <button
                  key={obj.id}
                  onClick={() => onSelectView(obj.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'bg-slate-200/80 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <IconComp className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>{obj.labelPlural}</span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Objects (Twenty Signature Feature) */}
        <div>
          <div className="px-2.5 mb-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            <span>Custom Objects</span>
            <button
              onClick={onOpenCreateObject}
              title="Design new custom object"
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {customObjects.length === 0 ? (
              <button
                onClick={onOpenCreateObject}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 border border-dashed border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Entity</span>
              </button>
            ) : (
              customObjects.map((obj) => {
                const isSelected = currentView === obj.id;
                const count = getRecordCount(obj.id);
                return (
                  <button
                    key={obj.id}
                    onClick={() => onSelectView(obj.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'bg-slate-200/80 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-emerald-500" />
                      <span>{obj.labelPlural}</span>
                    </span>
                    <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                      {count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Settings & Schema Studio */}
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Workspace Configuration
          </div>
          <button
            onClick={() => onSelectView('settings')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              currentView === 'settings'
                ? 'bg-slate-200/80 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Schema & Custom Fields</span>
            </span>
          </button>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-md hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
          <button
            onClick={onExportData}
            title="Export CRM Database to JSON"
            className="p-2 rounded-md hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onResetData}
            title="Reset to TeraRobots Demo Seed Data"
            className="p-2 rounded-md hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
          <Database className="w-3.5 h-3.5" />
          <span>Local SQLite</span>
        </div>
      </div>
    </aside>
  );
};
