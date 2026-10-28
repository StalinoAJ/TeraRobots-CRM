import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  FileCode,
  Sliders,
} from 'lucide-react';
import { ObjectMetadata, FieldType } from '../types/crm';
import { crmApi } from '../api/tauriApi';

interface SettingsViewProps {
  objects: ObjectMetadata[];
  onRefreshWorkspace: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  objects,
  onRefreshWorkspace,
  onExportData,
  onResetData,
}) => {
  const [selectedObjectId, setSelectedObjectId] = useState<string>(objects[0]?.id || 'company');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('TEXT');
  const [isAddingField, setIsAddingField] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const currentObj = objects.find((o) => o.id === selectedObjectId);

  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    setIsAddingField(true);
    try {
      const fieldName = newFieldName.trim() || newFieldLabel.toLowerCase().replace(/\s+/g, '_');
      await crmApi.createCustomField(selectedObjectId, {
        name: fieldName,
        label: newFieldLabel,
        fieldType: newFieldType,
        isRequired: false,
        isCustom: true,
      });
      setNewFieldName('');
      setNewFieldLabel('');
      setStatusMsg(`Added custom field "${newFieldLabel}"!`);
      setTimeout(() => setStatusMsg(null), 3000);
      onRefreshWorkspace();
    } catch (err: any) {
      console.error('Failed to add field:', err);
    } finally {
      setIsAddingField(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-zinc-950 select-none space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
          Schema & Custom Objects Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Customize CRM data structures, add custom fields to any object, and manage local database backups
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Object Selector */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-2">
          <h3 className="font-semibold text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1">
            Registered Objects
          </h3>
          <div className="space-y-1">
            {objects.map((obj) => (
              <button
                key={obj.id}
                onClick={() => setSelectedObjectId(obj.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  selectedObjectId === obj.id
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>{obj.labelPlural}</span>
                </div>
                {obj.isCustom && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Custom
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Backup & Restore Box */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2">
            <h4 className="font-semibold text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1">
              Data Management
            </h4>
            <button
              onClick={onExportData}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-xs text-slate-700 dark:text-zinc-300 transition-all duration-150 cursor-pointer active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Database (JSON)</span>
            </button>
            <button
              onClick={onResetData}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-950/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs text-rose-600 dark:text-rose-400 transition-all duration-150 cursor-pointer active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Reset Workspace to Demo</span>
            </button>
          </div>
        </div>

        {/* Right 2 cols: Field Metadata & Schema Inspector */}
        <div className="col-span-2 space-y-6">
          {currentObj && (
            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                    {currentObj.labelSingular} Schema Fields
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentObj.description || 'Standard CRM entity in TeraRobots schema'}
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {currentObj.fields.length} active fields
                </span>
              </div>

              {/* Fields Table */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-3.5 py-2 font-semibold text-slate-500">Field Label</th>
                      <th className="px-3.5 py-2 font-semibold text-slate-500">Identifier</th>
                      <th className="px-3.5 py-2 font-semibold text-slate-500">Type</th>
                      <th className="px-3.5 py-2 font-semibold text-slate-500">Kind</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {currentObj.fields.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                        <td className="px-3.5 py-2 font-medium text-slate-800 dark:text-zinc-200">
                          {f.label}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">
                          {f.name}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                          {f.fieldType}
                        </td>
                        <td className="px-3.5 py-2 text-[11px]">
                          {f.isCustom ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                              Custom
                            </span>
                          ) : (
                            <span className="text-slate-400">Standard</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Custom Field Form */}
              <form onSubmit={handleAddCustomField} className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-semibold text-xs text-slate-700 dark:text-zinc-300">
                  + Add Custom Field to {currentObj.labelSingular}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Field Label (e.g. Contract Tier)"
                    value={newFieldLabel}
                    onChange={(e) => {
                      setNewFieldLabel(e.target.value);
                      if (!newFieldName) {
                        setNewFieldName(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                      }
                    }}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                  />

                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="CURRENCY">Currency (₹)</option>
                    <option value="SELECT">Select</option>
                    <option value="DATE_TIME">Date</option>
                    <option value="LINKS">Link / URL</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isAddingField}
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-zinc-100 transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-xs"
                  >
                    {isAddingField ? 'Adding to Schema...' : 'Add Field to Schema'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
