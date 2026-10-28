import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { ObjectMetadata, CrmRecord, FieldMetadata } from '../types/crm';
import { DatePickerInput } from './common/DatePickerInput';
import { RelatedRecordSelect } from './common/RelatedRecordSelect';
import { CurrencyInput, RatingInput, BooleanSwitch, UrlInput } from './common/FormInputs';

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectMeta: ObjectMetadata;
  allRecords: CrmRecord[];
  allObjects?: ObjectMetadata[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<any>;
}

export const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  isOpen,
  onClose,
  objectMeta,
  allRecords,
  allObjects = [],
  initialValues = {},
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues || {});
      setError(null);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const isRelationField = (field: FieldMetadata): boolean => {
    return (
      field.fieldType === 'RELATION' ||
      field.name === 'companyId' ||
      field.name === 'pointOfContactId' ||
      field.name === 'targetRecordId' ||
      field.name.endsWith('Id')
    );
  };

  const isUrlField = (field: FieldMetadata): boolean => {
    return (
      field.fieldType === 'LINKS' ||
      field.name.toLowerCase().includes('url') ||
      field.name.toLowerCase().includes('website') ||
      field.name === 'domain'
    );
  };

  const isDateField = (field: FieldMetadata): boolean => {
    return (
      field.fieldType === 'DATE_TIME' ||
      field.name.toLowerCase().endsWith('date') ||
      field.name.toLowerCase().endsWith('at')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    for (const field of objectMeta.fields) {
      if (field.isRequired && (!formData[field.name] || String(formData[field.name]).trim() === '')) {
        setError(`"${field.label}" is required.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-[540px] max-h-[88vh] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                New {objectMeta.labelSingular}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                Fill details to record into workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {objectMeta.fields.map((field) => {
            const val = formData[field.name];

            return (
              <div key={field.id} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>{field.label}</span>
                    {field.isRequired && <span className="text-rose-500">*</span>}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {field.fieldType}
                  </span>
                </label>

                {/* 1. RELATION / RELATED RECORD ASSISTANCE */}
                {isRelationField(field) ? (
                  <RelatedRecordSelect
                    value={val}
                    onChange={(relId) => handleChange(field.name, relId)}
                    allRecords={allRecords}
                    allObjects={allObjects.length > 0 ? allObjects : [objectMeta]}
                    targetObject={field.targetObject}
                    placeholder={`Link to ${field.targetObject || 'record'}...`}
                  />
                ) : /* 2. DATE / TIME PICKER */
                isDateField(field) ? (
                  <DatePickerInput
                    value={val}
                    onChange={(newDate) => handleChange(field.name, newDate)}
                    withTime={field.fieldType === 'DATE_TIME'}
                    placeholder={`Choose ${field.label.toLowerCase()}...`}
                  />
                ) : /* 3. CURRENCY (INR) */
                field.fieldType === 'CURRENCY' ? (
                  <CurrencyInput
                    value={val}
                    onChange={(num) => handleChange(field.name, num)}
                    placeholder="Enter amount in INR (₹)..."
                  />
                ) : /* 4. RATING */
                field.fieldType === 'RATING' ? (
                  <RatingInput
                    value={val}
                    onChange={(rating) => handleChange(field.name, rating)}
                  />
                ) : /* 5. BOOLEAN */
                field.fieldType === 'BOOLEAN' ? (
                  <BooleanSwitch
                    value={val}
                    onChange={(b) => handleChange(field.name, b)}
                  />
                ) : /* 6. URL / LINKS WITH VISIT BUTTON */
                isUrlField(field) ? (
                  <UrlInput
                    value={val}
                    onChange={(url) => handleChange(field.name, url)}
                    placeholder="e.g. terarobots.com or https://..."
                  />
                ) : /* 7. SELECT */
                field.fieldType === 'SELECT' && field.options ? (
                  <select
                    value={val || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 shadow-2xs cursor-pointer"
                  >
                    <option value="">Select option...</option>
                    {field.options.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : /* 8. DEFAULT NUMBER / TEXT */ (
                  <input
                    type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    value={val !== undefined && val !== null ? val : ''}
                    onChange={(e) => {
                      const v = field.fieldType === 'NUMBER' ? parseFloat(e.target.value) || 0 : e.target.value;
                      handleChange(field.name, v);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 tabular-nums shadow-2xs"
                  />
                )}
              </div>
            );
          })}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving to Database...' : `Create ${objectMeta.labelSingular}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
