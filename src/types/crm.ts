export type FieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'CURRENCY'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'BOOLEAN'
  | 'DATE_TIME'
  | 'RATING'
  | 'LINKS'
  | 'RELATION';

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  color?: string; // hex or tailwind color
}

export interface FieldMetadata {
  id: string;
  name: string; // e.g. "annualRecurringRevenue"
  label: string; // e.g. "Annual Recurring Revenue (ARR)"
  fieldType: FieldType;
  isRequired?: boolean;
  isCustom?: boolean;
  options?: SelectOption[];
  targetObject?: string; // for RELATION, e.g. "company"
  description?: string;
  defaultValue?: any;
}

export interface ObjectMetadata {
  id: string; // "person", "company", "opportunity", "task", "note", or custom
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  icon: string; // Lucide icon name: "User", "Building2", "Target", "CheckSquare", "FileText", "Layers"
  isCustom: boolean;
  fields: FieldMetadata[];
}

export interface CrmRecord {
  id: string;
  objectId: string;
  createdAt: string;
  updatedAt: string;
  values: Record<string, any>;
}

export interface TimelineActivity {
  id: string;
  activityType: 'RECORD_CREATED' | 'STAGE_CHANGED' | 'NOTE_ADDED' | 'TASK_COMPLETED' | 'FIELD_UPDATED';
  recordId: string;
  recordObject: string;
  title: string;
  description: string;
  createdAt: string;
  author: string;
}

export interface ViewFilter {
  field: string;
  operator: 'EQUAL' | 'NOT_EQUAL' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IS_EMPTY' | 'IS_NOT_EMPTY';
  value: string;
}

export interface ViewSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface CrmView {
  id: string;
  objectId: string;
  name: string;
  viewType: 'TABLE' | 'KANBAN';
  kanbanField?: string;
  visibleFields: string[];
  filters: ViewFilter[];
  sorts: ViewSort[];
}

export interface WorkspaceState {
  workspaceName: string;
  logo: string;
  objects: ObjectMetadata[];
  records: CrmRecord[];
  timeline: TimelineActivity[];
  views: CrmView[];
}

export interface AnalyticsSummary {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  activeDealsCount: number;
  wonDealsCount: number;
  totalCompaniesCount: number;
  totalPeopleCount: number;
  pendingTasksCount: number;
  conversionRate: number;
  dealsByStage: {
    stage: string;
    label: string;
    count: number;
    value: number;
    color: string;
  }[];
}
