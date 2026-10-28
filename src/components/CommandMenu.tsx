import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  User,
  Target,
  CheckSquare,
  FileText,
  Plus,
  Download,
  RotateCcw,
  Layers,
  ArrowRight,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { ObjectMetadata, CrmRecord } from '../types/crm';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  objects: ObjectMetadata[];
  records: CrmRecord[];
  onSelectView: (viewId: string) => void;
  onSelectRecord: (record: CrmRecord) => void;
  onOpenCreateRecord: (objectId: string) => void;
  onExportData: () => void;
  onResetData: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  isOpen,
  onClose,
  objects,
  records,
  onSelectView,
  onSelectRecord,
  onOpenCreateRecord,
  onExportData,
  onResetData,
  isDark,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Matched records
  const matchedRecords = q
    ? records
        .filter((r) =>
          Object.values(r.values).some((v) =>
            String(v).toLowerCase().includes(q)
          )
        )
        .slice(0, 6)
    : [];

  // Matched objects / views
  const matchedObjects = objects.filter((o) =>
    o.labelPlural.toLowerCase().includes(q) || o.labelSingular.toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, search records, or navigate..."
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-zinc-700/80">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Records Search */}
          {matchedRecords.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Records
              </div>
              <div className="space-y-0.5">
                {matchedRecords.map((r) => {
                  const title =
                    r.values.name ||
                    `${r.values.firstName || ''} ${r.values.lastName || ''}`.trim() ||
                    r.values.title ||
                    r.id;

                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectRecord(r);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-left text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {r.objectId}
                        </span>
                        <span className="truncate font-medium">{title}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jump to View */}
          <div>
            <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Navigation
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onSelectView('dashboard');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
              >
                <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Go to Dashboard & Funnel</span>
              </button>

              {matchedObjects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => {
                    onSelectView(obj.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Go to {obj.labelPlural}</span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    {records.filter((r) => r.objectId === obj.id).length} records
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onOpenCreateRecord('opportunity');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Create New Opportunity</span>
              </button>
              <button
                onClick={() => {
                  onOpenCreateRecord('person');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Create New Contact</span>
              </button>
              <button
                onClick={() => {
                  onOpenCreateRecord('company');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Create New Company</span>
              </button>
              {onToggleTheme && (
                <button
                  onClick={() => {
                    onToggleTheme();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
                >
                  {isDark ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  )}
                  <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
                </button>
              )}
              <button
                onClick={() => {
                  onExportData();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer active:scale-[0.99] transition-all duration-150"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Export CRM Database (JSON)</span>
              </button>
              <button
                onClick={() => {
                  onResetData();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-rose-600 dark:text-rose-400 cursor-pointer active:scale-[0.99] transition-all duration-150"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Reset to Seed Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 px-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>TeraRobots Command Palette</span>
          <div className="flex items-center gap-2">
            <span>Esc to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
