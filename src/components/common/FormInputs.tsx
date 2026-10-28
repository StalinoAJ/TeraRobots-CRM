import React, { useState } from 'react';
import { Star, ExternalLink, Globe, Check } from 'lucide-react';
import { formatExternalUrl, openExternalUrl, formatIndianDenomination } from '../../utils/formatters';

// ======================== CURRENCY INPUT ========================
interface CurrencyInputProps {
  value: number | string | undefined | null;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value || 0)) || 0;
  const denomination = formatIndianDenomination(numericValue);

  return (
    <div className="space-y-1 w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 dark:text-zinc-500 font-semibold text-xs select-none">
          ₹
        </span>
        <input
          type="number"
          disabled={disabled}
          value={value !== undefined && value !== null ? value : ''}
          placeholder={placeholder}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tabular-nums font-mono shadow-2xs"
        />
      </div>
      {numericValue > 0 && (
        <div className="flex items-center justify-between px-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium select-none">
          <span>₹ {numericValue.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
            {denomination}
          </span>
        </div>
      )}
    </div>
  );
};

// ======================== RATING INPUT ========================
interface RatingInputProps {
  value: number | undefined | null;
  onChange: (rating: number) => void;
  max?: number;
  disabled?: boolean;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  value = 0,
  onChange,
  max = 5,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const currentRating = hoverRating !== null ? hoverRating : (value || 0);

  return (
    <div className="flex items-center gap-1.5 py-1">
      {Array.from({ length: max }).map((_, index) => {
        const starNum = index + 1;
        const isFilled = starNum <= currentRating;

        return (
          <button
            key={starNum}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starNum === value ? 0 : starNum)}
            onMouseEnter={() => !disabled && setHoverRating(starNum)}
            onMouseLeave={() => !disabled && setHoverRating(null)}
            className="p-1 rounded-md text-amber-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer disabled:cursor-not-allowed"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-zinc-700'
              }`}
            />
          </button>
        );
      })}
      <span className="ml-2 text-xs font-mono text-slate-400 dark:text-zinc-500">
        {value || 0}/{max}
      </span>
    </div>
  );
};

// ======================== BOOLEAN SWITCH ========================
interface BooleanSwitchProps {
  value: boolean | undefined | null;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const BooleanSwitch: React.FC<BooleanSwitchProps> = ({
  value = false,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-3 py-1">
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95 ${
          value ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-zinc-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium select-none">
        {value ? 'Active / Yes' : 'Inactive / No'}
      </span>
    </div>
  );
};

// ======================== URL / WEBSITE INPUT ========================
interface UrlInputProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  placeholder = 'e.g. terarobots.com or https://...',
  disabled = false,
}) => {
  const formatted = formatExternalUrl(value || '');

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 flex items-center">
        <Globe className="w-3.5 h-3.5 absolute left-3 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          disabled={disabled}
          value={value !== undefined && value !== null ? value : ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs font-mono"
        />
      </div>

      {formatted ? (
        <button
          type="button"
          onClick={(e) => openExternalUrl(formatted, e)}
          title={`Visit ${formatted}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <span>Open</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span className="p-2 text-slate-300 dark:text-zinc-700">
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
};
