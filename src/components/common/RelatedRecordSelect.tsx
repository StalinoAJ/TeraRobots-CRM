import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  Building2,
  User,
  Target,
  CheckSquare,
  FileText,
  Layers,
  Check,
  ExternalLink,
} from 'lucide-react';
import { CrmRecord, ObjectMetadata } from '../../types/crm';
import { getRecordDisplayName, getRecordSubtext } from '../../utils/formatters';

interface RelatedRecordSelectProps {
  value: string | undefined | null;
  onChange: (recordId: string) => void;
  allRecords: CrmRecord[];
  allObjects: ObjectMetadata[];
  targetObject?: string; // e.g. "company", "person", "opportunity"
  placeholder?: string;
  disabled?: boolean;
}

export const RelatedRecordSelect: React.FC<RelatedRecordSelectProps> = ({
  value,
  onChange,
  allRecords,
  allObjects,
  targetObject,
  placeholder = 'Select related record...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(targetObject || 'ALL');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When opening, auto-focus search
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Selected record
  const selectedRecord = useMemo(() => {
    if (!value) return null;
    return allRecords.find((r) => r.id === value) || null;
  }, [value, allRecords]);

  // Available object types to filter
  const availableObjects = useMemo(() => {
    if (targetObject) {
      return allObjects.filter((o) => o.id === targetObject);
    }
    return allObjects;
  }, [targetObject, allObjects]);

  // Filtered candidate records
  const candidateRecords = useMemo(() => {
    let list = allRecords;

    if (targetObject) {
      list = list.filter((r) => r.objectId === targetObject);
    } else if (activeFilter !== 'ALL') {
      list = list.filter((r) => r.objectId === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const name = getRecordDisplayName(r).toLowerCase();
        const sub = getRecordSubtext(r, allRecords).toLowerCase();
        const id = r.id.toLowerCase();
        return name.includes(q) || sub.includes(q) || id.includes(q);
      });
    }

    return list.slice(0, 50); // limit to 50 for max responsiveness
  }, [allRecords, targetObject, activeFilter, searchQuery]);

  const getObjectIcon = (objectId: string) => {
    switch (objectId) {
      case 'company':
        return <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'person':
        return <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'opportunity':
        return <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'task':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Selected State View */}
      {selectedRecord ? (
        <div className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 transition-all duration-150 group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center shrink-0 shadow-2xs">
              {getObjectIcon(selectedRecord.objectId)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                  {getRecordDisplayName(selectedRecord)}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 shrink-0">
                  {selectedRecord.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                {getRecordSubtext(selectedRecord, allRecords)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {!disabled && (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-2 py-1 text-[11px] font-medium rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer active:scale-95 transition-all"
              >
                Change
              </button>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer active:scale-95 transition-all"
                title="Remove link"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Trigger View */
        <div
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-150 select-none shadow-2xs ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500">
            <Search className="w-3.5 h-3.5" />
            <span>{placeholder}</span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      )}

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 p-2 z-50 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${targetObject ? targetObject + 's' : 'records'} by name or ID...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Type Filters (if multi-object) */}
          {!targetObject && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {availableObjects.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => setActiveFilter(obj.id)}
                  className={`px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === obj.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {obj.labelPlural}
                </button>
              ))}
            </div>
          )}

          {/* Results List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {candidateRecords.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-600">
                No matching records found
              </div>
            ) : (
              candidateRecords.map((rec) => {
                const isSelected = rec.id === value;
                const recName = getRecordDisplayName(rec);
                const recSub = getRecordSubtext(rec, allRecords);

                return (
                  <div
                    key={rec.id}
                    onClick={() => {
                      onChange(rec.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-slate-100/80 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        {getObjectIcon(rec.objectId)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-xs truncate">{recName}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {rec.id}
                          </span>
                        </div>
                        {recSub && (
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {recSub}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
