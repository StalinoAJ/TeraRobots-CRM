import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { ObjectMetadata, CrmRecord } from '../types/crm';

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectMeta: ObjectMetadata;
  allRecords: CrmRecord[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<any>;
}

export const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  isOpen,
  onClose,
  objectMeta,
  allRecords,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-[500px] max-h-[85vh] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
              +
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
              New {objectMeta.labelSingular}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {objectMeta.fields.map((field) => {
            const val = formData[field.name];

            return (
              <div key={field.id} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>
                    {field.label}{' '}
                    {field.isRequired && <span className="text-rose-500">*</span>}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {field.fieldType}
                  </span>
                </label>

                {field.fieldType === 'SELECT' && field.options ? (
                  <select
                    value={val || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                  >
                    <option value="">Select option...</option>
                    {field.options.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.fieldType === 'RELATION' ? (
                  <select
                    value={val || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                  >
                    <option value="">Select {field.targetObject}...</option>
                    {allRecords
                      .filter((r) => r.objectId === field.targetObject)
                      .map((relRec) => (
                        <option key={relRec.id} value={relRec.id}>
                          {relRec.values.name || `${relRec.values.firstName || ''} ${relRec.values.lastName || ''}`.trim() || relRec.id}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type={field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY' ? 'number' : 'text'}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    value={val !== undefined && val !== null ? val : ''}
                    onChange={(e) => {
                      const v = field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY' ? parseFloat(e.target.value) || 0 : e.target.value;
                      handleChange(field.name, v);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 tabular-nums"
                  />
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer active:scale-95 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-zinc-100 transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-xs"
            >
              {isSubmitting ? 'Creating in Database...' : `Create ${objectMeta.labelSingular}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
