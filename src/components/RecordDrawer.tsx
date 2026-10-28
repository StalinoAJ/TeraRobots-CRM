import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckSquare,
  FileText,
  Code,
  Sliders,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  Circle,
  Building,
  User,
  ArrowRight,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  ObjectMetadata,
  CrmRecord,
  TimelineActivity,
  FieldMetadata,
} from '../types/crm';
import { crmApi } from '../api/tauriApi';
import { DatePickerInput } from './common/DatePickerInput';
import { RelatedRecordSelect } from './common/RelatedRecordSelect';
import { CurrencyInput, RatingInput, BooleanSwitch, UrlInput } from './common/FormInputs';
import { formatExternalUrl, openExternalUrl, getRecordDisplayName } from '../utils/formatters';

interface RecordDrawerProps {
  record: CrmRecord | null;
  objectMeta: ObjectMetadata;
  allObjects: ObjectMetadata[];
  allRecords: CrmRecord[];
  onClose: () => void;
  onUpdateRecord: (id: string, values: Record<string, any>) => Promise<any>;
}

export const RecordDrawer: React.FC<RecordDrawerProps> = ({
  record,
  objectMeta,
  allObjects,
  allRecords,
  onClose,
  onUpdateRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tasks' | 'notes' | 'json'>('overview');
  const [timeline, setTimeline] = useState<TimelineActivity[]>([]);
  const [associatedTasks, setAssociatedTasks] = useState<CrmRecord[]>([]);
  const [associatedNotes, setAssociatedNotes] = useState<CrmRecord[]>([]);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!record) return;
    setFormValues(record.values || {});
    setSaveSuccess(false);

    // Fetch related record timeline and relations
    crmApi.getRecord(record.id).then((res) => {
      setTimeline(res.timeline);
      setAssociatedTasks(res.tasks);
      setAssociatedNotes(res.notes);
    });
  }, [record]);

  if (!record) return null;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    setSaveSuccess(false);
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

  const handleSaveOverview = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateRecord(record.id, formValues);
      const res = await crmApi.getRecord(record.id);
      setTimeline(res.timeline);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save record:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteBody.trim()) return;
    try {
      await crmApi.createRecord('note', {
        title: `Note on ${record.values.name || record.values.title || record.id}`,
        body: newNoteBody,
        targetRecordId: record.id,
        targetObjectId: record.objectId,
      });
      setNewNoteBody('');
      const res = await crmApi.getRecord(record.id);
      setAssociatedNotes(res.notes);
      setTimeline(res.timeline);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await crmApi.createRecord('task', {
        title: newTaskTitle,
        status: 'TODO',
        priority: 'MEDIUM',
        targetRecordId: record.id,
        targetObjectId: record.objectId,
      });
      setNewTaskTitle('');
      const res = await crmApi.getRecord(record.id);
      setAssociatedTasks(res.tasks);
      setTimeline(res.timeline);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleToggleTaskStatus = async (task: CrmRecord) => {
    const newStatus = task.values.status === 'DONE' ? 'TODO' : 'DONE';
    await crmApi.updateTaskStatus(task.id, newStatus);
    const res = await crmApi.getRecord(record.id);
    setAssociatedTasks(res.tasks);
    setTimeline(res.timeline);
  };

  const title = getRecordDisplayName(record);
  const websiteUrl = record.values.domain || record.values.website || record.values.linkedinUrl;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-30 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-[560px] bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-2xl z-40 flex flex-col select-none animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                {objectMeta.labelSingular}
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-zinc-600">
                {record.id}
              </span>
              {websiteUrl && (
                <button
                  type="button"
                  onClick={(e) => openExternalUrl(websiteUrl, e)}
                  title={`Open ${websiteUrl}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Visit Link</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate mt-0.5">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-200 dark:border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'overview'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'timeline'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
            {timeline.length > 0 && (
              <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800">
                {timeline.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'tasks'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
            {associatedTasks.length > 0 && (
              <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800">
                {associatedTasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'notes'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
            {associatedNotes.length > 0 && (
              <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800">
                {associatedNotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'json'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {objectMeta.fields.map((field) => {
                const val = formValues[field.name];

                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>{field.label}</span>
                        {field.isRequired && <span className="text-rose-500">*</span>}
                      </span>
                      {field.isCustom && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">Custom</span>
                      )}
                    </label>

                    {/* 1. RELATION ASSISTANCE */}
                    {isRelationField(field) ? (
                      <RelatedRecordSelect
                        value={val}
                        onChange={(relId) => handleFieldChange(field.name, relId)}
                        allRecords={allRecords}
                        allObjects={allObjects}
                        targetObject={field.targetObject}
                        placeholder={`Link to ${field.targetObject || 'record'}...`}
                      />
                    ) : /* 2. DATE TIME PICKER */
                    isDateField(field) ? (
                      <DatePickerInput
                        value={val}
                        onChange={(newDate) => handleFieldChange(field.name, newDate)}
                        withTime={field.fieldType === 'DATE_TIME'}
                        placeholder={`Pick ${field.label.toLowerCase()}...`}
                      />
                    ) : /* 3. CURRENCY (INR) */
                    field.fieldType === 'CURRENCY' ? (
                      <CurrencyInput
                        value={val}
                        onChange={(num) => handleFieldChange(field.name, num)}
                      />
                    ) : /* 4. RATING */
                    field.fieldType === 'RATING' ? (
                      <RatingInput
                        value={val}
                        onChange={(rating) => handleFieldChange(field.name, rating)}
                      />
                    ) : /* 5. BOOLEAN */
                    field.fieldType === 'BOOLEAN' ? (
                      <BooleanSwitch
                        value={val}
                        onChange={(b) => handleFieldChange(field.name, b)}
                      />
                    ) : /* 6. URL / LINKS WITH VISIT BUTTON */
                    isUrlField(field) ? (
                      <UrlInput
                        value={val}
                        onChange={(url) => handleFieldChange(field.name, url)}
                      />
                    ) : /* 7. SELECT */
                    field.fieldType === 'SELECT' && field.options ? (
                      <select
                        value={val || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 cursor-pointer shadow-2xs"
                      >
                        <option value="">Select an option...</option>
                        {field.options.map((opt) => (
                          <option key={opt.id} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : /* 8. DEFAULT NUMBER / TEXT */ (
                      <input
                        type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                        value={val !== undefined && val !== null ? val : ''}
                        onChange={(e) => {
                          const v = field.fieldType === 'NUMBER' ? parseFloat(e.target.value) || 0 : e.target.value;
                          handleFieldChange(field.name, v);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 tabular-nums shadow-2xs"
                      />
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveOverview}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isSaving ? (
                    'Saving Changes...'
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Changes Saved!</span>
                    </>
                  ) : (
                    'Save Record Details'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {timeline.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 dark:text-zinc-600">
                  No activity recorded yet for this item.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 dark:border-zinc-800 ml-3 space-y-6">
                  {timeline.map((act) => (
                    <div key={act.id} className="relative pl-6">
                      <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 bg-blue-600" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {act.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {act.description}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          {new Date(act.createdAt).toLocaleString()} · {act.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Quick Add Task */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add follow-up task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-zinc-100 transition-all duration-150 cursor-pointer active:scale-95 shadow-xs"
                >
                  Add Task
                </button>
              </form>

              {/* Tasks List */}
              <div className="space-y-2">
                {associatedTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-600 border border-dashed border-slate-200/80 dark:border-zinc-800 rounded-lg">
                    No tasks assigned to this record.
                  </div>
                ) : (
                  associatedTasks.map((t) => {
                    const isDone = t.values.status === 'DONE';
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTaskStatus(t)}
                        className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-100/60 dark:hover:bg-zinc-900 transition-all duration-150 flex items-center justify-between cursor-pointer active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span
                            className={`text-xs ${
                              isDone ? 'line-through text-slate-400 dark:text-zinc-600' : 'text-slate-800 dark:text-zinc-200 font-medium'
                            }`}
                          >
                            {t.values.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {t.values.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Quick Add Note */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Write a meeting note or call summary..."
                  value={newNoteBody}
                  onChange={(e) => setNewNoteBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 leading-relaxed"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-zinc-100 transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-xs"
                >
                  Save Meeting Note
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                {associatedNotes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-600 border border-dashed border-slate-200/80 dark:border-zinc-800 rounded-lg">
                    No notes recorded yet.
                  </div>
                ) : (
                  associatedNotes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-xs shadow-2xs space-y-1.5"
                    >
                      <div className="font-semibold text-slate-900 dark:text-zinc-100">
                        {n.values.title}
                      </div>
                      <div className="text-slate-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                        {n.values.body}
                      </div>
                      <div className="text-[10px] font-mono tabular-nums text-slate-400 pt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* RAW JSON TAB */}
          {activeTab === 'json' && (
            <div>
              <pre className="p-3 rounded-md bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto leading-relaxed">
                {JSON.stringify(record, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
