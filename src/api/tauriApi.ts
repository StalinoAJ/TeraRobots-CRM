import {
  WorkspaceState,
  CrmRecord,
  ObjectMetadata,
  FieldMetadata,
  CrmView,
  AnalyticsSummary,
  TimelineActivity,
} from '../types/crm';
import {
  STANDARD_OBJECTS,
  INITIAL_RECORDS,
  INITIAL_TIMELINE,
  INITIAL_VIEWS,
} from '../mock/seedData';

// Safe Tauri invoke check
const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

let tauriInvoke: any = null;
if (typeof window !== 'undefined') {
  import('@tauri-apps/api/core')
    .then((mod) => {
      tauriInvoke = mod.invoke;
    })
    .catch(() => {
      // Running in browser mode
    });
}

// LocalStorage persistence fallback for browser preview
const STORAGE_KEY = 'terarobots_crm_state';

function getLocalState(): WorkspaceState {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing localStorage state:', e);
    }
  }

  const initial: WorkspaceState = {
    workspaceName: 'TeraRobots Workspace',
    logo: 'https://terarobots.com/favicon.ico',
    objects: STANDARD_OBJECTS,
    records: INITIAL_RECORDS,
    timeline: INITIAL_TIMELINE,
    views: INITIAL_VIEWS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveLocalState(state: WorkspaceState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const crmApi = {
  isTauri: isTauriEnv,

  async getWorkspaceMeta(): Promise<WorkspaceState> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('get_workspace_meta');
      } catch (e) {
        console.warn('Tauri invoke failed, falling back to local state:', e);
      }
    }
    return getLocalState();
  },

  async listRecords(objectId: string, search?: string): Promise<CrmRecord[]> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('list_records', { objectId, search });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const query = (search || '').trim().toLowerCase();
    return state.records
      .filter((r) => r.objectId === objectId)
      .filter((r) => {
        if (!query) return true;
        return Object.values(r.values).some((val) =>
          String(val).toLowerCase().includes(query)
        );
      });
  },

  async getRecord(
    id: string
  ): Promise<{
    record: CrmRecord | null;
    timeline: TimelineActivity[];
    tasks: CrmRecord[];
    notes: CrmRecord[];
  }> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        const [record, timeline, tasks, notes] = await tauriInvoke('get_record', { id });
        return { record, timeline, tasks, notes };
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const record = state.records.find((r) => r.id === id) || null;
    const timeline = state.timeline.filter((t) => t.recordId === id);
    const tasks = state.records.filter(
      (r) => r.objectId === 'task' && r.values.targetRecordId === id
    );
    const notes = state.records.filter(
      (r) => r.objectId === 'note' && r.values.targetRecordId === id
    );
    return { record, timeline, tasks, notes };
  },

  async createRecord(
    objectId: string,
    values: Record<string, any>
  ): Promise<CrmRecord> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('create_record', { objectId, values });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const newId = `${objectId.slice(0, 4)}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newRecord: CrmRecord = {
      id: newId,
      objectId,
      createdAt: now,
      updatedAt: now,
      values,
    };
    state.records.push(newRecord);

    const titleGuess = values.name || values.title || values.firstName || 'Record';
    state.timeline.push({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      activityType: 'RECORD_CREATED',
      recordId: newId,
      recordObject: objectId,
      title: `Created ${titleGuess}`,
      description: `Created new ${objectId} record`,
      createdAt: now,
      author: 'User',
    });

    saveLocalState(state);
    return newRecord;
  },

  async updateRecord(
    id: string,
    values: Record<string, any>
  ): Promise<CrmRecord> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('update_record', { id, values });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const rec = state.records.find((r) => r.id === id);
    if (!rec) throw new Error(`Record ${id} not found`);

    rec.values = { ...rec.values, ...values };
    rec.updatedAt = new Date().toISOString();

    state.timeline.push({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      activityType: 'FIELD_UPDATED',
      recordId: id,
      recordObject: rec.objectId,
      title: 'Updated record fields',
      description: 'Modified record field values',
      createdAt: rec.updatedAt,
      author: 'User',
    });

    saveLocalState(state);
    return rec;
  },

  async deleteRecord(id: string): Promise<boolean> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('delete_record', { id });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const before = state.records.length;
    state.records = state.records.filter((r) => r.id !== id);
    state.timeline = state.timeline.filter((t) => t.recordId !== id);
    saveLocalState(state);
    return state.records.length < before;
  },

  async updateOpportunityStage(id: string, newStage: string): Promise<CrmRecord> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('update_opportunity_stage', { id, newStage });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const rec = state.records.find((r) => r.id === id && r.objectId === 'opportunity');
    if (!rec) throw new Error(`Opportunity ${id} not found`);

    const oldStage = rec.values.stage || 'NEW';
    rec.values.stage = newStage;

    const probMap: Record<string, number> = {
      NEW: 20,
      DISCOVERY: 40,
      MEETING: 60,
      PROPOSAL: 80,
      WON: 100,
      LOST: 0,
    };
    rec.values.probability = probMap[newStage] ?? 50;
    rec.updatedAt = new Date().toISOString();

    state.timeline.push({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      activityType: 'STAGE_CHANGED',
      recordId: id,
      recordObject: 'opportunity',
      title: `Moved deal to ${newStage}`,
      description: `Transitioned stage from ${oldStage} to ${newStage}`,
      createdAt: rec.updatedAt,
      author: 'User',
    });

    saveLocalState(state);
    return rec;
  },

  async updateTaskStatus(id: string, newStatus: string): Promise<CrmRecord> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('update_task_status', { id, newStatus });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const rec = state.records.find((r) => r.id === id && r.objectId === 'task');
    if (!rec) throw new Error(`Task ${id} not found`);

    rec.values.status = newStatus;
    rec.updatedAt = new Date().toISOString();

    state.timeline.push({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      activityType: 'TASK_COMPLETED',
      recordId: id,
      recordObject: 'task',
      title: `Task status changed to ${newStatus}`,
      description: `Task status updated`,
      createdAt: rec.updatedAt,
      author: 'User',
    });

    saveLocalState(state);
    return rec;
  },

  async createCustomObject(objectMeta: Partial<ObjectMetadata>): Promise<ObjectMetadata> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('create_custom_object', { objectMeta });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const newId = objectMeta.id || `custom_${(objectMeta.nameSingular || 'item').toLowerCase().replace(/\s+/g, '_')}`;
    const completeObj: ObjectMetadata = {
      id: newId,
      nameSingular: objectMeta.nameSingular || 'item',
      namePlural: objectMeta.namePlural || 'items',
      labelSingular: objectMeta.labelSingular || 'Custom Item',
      labelPlural: objectMeta.labelPlural || 'Custom Items',
      description: objectMeta.description || '',
      icon: objectMeta.icon || 'Layers',
      isCustom: true,
      fields: objectMeta.fields || [
        { id: 'name', name: 'name', label: 'Name', fieldType: 'TEXT', isRequired: true, isCustom: false },
      ],
    };

    const newView: CrmView = {
      id: `view-${newId}-all`,
      objectId: newId,
      name: `All ${completeObj.labelPlural}`,
      viewType: 'TABLE',
      visibleFields: completeObj.fields.map((f) => f.name),
      filters: [],
      sorts: [],
    };

    state.objects.push(completeObj);
    state.views.push(newView);
    saveLocalState(state);
    return completeObj;
  },

  async createCustomField(objectId: string, fieldMeta: Partial<FieldMetadata>): Promise<FieldMetadata> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('create_custom_field', { objectId, fieldMeta });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const obj = state.objects.find((o) => o.id === objectId);
    if (!obj) throw new Error(`Object ${objectId} not found`);

    const newField: FieldMetadata = {
      id: fieldMeta.id || `f_${(fieldMeta.name || 'field').toLowerCase().replace(/\s+/g, '_')}`,
      name: fieldMeta.name || 'customField',
      label: fieldMeta.label || 'Custom Field',
      fieldType: fieldMeta.fieldType || 'TEXT',
      isRequired: fieldMeta.isRequired || false,
      isCustom: true,
      options: fieldMeta.options,
      targetObject: fieldMeta.targetObject,
      description: fieldMeta.description,
    };

    obj.fields.push(newField);
    saveLocalState(state);
    return newField;
  },

  async listViews(objectId: string): Promise<CrmView[]> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('list_views', { objectId });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    return state.views.filter((v) => v.objectId === objectId);
  },

  async saveView(view: CrmView): Promise<CrmView> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('save_view', { view });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const idx = state.views.findIndex((v) => v.id === view.id);
    if (idx >= 0) {
      state.views[idx] = view;
    } else {
      state.views.push(view);
    }
    saveLocalState(state);
    return view;
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('get_analytics_summary');
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const state = getLocalState();
    const opps = state.records.filter((r) => r.objectId === 'opportunity');
    const totalCompanies = state.records.filter((r) => r.objectId === 'company').length;
    const totalPeople = state.records.filter((r) => r.objectId === 'person').length;
    const pendingTasks = state.records.filter(
      (r) => r.objectId === 'task' && r.values.status !== 'DONE'
    ).length;

    let totalPipelineValue = 0;
    let weightedPipelineValue = 0;
    let activeDealsCount = 0;
    let wonDealsCount = 0;

    const stageDefs = [
      { stage: 'NEW', label: 'New Lead', color: 'blue' },
      { stage: 'DISCOVERY', label: 'Discovery Call', color: 'purple' },
      { stage: 'MEETING', label: 'Meeting Scheduled', color: 'yellow' },
      { stage: 'PROPOSAL', label: 'Proposal Sent', color: 'orange' },
      { stage: 'WON', label: 'Closed Won', color: 'emerald' },
      { stage: 'LOST', label: 'Closed Lost', color: 'rose' },
    ];

    const stageMap: Record<string, { count: number; value: number }> = {};
    stageDefs.forEach((s) => {
      stageMap[s.stage] = { count: 0, value: 0 };
    });

    opps.forEach((opp) => {
      const amount = Number(opp.values.amount) || 0;
      const stage = opp.values.stage || 'NEW';
      const prob = Number(opp.values.probability) || 50;

      if (stage === 'WON') {
        wonDealsCount++;
        totalPipelineValue += amount;
        weightedPipelineValue += amount;
      } else if (stage !== 'LOST') {
        activeDealsCount++;
        totalPipelineValue += amount;
        weightedPipelineValue += amount * (prob / 100);
      }

      if (stageMap[stage]) {
        stageMap[stage].count++;
        stageMap[stage].value += amount;
      }
    });

    const lostCount = stageMap['LOST'] ? stageMap['LOST'].count : 0;
    const closedCount = wonDealsCount + lostCount;
    const conversionRate = closedCount > 0 ? (wonDealsCount / closedCount) * 100 : 0;

    return {
      totalPipelineValue,
      weightedPipelineValue,
      activeDealsCount,
      wonDealsCount,
      totalCompaniesCount: totalCompanies,
      totalPeopleCount: totalPeople,
      pendingTasksCount: pendingTasks,
      conversionRate,
      dealsByStage: stageDefs.map((sd) => ({
        stage: sd.stage,
        label: sd.label,
        color: sd.color,
        count: stageMap[sd.stage]?.count || 0,
        value: stageMap[sd.stage]?.value || 0,
      })),
    };
  },

  async exportData(): Promise<string> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('export_data');
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    return JSON.stringify(getLocalState(), null, 2);
  },

  async importData(jsonData: string): Promise<boolean> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('import_data', { jsonData });
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    try {
      const parsed = JSON.parse(jsonData);
      saveLocalState(parsed);
      return true;
    } catch (e) {
      console.error('Invalid JSON:', e);
      return false;
    }
  },

  async resetToDemoData(): Promise<boolean> {
    if (isTauriEnv() && tauriInvoke) {
      try {
        return await tauriInvoke('reset_to_demo_data');
      } catch (e) {
        console.warn('Tauri invoke failed:', e);
      }
    }
    const initial: WorkspaceState = {
      workspaceName: 'TeraRobots Workspace',
      logo: 'https://terarobots.com/favicon.ico',
      objects: STANDARD_OBJECTS,
      records: INITIAL_RECORDS,
      timeline: INITIAL_TIMELINE,
      views: INITIAL_VIEWS,
    };
    saveLocalState(initial);
    return true;
  },
};
