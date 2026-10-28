use crate::db::Database;
use crate::models::*;
use chrono::Utc;
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

#[tauri::command]
pub fn get_workspace_meta(db: tauri::State<'_, Arc<Database>>) -> Result<WorkspaceState, String> {
    let state = db.state.lock().map_err(|e| e.to_string())?;
    Ok(state.clone())
}

#[tauri::command]
pub fn list_records(
    object_id: String,
    search: Option<String>,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Vec<CrmRecord>, String> {
    let state = db.state.lock().map_err(|e| e.to_string())?;
    let query = search.map(|s| s.trim().to_lowercase()).unwrap_or_default();

    let records: Vec<CrmRecord> = state
        .records
        .iter()
        .filter(|r| r.object_id == object_id)
        .filter(|r| {
            if query.is_empty() {
                return true;
            }
            r.values.values().any(|v| {
                if let Some(s) = v.as_str() {
                    s.to_lowercase().contains(&query)
                } else if let Some(n) = v.as_i64() {
                    n.to_string().contains(&query)
                } else if let Some(f) = v.as_f64() {
                    f.to_string().contains(&query)
                } else {
                    false
                }
            })
        })
        .cloned()
        .collect();

    Ok(records)
}

#[tauri::command]
pub fn get_record(
    id: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<(Option<CrmRecord>, Vec<TimelineActivity>, Vec<CrmRecord>, Vec<CrmRecord>), String> {
    let state = db.state.lock().map_err(|e| e.to_string())?;
    let record = state.records.iter().find(|r| r.id == id).cloned();

    let timeline: Vec<TimelineActivity> = state
        .timeline
        .iter()
        .filter(|t| t.record_id == id)
        .cloned()
        .collect();

    // Associated tasks
    let tasks: Vec<CrmRecord> = state
        .records
        .iter()
        .filter(|r| r.object_id == "task")
        .filter(|r| {
            r.values
                .get("targetRecordId")
                .and_then(|v| v.as_str())
                .map(|val| val == id)
                .unwrap_or(false)
        })
        .cloned()
        .collect();

    // Associated notes
    let notes: Vec<CrmRecord> = state
        .records
        .iter()
        .filter(|r| r.object_id == "note")
        .filter(|r| {
            r.values
                .get("targetRecordId")
                .and_then(|v| v.as_str())
                .map(|val| val == id)
                .unwrap_or(false)
        })
        .cloned()
        .collect();

    Ok((record, timeline, tasks, notes))
}

#[tauri::command]
pub fn create_record(
    object_id: String,
    values: HashMap<String, serde_json::Value>,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<CrmRecord, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;

    let new_id = format!("{}-{}", &object_id[0..std::cmp::min(4, object_id.len())], Uuid::new_v4().to_string()[0..8].to_string());
    let now = Utc::now().to_rfc3339();

    let new_record = CrmRecord {
        id: new_id.clone(),
        object_id: object_id.clone(),
        created_at: now.clone(),
        updated_at: now.clone(),
        values: values.clone(),
    };

    let title_guess = values
        .get("name")
        .or_else(|| values.get("title"))
        .or_else(|| values.get("firstName"))
        .and_then(|v| v.as_str())
        .unwrap_or("Record");

    state.records.push(new_record.clone());

    // Generate timeline entry
    state.timeline.push(TimelineActivity {
        id: format!("act-{}", Uuid::new_v4().to_string()[0..8].to_string()),
        activity_type: "RECORD_CREATED".to_string(),
        record_id: new_id,
        record_object: object_id,
        title: format!("Created {}", title_guess),
        description: format!("Created new {} record", title_guess),
        created_at: now,
        author: "User".to_string(),
    });

    drop(state);
    let _ = db.save();

    Ok(new_record)
}

#[tauri::command]
pub fn update_record(
    id: String,
    values: HashMap<String, serde_json::Value>,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<CrmRecord, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    if let Some(record) = state.records.iter_mut().find(|r| r.id == id) {
        for (k, v) in values {
            record.values.insert(k, v);
        }
        record.updated_at = now.clone();
        let cloned = record.clone();

        state.timeline.push(TimelineActivity {
            id: format!("act-{}", Uuid::new_v4().to_string()[0..8].to_string()),
            activity_type: "FIELD_UPDATED".to_string(),
            record_id: id,
            record_object: cloned.object_id.clone(),
            title: "Updated record details".to_string(),
            description: "Modified record field values".to_string(),
            created_at: now,
            author: "User".to_string(),
        });

        drop(state);
        let _ = db.save();
        Ok(cloned)
    } else {
        Err(format!("Record with id {} not found", id))
    }
}

#[tauri::command]
pub fn delete_record(id: String, db: tauri::State<'_, Arc<Database>>) -> Result<bool, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;
    let len_before = state.records.len();
    state.records.retain(|r| r.id != id);

    // Also clean up timeline
    state.timeline.retain(|t| t.record_id != id);

    let deleted = state.records.len() < len_before;
    drop(state);
    let _ = db.save();
    Ok(deleted)
}

#[tauri::command]
pub fn update_opportunity_stage(
    id: String,
    new_stage: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<CrmRecord, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    if let Some(record) = state.records.iter_mut().find(|r| r.id == id && r.object_id == "opportunity") {
        let old_stage = record.values.get("stage").and_then(|v| v.as_str()).unwrap_or("NEW").to_string();
        record.values.insert("stage".to_string(), serde_json::json!(new_stage));

        // Adjust win probability according to stage
        let prob = match new_stage.as_str() {
            "NEW" => 20,
            "DISCOVERY" => 40,
            "MEETING" => 60,
            "PROPOSAL" => 80,
            "WON" => 100,
            "LOST" => 0,
            _ => 50,
        };
        record.values.insert("probability".to_string(), serde_json::json!(prob));
        record.updated_at = now.clone();

        let deal_name = record.values.get("name").and_then(|v| v.as_str()).unwrap_or("Deal").to_string();
        let cloned = record.clone();

        state.timeline.push(TimelineActivity {
            id: format!("act-{}", Uuid::new_v4().to_string()[0..8].to_string()),
            activity_type: "STAGE_CHANGED".to_string(),
            record_id: id,
            record_object: "opportunity".to_string(),
            title: format!("Moved {} to {}", deal_name, new_stage),
            description: format!("Transitioned pipeline stage from {} to {}", old_stage, new_stage),
            created_at: now,
            author: "User".to_string(),
        });

        drop(state);
        let _ = db.save();
        Ok(cloned)
    } else {
        Err(format!("Opportunity with id {} not found", id))
    }
}

#[tauri::command]
pub fn update_task_status(
    id: String,
    new_status: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<CrmRecord, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    if let Some(record) = state.records.iter_mut().find(|r| r.id == id && r.object_id == "task") {
        record.values.insert("status".to_string(), serde_json::json!(new_status));
        record.updated_at = now.clone();
        let cloned = record.clone();

        let task_title = record.values.get("title").and_then(|v| v.as_str()).unwrap_or("Task").to_string();
        state.timeline.push(TimelineActivity {
            id: format!("act-{}", Uuid::new_v4().to_string()[0..8].to_string()),
            activity_type: "TASK_COMPLETED".to_string(),
            record_id: id,
            record_object: "task".to_string(),
            title: format!("Task '{}' marked as {}", task_title, new_status),
            description: format!("Status changed to {}", new_status),
            created_at: now,
            author: "User".to_string(),
        });

        drop(state);
        let _ = db.save();
        Ok(cloned)
    } else {
        Err(format!("Task with id {} not found", id))
    }
}

#[tauri::command]
pub fn create_custom_object(
    mut object_meta: ObjectMetadata,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<ObjectMetadata, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;

    if object_meta.id.is_empty() {
        object_meta.id = format!("custom_{}", object_meta.name_singular.to_lowercase().replace(' ', "_"));
    }
    object_meta.is_custom = true;

    // Create default table view for this new object
    let default_fields: Vec<String> = object_meta.fields.iter().map(|f| f.name.clone()).collect();
    let view = CrmView {
        id: format!("view-{}-all", object_meta.id),
        object_id: object_meta.id.clone(),
        name: format!("All {}", object_meta.label_plural),
        view_type: "TABLE".to_string(),
        kanban_field: None,
        visible_fields: default_fields,
        filters: vec![],
        sorts: vec![],
    };

    state.objects.push(object_meta.clone());
    state.views.push(view);

    drop(state);
    let _ = db.save();
    Ok(object_meta)
}

#[tauri::command]
pub fn create_custom_field(
    object_id: String,
    mut field_meta: FieldMetadata,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<FieldMetadata, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;

    if field_meta.id.is_empty() {
        field_meta.id = format!("f_{}", field_meta.name.to_lowercase().replace(' ', "_"));
    }
    field_meta.is_custom = true;

    if let Some(obj) = state.objects.iter_mut().find(|o| o.id == object_id) {
        obj.fields.push(field_meta.clone());
        drop(state);
        let _ = db.save();
        Ok(field_meta)
    } else {
        Err(format!("Object with id {} not found", object_id))
    }
}

#[tauri::command]
pub fn list_views(
    object_id: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Vec<CrmView>, String> {
    let state = db.state.lock().map_err(|e| e.to_string())?;
    let views: Vec<CrmView> = state
        .views
        .iter()
        .filter(|v| v.object_id == object_id)
        .cloned()
        .collect();
    Ok(views)
}

#[tauri::command]
pub fn save_view(
    view: CrmView,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<CrmView, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;
    if let Some(pos) = state.views.iter().position(|v| v.id == view.id) {
        state.views[pos] = view.clone();
    } else {
        state.views.push(view.clone());
    }
    drop(state);
    let _ = db.save();
    Ok(view)
}

#[tauri::command]
pub fn get_analytics_summary(db: tauri::State<'_, Arc<Database>>) -> Result<AnalyticsSummary, String> {
    let state = db.state.lock().map_err(|e| e.to_string())?;

    let opps: Vec<&CrmRecord> = state.records.iter().filter(|r| r.object_id == "opportunity").collect();
    let total_companies = state.records.iter().filter(|r| r.object_id == "company").count();
    let total_people = state.records.iter().filter(|r| r.object_id == "person").count();
    let pending_tasks = state
        .records
        .iter()
        .filter(|r| r.object_id == "task")
        .filter(|r| {
            r.values
                .get("status")
                .and_then(|v| v.as_str())
                .map(|s| s != "DONE")
                .unwrap_or(true)
        })
        .count();

    let mut total_pipeline_value = 0.0;
    let mut weighted_pipeline_value = 0.0;
    let mut active_deals_count = 0;
    let mut won_deals_count = 0;

    let stage_defs = vec![
        ("NEW", "New Lead", "blue"),
        ("DISCOVERY", "Discovery", "purple"),
        ("MEETING", "Meeting Scheduled", "yellow"),
        ("PROPOSAL", "Proposal Sent", "orange"),
        ("WON", "Closed Won", "emerald"),
        ("LOST", "Closed Lost", "rose"),
    ];

    let mut stage_counts: HashMap<String, (usize, f64)> = HashMap::new();
    for (st, _, _) in &stage_defs {
        stage_counts.insert(st.to_string(), (0, 0.0));
    }

    for opp in &opps {
        let amount = opp
            .values
            .get("amount")
            .and_then(|v| v.as_f64().or_else(|| v.as_i64().map(|i| i as f64)))
            .unwrap_or(0.0);
        let stage = opp
            .values
            .get("stage")
            .and_then(|v| v.as_str())
            .unwrap_or("NEW");
        let prob = opp
            .values
            .get("probability")
            .and_then(|v| v.as_f64().or_else(|| v.as_i64().map(|i| i as f64)))
            .unwrap_or(50.0);

        if stage == "WON" {
            won_deals_count += 1;
            total_pipeline_value += amount;
            weighted_pipeline_value += amount;
        } else if stage != "LOST" {
            active_deals_count += 1;
            total_pipeline_value += amount;
            weighted_pipeline_value += amount * (prob / 100.0);
        }

        let entry = stage_counts.entry(stage.to_string()).or_insert((0, 0.0));
        entry.0 += 1;
        entry.1 += amount;
    }

    let total_closed = won_deals_count + stage_counts.get("LOST").map(|e| e.0).unwrap_or(0);
    let conversion_rate = if total_closed > 0 {
        (won_deals_count as f64 / total_closed as f64) * 100.0
    } else {
        0.0
    };

    let deals_by_stage = stage_defs
        .into_iter()
        .map(|(stage, label, color)| {
            let (count, value) = stage_counts.get(stage).cloned().unwrap_or((0, 0.0));
            StageMetric {
                stage: stage.to_string(),
                label: label.to_string(),
                count,
                value,
                color: color.to_string(),
            }
        })
        .collect();

    Ok(AnalyticsSummary {
        total_pipeline_value,
        weighted_pipeline_value,
        active_deals_count,
        won_deals_count,
        total_companies_count: total_companies,
        total_people_count: total_people,
        pending_tasks_count: pending_tasks,
        conversion_rate,
        deals_by_stage,
    })
}

#[tauri::command]
pub fn export_data(db: tauri::State<'_, Arc<Database>>) -> Result<String, String> {
    let state = db.state.lock().map_err(|e| e.to_string())?;
    serde_json::to_string_pretty(&*state).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_data(
    json_data: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<bool, String> {
    let new_state: WorkspaceState = serde_json::from_str(&json_data).map_err(|e| e.to_string())?;
    let mut state = db.state.lock().map_err(|e| e.to_string())?;
    *state = new_state;
    drop(state);
    let _ = db.save();
    Ok(true)
}

#[tauri::command]
pub fn reset_to_demo_data(db: tauri::State<'_, Arc<Database>>) -> Result<bool, String> {
    let mut state = db.state.lock().map_err(|e| e.to_string())?;
    *state = Database::seed_initial_state();
    drop(state);
    let _ = db.save();
    Ok(true)
}
