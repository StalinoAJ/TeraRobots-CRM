import React, { useState } from 'react';
import {
  MoreHorizontal,
  Plus,
  DollarSign,
  Calendar,
  Building,
  User,
  CheckCircle2,
} from 'lucide-react';
import { ObjectMetadata, CrmRecord } from '../types/crm';

interface KanbanViewProps {
  objectMeta: ObjectMetadata;
  records: CrmRecord[];
  allRecords: CrmRecord[];
  onSelectRecord: (record: CrmRecord) => void;
  onUpdateOpportunityStage: (id: string, newStage: string) => Promise<any>;
  onUpdateTaskStatus: (id: string, newStatus: string) => Promise<any>;
  onOpenCreateWithStage?: (stage: string) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  objectMeta,
  records,
  allRecords,
  onSelectRecord,
  onUpdateOpportunityStage,
  onUpdateTaskStatus,
  onOpenCreateWithStage,
}) => {
  const isOpportunity = objectMeta.id === 'opportunity';
  const isTask = objectMeta.id === 'task';

  // Find the grouping field
  const groupingField = isOpportunity
    ? objectMeta.fields.find((f) => f.name === 'stage')
    : isTask
    ? objectMeta.fields.find((f) => f.name === 'status')
    : objectMeta.fields.find((f) => f.fieldType === 'SELECT');

  const columns = groupingField?.options || [
    { id: 'NEW', label: 'New', value: 'NEW', color: 'blue' },
    { id: 'IN_PROGRESS', label: 'In Progress', value: 'IN_PROGRESS', color: 'yellow' },
    { id: 'DONE', label: 'Done', value: 'DONE', color: 'emerald' },
  ];

  const [draggedRecordId, setDraggedRecordId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const resolveCompanyName = (companyId: any) => {
    if (!companyId) return null;
    const comp = allRecords.find((r) => r.id === companyId);
    return comp ? comp.values.name : null;
  };

  const resolvePersonName = (personId: any) => {
    if (!personId) return null;
    const pers = allRecords.find((r) => r.id === personId);
    return pers ? `${pers.values.firstName || ''} ${pers.values.lastName || ''}`.trim() : null;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedRecordId(id);
  };

  const handleDragOver = (e: React.DragEvent, colValue: string) => {
    e.preventDefault();
    setDragOverColumn(colValue);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, colValue: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const recordId = e.dataTransfer.getData('text/plain') || draggedRecordId;
    if (!recordId) return;

    try {
      if (isOpportunity) {
        await onUpdateOpportunityStage(recordId, colValue);
      } else if (isTask) {
        await onUpdateTaskStatus(recordId, colValue);
      }
    } catch (err) {
      console.error('Failed to update stage on drop:', err);
    } finally {
      setDraggedRecordId(null);
    }
  };

  const getStageHeaderColor = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40';
      case 'purple':
        return 'border-purple-500 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40';
      case 'yellow':
        return 'border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40';
      case 'orange':
        return 'border-orange-500 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40';
      case 'emerald':
        return 'border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40';
      case 'rose':
        return 'border-rose-500 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40';
      default:
        return 'border-slate-400 text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800';
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-5 bg-slate-50/50 dark:bg-zinc-950 select-none h-full">
      <div className="flex gap-4 h-full min-w-max items-stretch pb-1">
        {columns.map((column) => {
          const colRecords = records.filter((r) => {
            const val = isOpportunity ? r.values.stage : isTask ? r.values.status : r.values[groupingField?.name || 'stage'];
            return val === column.value;
          });

          const totalValue = colRecords.reduce((acc, curr) => {
            return acc + (Number(curr.values.amount) || 0);
          }, 0);

          const isOver = dragOverColumn === column.value;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.value)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.value)}
              className={`w-72 flex flex-col h-full rounded-xl border transition-all shrink-0 ${
                isOver
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200/90 dark:border-zinc-800 bg-slate-100/60 dark:bg-zinc-900/40'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStageHeaderColor(
                      column.color
                    )}`}
                  >
                    {column.label}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                    {colRecords.length}
                  </span>
                </div>

                {isOpportunity && totalValue > 0 && (
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{totalValue.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5">
                {colRecords.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-600 border border-dashed border-slate-200/80 dark:border-zinc-800 rounded-lg">
                    Drag deals here
                  </div>
                ) : (
                  colRecords.map((rec) => {
                    const compName = resolveCompanyName(rec.values.companyId);
                    const persName = resolvePersonName(rec.values.pointOfContactId);
                    const amount = Number(rec.values.amount) || 0;
                    const prob = Number(rec.values.probability) || 0;

                    return (
                      <div
                        key={rec.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, rec.id)}
                        onClick={() => onSelectRecord(rec)}
                        className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-grab active:cursor-grabbing group select-none shadow-2xs active:scale-[0.99]"
                      >
                        {/* Title */}
                        <div className="font-medium text-xs text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {rec.values.name || rec.values.title || 'Untitled'}
                        </div>

                        {/* Amount or Status details */}
                        {isOpportunity && (
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-zinc-100">
                              ₹{amount.toLocaleString('en-IN')}
                            </span>
                            {prob > 0 && (
                              <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                {prob}% prob
                              </span>
                            )}
                          </div>
                        )}

                        {/* Company / Contact pills */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                          {compName && (
                            <span className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-zinc-200">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[120px]">{compName}</span>
                            </span>
                          )}

                          {persName && (
                            <span className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-zinc-200">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[100px]">{persName}</span>
                            </span>
                          )}

                          {rec.values.closeDate && (
                            <span className="flex items-center gap-1 text-[10px] font-mono tabular-nums text-slate-400 ml-auto">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{String(rec.values.closeDate)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Fast Add Button */}
              {onOpenCreateWithStage && (
                <div className="p-2 border-t border-slate-200/80 dark:border-zinc-800/80">
                  <button
                    onClick={() => onOpenCreateWithStage(column.value)}
                    className="w-full py-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-900 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center justify-center gap-1 transition-all duration-150 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add {objectMeta.labelSingular}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
