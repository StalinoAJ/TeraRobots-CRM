import React, { useState } from 'react';
import {
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { ObjectMetadata, CrmRecord, FieldMetadata } from '../types/crm';

interface TableViewProps {
  objectMeta: ObjectMetadata;
  records: CrmRecord[];
  allRecords: CrmRecord[];
  allObjects: ObjectMetadata[];
  onSelectRecord: (record: CrmRecord) => void;
  onUpdateRecord: (id: string, values: Record<string, any>) => Promise<any>;
  onDeleteRecord: (id: string) => Promise<any>;
}

export const TableView: React.FC<TableViewProps> = ({
  objectMeta,
  records,
  allRecords,
  onSelectRecord,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [editingCell, setEditingCell] = useState<{ recordId: string; fieldName: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Helper to resolve relations (e.g. companyId -> "Stripe Technologies")
  const resolveRelation = (targetObjectId: string | undefined, recordId: any) => {
    if (!recordId) return '—';
    const targetRec = allRecords.find((r) => r.id === recordId);
    if (!targetRec) return String(recordId);
    return targetRec.values.name || `${targetRec.values.firstName || ''} ${targetRec.values.lastName || ''}`.trim() || targetRec.id;
  };

  const handleStartEdit = (record: CrmRecord, field: FieldMetadata, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCell({ recordId: record.id, fieldName: field.name });
    const currentVal = record.values[field.name];
    setEditValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const handleCommitEdit = async (record: CrmRecord, field: FieldMetadata) => {
    if (!editingCell) return;
    try {
      let finalVal: any = editValue;
      if (field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY') {
        finalVal = parseFloat(editValue) || 0;
      }
      await onUpdateRecord(record.id, { [field.name]: finalVal });
    } catch (err) {
      console.error('Failed to commit edit:', err);
    } finally {
      setEditingCell(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(fieldName);
      setSortOrder('asc');
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a.values[sortField];
    const valB = b.values[sortField];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    const comparison = valA > valB ? 1 : -1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getPillColor = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60';
      case 'purple':
        return 'bg-purple-50/80 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60';
      case 'emerald':
        return 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
      case 'amber':
      case 'yellow':
        return 'bg-amber-50/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
      case 'orange':
        return 'bg-orange-50/80 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60';
      case 'rose':
        return 'bg-rose-50/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
      default:
        return 'bg-slate-100/80 dark:bg-zinc-800/70 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700/60';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950">
      <table className="w-full text-left border-collapse border-b border-slate-200 dark:border-zinc-800 text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-xs select-none">
            <th className="w-10 px-3 py-2.5 font-medium text-slate-400 dark:text-zinc-500 border-r border-slate-200/60 dark:border-zinc-800/60">
              #
            </th>
            {objectMeta.fields.map((field) => (
              <th
                key={field.id}
                onClick={() => handleSort(field.name)}
                className="px-3.5 py-2.5 min-w-[130px] font-semibold text-slate-600 dark:text-zinc-400 border-r border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <span>{field.label}</span>
                    {field.isCustom && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Custom Field" />
                    )}
                  </span>
                  <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-zinc-600 opacity-60 hover:opacity-100" />
                </div>
              </th>
            ))}
            <th className="w-12 px-2 py-2.5 text-center font-medium text-slate-400 dark:text-zinc-500">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
          {sortedRecords.length === 0 ? (
            <tr>
              <td
                colSpan={objectMeta.fields.length + 2}
                className="py-12 text-center text-slate-400 dark:text-zinc-600"
              >
                No records found. Click "+ New {objectMeta.labelSingular}" to add one.
              </td>
            </tr>
          ) : (
            sortedRecords.map((record, index) => (
              <tr
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors group cursor-pointer"
              >
                {/* Index */}
                <td className="px-3 py-2 text-slate-400 dark:text-zinc-600 font-mono tabular-nums text-[11px] border-r border-slate-100 dark:border-zinc-900">
                  {index + 1}
                </td>

                {/* Field Cells */}
                {objectMeta.fields.map((field) => {
                  const val = record.values[field.name];
                  const isEditing =
                    editingCell?.recordId === record.id &&
                    editingCell?.fieldName === field.name;

                  return (
                    <td
                      key={field.id}
                      onDoubleClick={(e) => handleStartEdit(record, field, e)}
                      className="px-3.5 py-2 min-w-[130px] border-r border-slate-100 dark:border-zinc-900 text-slate-800 dark:text-zinc-200 relative max-w-xs truncate font-normal"
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 -m-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {field.fieldType === 'SELECT' && field.options ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 text-xs rounded border border-blue-500 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {field.options.map((opt) => (
                                <option key={opt.id} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY' ? 'number' : 'text'}
                              value={editValue}
                              autoFocus
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommitEdit(record, field);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              className="w-full px-2 py-1 text-xs rounded border border-blue-500 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
                            />
                          )}
                          <button
                            onClick={() => handleCommitEdit(record, field)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 active:scale-95 transition-all cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group/cell">
                          <span className="truncate">
                            {field.fieldType === 'CURRENCY' && val !== undefined && val !== null ? (
                              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                                ₹{Number(val).toLocaleString('en-IN')}
                              </span>
                            ) : field.fieldType === 'NUMBER' && val !== undefined && val !== null ? (
                              <span className="font-mono tabular-nums text-slate-800 dark:text-zinc-200">
                                {Number(val).toLocaleString('en-IN')}
                              </span>
                            ) : field.fieldType === 'SELECT' && val ? (
                              (() => {
                                const opt = field.options?.find((o) => o.value === val);
                                return (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPillColor(
                                      opt?.color
                                    )}`}
                                  >
                                    {opt?.label || String(val)}
                                  </span>
                                );
                              })()
                            ) : field.fieldType === 'RELATION' ? (
                              <span className="text-blue-600 dark:text-blue-400 hover:underline">
                                {resolveRelation(field.targetObject, val)}
                              </span>
                            ) : field.fieldType === 'LINKS' && val ? (
                              <a
                                href={String(val)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <span>{String(val).replace(/^https?:\/\//, '')}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ) : val !== undefined && val !== null && String(val) !== '' ? (
                              String(val)
                            ) : (
                              <span className="text-slate-300 dark:text-zinc-700">—</span>
                            )}
                          </span>

                          <button
                            onClick={(e) => handleStartEdit(record, field, e)}
                            className="opacity-0 group-hover/cell:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-opacity ml-1 cursor-pointer active:scale-95"
                            title="Edit cell"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Delete / Row actions */}
                <td
                  className="px-2 py-2 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      if (confirm(`Delete record ${record.id}?`)) {
                        onDeleteRecord(record.id);
                      }
                    }}
                    title="Delete record"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
