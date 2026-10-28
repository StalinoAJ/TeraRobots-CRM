import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, AlertCircle } from 'lucide-react';
import { ObjectMetadata, FieldMetadata, FieldType } from '../types/crm';

interface CustomObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCustomObject: (meta: Partial<ObjectMetadata>) => Promise<any>;
}

export const CustomObjectModal: React.FC<CustomObjectModalProps> = ({
  isOpen,
  onClose,
  onCreateCustomObject,
}) => {
  const [singular, setSingular] = useState('');
  const [plural, setPlural] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Partial<FieldMetadata>[]>([
    { name: 'name', label: 'Name', fieldType: 'TEXT', isRequired: true },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        name: `field_${prev.length + 1}`,
        label: `Field ${prev.length + 1}`,
        fieldType: 'TEXT',
        isRequired: false,
      },
    ]);
  };

  const handleUpdateField = (index: number, patch: Partial<FieldMetadata>) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const handleRemoveField = (index: number) => {
    if (fields.length <= 1) return;
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singular.trim()) {
      setError('Singular name is required');
      return;
    }
    const finalPlural = plural.trim() || `${singular}s`;
    const objectId = `custom_${singular.toLowerCase().replace(/\s+/g, '_')}`;

    setIsSubmitting(true);
    setError(null);
    try {
      const formattedFields: FieldMetadata[] = fields.map((f, i) => ({
        id: `f_${(f.name || `field_${i}`).toLowerCase().replace(/\s+/g, '_')}`,
        name: (f.name || `field_${i}`).toLowerCase().replace(/\s+/g, '_'),
        label: f.label || `Field ${i + 1}`,
        fieldType: (f.fieldType as FieldType) || 'TEXT',
        isRequired: Boolean(f.isRequired),
        isCustom: true,
      }));

      await onCreateCustomObject({
        id: objectId,
        nameSingular: singular.toLowerCase(),
        namePlural: finalPlural.toLowerCase(),
        labelSingular: singular,
        labelPlural: finalPlural,
        description,
        icon: 'Layers',
        isCustom: true,
        fields: formattedFields,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create custom object');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-[560px] max-h-[85vh] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                Create Custom CRM Object
              </h3>
              <p className="text-[11px] text-slate-500">
                TeraRobots Dynamic Metadata Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Singular Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Project, Subscription, Ticket"
                value={singular}
                onChange={(e) => setSingular(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Plural Label
              </label>
              <input
                type="text"
                placeholder="e.g. Projects, Subscriptions"
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Description
            </label>
            <input
              type="text"
              placeholder="Brief description of this entity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
            />
          </div>

          {/* Fields Designer */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Object Fields Schema
              </span>
              <button
                type="button"
                onClick={handleAddField}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Field Definition</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {fields.map((f, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Field Label"
                    value={f.label || ''}
                    onChange={(e) =>
                      handleUpdateField(idx, {
                        label: e.target.value,
                        name: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                      })
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <select
                    value={f.fieldType || 'TEXT'}
                    onChange={(e) =>
                      handleUpdateField(idx, { fieldType: e.target.value as FieldType })
                    }
                    className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="CURRENCY">Currency (₹)</option>
                    <option value="SELECT">Select</option>
                    <option value="DATE_TIME">Date</option>
                    <option value="LINKS">Link / URL</option>
                  </select>

                  <label className="flex items-center gap-1 text-[11px] text-slate-500 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={f.isRequired || false}
                      onChange={(e) => handleUpdateField(idx, { isRequired: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Req</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    disabled={fields.length <= 1}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-xs"
            >
              {isSubmitting ? 'Configuring Schema...' : 'Deploy Custom Object'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
