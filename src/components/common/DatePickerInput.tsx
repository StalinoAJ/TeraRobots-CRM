import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Clock, ChevronDown } from 'lucide-react';
import { formatHumanDate } from '../../utils/formatters';

interface DatePickerInputProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  withTime?: boolean;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date...',
  withTime = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateValue = (d: Date): string => {
    if (withTime) {
      return d.toISOString().slice(0, 16);
    }
    return d.toISOString().split('T')[0];
  };

  const applyPreset = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    onChange(formatDateValue(d));
    setIsOpen(false);
  };

  const applyEndOfMonth = () => {
    const d = new Date();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    onChange(formatDateValue(end));
    setIsOpen(false);
  };

  const formattedDisplay = value ? formatHumanDate(value) : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Field */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-all duration-150 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 select-none shadow-2xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
          {value ? (
            <span className="font-medium truncate text-slate-800 dark:text-zinc-200 tabular-nums">
              {formattedDisplay}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-zinc-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer active:scale-95 transition-all"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 p-3 z-50 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Quick Presets */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Quick Presets</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => applyPreset(0)}
                className="px-2 py-1.5 text-left rounded-md bg-slate-100/80 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1)}
                className="px-2 py-1.5 text-left rounded-md bg-slate-100/80 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7)}
                className="px-2 py-1.5 text-left rounded-md bg-slate-100/80 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                +1 Week
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30)}
                className="px-2 py-1.5 text-left rounded-md bg-slate-100/80 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                +30 Days
              </button>
              <button
                type="button"
                onClick={applyEndOfMonth}
                className="col-span-2 px-2 py-1.5 text-left rounded-md bg-slate-100/80 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                End of This Month
              </button>
            </div>
          </div>

          {/* Direct Input */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-900">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
              Specific Date {withTime ? '& Time' : ''}
            </div>
            <input
              type={withTime ? 'datetime-local' : 'date'}
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 tabular-nums cursor-pointer"
            />
          </div>

          {/* Done action */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-md bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-100 cursor-pointer active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
