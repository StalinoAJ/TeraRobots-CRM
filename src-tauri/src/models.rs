use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum FieldType {
    Text,
    Number,
    Currency,
    Select,
    MultiSelect,
    Boolean,
    DateTime,
    Rating,
    Links,
    Relation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectOption {
    pub id: String,
    pub label: String,
    pub value: String,
    pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldMetadata {
    pub id: String,
    pub name: String,
    pub label: String,
    pub field_type: FieldType,
    #[serde(default)]
    pub is_required: bool,
    #[serde(default)]
    pub is_custom: bool,
    pub options: Option<Vec<SelectOption>>,
    pub target_object: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObjectMetadata {
    pub id: String,
    pub name_singular: String,
    pub name_plural: String,
    pub label_singular: String,
    pub label_plural: String,
    pub description: String,
    pub icon: String,
    #[serde(default)]
    pub is_custom: bool,
    pub fields: Vec<FieldMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrmRecord {
    pub id: String,
    pub object_id: String,
    pub created_at: String,
    pub updated_at: String,
    pub values: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimelineActivity {
    pub id: String,
    pub activity_type: String, // RECORD_CREATED, STAGE_CHANGED, NOTE_ADDED, TASK_COMPLETED, FIELD_UPDATED
    pub record_id: String,
    pub record_object: String,
    pub title: String,
    pub description: String,
    pub created_at: String,
    pub author: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ViewFilter {
    pub field: String,
    pub operator: String, // EQUAL, NOT_EQUAL, CONTAINS, GREATER_THAN, LESS_THAN, IS_EMPTY, IS_NOT_EMPTY
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ViewSort {
    pub field: String,
    pub direction: String, // ASC, DESC
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrmView {
    pub id: String,
    pub object_id: String,
    pub name: String,
    pub view_type: String, // TABLE, KANBAN
    pub kanban_field: Option<String>,
    pub visible_fields: Vec<String>,
    pub filters: Vec<ViewFilter>,
    pub sorts: Vec<ViewSort>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceState {
    pub workspace_name: String,
    pub logo: String,
    pub objects: Vec<ObjectMetadata>,
    pub records: Vec<CrmRecord>,
    pub timeline: Vec<TimelineActivity>,
    pub views: Vec<CrmView>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StageMetric {
    pub stage: String,
    pub label: String,
    pub count: usize,
    pub value: f64,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsSummary {
    pub total_pipeline_value: f64,
    pub weighted_pipeline_value: f64,
    pub active_deals_count: usize,
    pub won_deals_count: usize,
    pub total_companies_count: usize,
    pub total_people_count: usize,
    pub pending_tasks_count: usize,
    pub conversion_rate: f64,
    pub deals_by_stage: Vec<StageMetric>,
}
