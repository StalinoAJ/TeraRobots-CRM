use crate::models::*;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use chrono::Utc;

pub struct Database {
    file_path: PathBuf,
    pub state: Mutex<WorkspaceState>,
}

impl Database {
    pub fn new(app_dir: PathBuf) -> Self {
        let _ = fs::create_dir_all(&app_dir);
        let file_path = app_dir.join("terarobots_workspace.json");

        let initial_state = if file_path.exists() {
            match fs::read_to_string(&file_path) {
                Ok(content) => match serde_json::from_str::<WorkspaceState>(&content) {
                    Ok(state) => state,
                    Err(e) => {
                        log::error!("Failed to parse existing workspace data: {}, using initial seed", e);
                        Self::seed_initial_state()
                    }
                },
                Err(e) => {
                    log::error!("Failed to read workspace file: {}, using initial seed", e);
                    Self::seed_initial_state()
                }
            }
        } else {
            let seed = Self::seed_initial_state();
            if let Ok(json) = serde_json::to_string_pretty(&seed) {
                let _ = fs::write(&file_path, json);
            }
            seed
        };

        Database {
            file_path,
            state: Mutex::new(initial_state),
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let state = self.state.lock().map_err(|e| e.to_string())?;
        let json = serde_json::to_string_pretty(&*state).map_err(|e| e.to_string())?;
        fs::write(&self.file_path, json).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn seed_initial_state() -> WorkspaceState {
        let objects = vec![
            ObjectMetadata {
                id: "company".to_string(),
                name_singular: "company".to_string(),
                name_plural: "companies".to_string(),
                label_singular: "Company".to_string(),
                label_plural: "Companies".to_string(),
                description: "Organizations, clients, enterprise accounts, and strategic partners".to_string(),
                icon: "Building2".to_string(),
                is_custom: false,
                fields: vec![
                    FieldMetadata { id: "name".into(), name: "name".into(), label: "Company Name".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "domain".into(), name: "domain".into(), label: "Website Domain".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "employees".into(), name: "employees".into(), label: "Employees".into(), field_type: FieldType::Number, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "annualRecurringRevenue".into(), name: "annualRecurringRevenue".into(), label: "ARR (₹)".into(), field_type: FieldType::Currency, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata {
                        id: "tier".into(), name: "tier".into(), label: "Tier / Segment".into(), field_type: FieldType::Select, is_required: false, is_custom: false,
                        options: Some(vec![
                            SelectOption { id: "ent".into(), label: "Enterprise".into(), value: "Enterprise".into(), color: Some("purple".into()) },
                            SelectOption { id: "mid".into(), label: "Mid-Market".into(), value: "Mid-Market".into(), color: Some("blue".into()) },
                            SelectOption { id: "smb".into(), label: "SMB".into(), value: "SMB".into(), color: Some("emerald".into()) },
                            SelectOption { id: "startup".into(), label: "Startup".into(), value: "Startup".into(), color: Some("amber".into()) },
                        ]),
                        target_object: None, description: None,
                    },
                    FieldMetadata { id: "address".into(), name: "address".into(), label: "Location".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "linkedinUrl".into(), name: "linkedinUrl".into(), label: "LinkedIn".into(), field_type: FieldType::Links, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                ],
            },
            ObjectMetadata {
                id: "person".to_string(),
                name_singular: "person".to_string(),
                name_plural: "people".to_string(),
                label_singular: "Person".to_string(),
                label_plural: "People".to_string(),
                description: "Contacts, key decision-makers, stakeholders, and leads".to_string(),
                icon: "User".to_string(),
                is_custom: false,
                fields: vec![
                    FieldMetadata { id: "firstName".into(), name: "firstName".into(), label: "First Name".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "lastName".into(), name: "lastName".into(), label: "Last Name".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "email".into(), name: "email".into(), label: "Email Address".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "phone".into(), name: "phone".into(), label: "Phone".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "jobTitle".into(), name: "jobTitle".into(), label: "Job Title".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "companyId".into(), name: "companyId".into(), label: "Company".into(), field_type: FieldType::Relation, is_required: false, is_custom: false, options: None, target_object: Some("company".into()), description: None },
                    FieldMetadata { id: "city".into(), name: "city".into(), label: "City".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "linkedinUrl".into(), name: "linkedinUrl".into(), label: "LinkedIn Profile".into(), field_type: FieldType::Links, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "avatarUrl".into(), name: "avatarUrl".into(), label: "Avatar URL".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                ],
            },
            ObjectMetadata {
                id: "opportunity".to_string(),
                name_singular: "opportunity".to_string(),
                name_plural: "opportunities".to_string(),
                label_singular: "Opportunity".to_string(),
                label_plural: "Opportunities".to_string(),
                description: "Commercial pipeline, active deals, proposals, and contracts in INR (₹)".to_string(),
                icon: "Target".to_string(),
                is_custom: false,
                fields: vec![
                    FieldMetadata { id: "name".into(), name: "name".into(), label: "Deal Name".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "amount".into(), name: "amount".into(), label: "Amount (₹)".into(), field_type: FieldType::Currency, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata {
                        id: "stage".into(), name: "stage".into(), label: "Stage".into(), field_type: FieldType::Select, is_required: true, is_custom: false,
                        options: Some(vec![
                            SelectOption { id: "NEW".into(), label: "New Lead".into(), value: "NEW".into(), color: Some("blue".into()) },
                            SelectOption { id: "DISCOVERY".into(), label: "Discovery Call".into(), value: "DISCOVERY".into(), color: Some("purple".into()) },
                            SelectOption { id: "MEETING".into(), label: "Meeting Scheduled".into(), value: "MEETING".into(), color: Some("yellow".into()) },
                            SelectOption { id: "PROPOSAL".into(), label: "Proposal Sent".into(), value: "PROPOSAL".into(), color: Some("orange".into()) },
                            SelectOption { id: "WON".into(), label: "Closed Won".into(), value: "WON".into(), color: Some("emerald".into()) },
                            SelectOption { id: "LOST".into(), label: "Closed Lost".into(), value: "LOST".into(), color: Some("rose".into()) },
                        ]),
                        target_object: None, description: None,
                    },
                    FieldMetadata { id: "closeDate".into(), name: "closeDate".into(), label: "Expected Close Date".into(), field_type: FieldType::DateTime, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "probability".into(), name: "probability".into(), label: "Win Probability (%)".into(), field_type: FieldType::Number, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "companyId".into(), name: "companyId".into(), label: "Associated Company".into(), field_type: FieldType::Relation, is_required: false, is_custom: false, options: None, target_object: Some("company".into()), description: None },
                    FieldMetadata { id: "pointOfContactId".into(), name: "pointOfContactId".into(), label: "Primary Contact".into(), field_type: FieldType::Relation, is_required: false, is_custom: false, options: None, target_object: Some("person".into()), description: None },
                ],
            },
            ObjectMetadata {
                id: "task".to_string(),
                name_singular: "task".to_string(),
                name_plural: "tasks".to_string(),
                label_singular: "Task".to_string(),
                label_plural: "Tasks".to_string(),
                description: "Action items, follow-ups, and deliverables".to_string(),
                icon: "CheckSquare".to_string(),
                is_custom: false,
                fields: vec![
                    FieldMetadata { id: "title".into(), name: "title".into(), label: "Task Title".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "body".into(), name: "body".into(), label: "Description".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata {
                        id: "status".into(), name: "status".into(), label: "Status".into(), field_type: FieldType::Select, is_required: true, is_custom: false,
                        options: Some(vec![
                            SelectOption { id: "TODO".into(), label: "To Do".into(), value: "TODO".into(), color: Some("slate".into()) },
                            SelectOption { id: "IN_PROGRESS".into(), label: "In Progress".into(), value: "IN_PROGRESS".into(), color: Some("blue".into()) },
                            SelectOption { id: "DONE".into(), label: "Done".into(), value: "DONE".into(), color: Some("emerald".into()) },
                        ]),
                        target_object: None, description: None,
                    },
                    FieldMetadata {
                        id: "priority".into(), name: "priority".into(), label: "Priority".into(), field_type: FieldType::Select, is_required: false, is_custom: false,
                        options: Some(vec![
                            SelectOption { id: "LOW".into(), label: "Low".into(), value: "LOW".into(), color: Some("slate".into()) },
                            SelectOption { id: "MEDIUM".into(), label: "Medium".into(), value: "MEDIUM".into(), color: Some("amber".into()) },
                            SelectOption { id: "HIGH".into(), label: "High".into(), value: "HIGH".into(), color: Some("orange".into()) },
                            SelectOption { id: "URGENT".into(), label: "Urgent".into(), value: "URGENT".into(), color: Some("rose".into()) },
                        ]),
                        target_object: None, description: None,
                    },
                    FieldMetadata { id: "dueAt".into(), name: "dueAt".into(), label: "Due Date".into(), field_type: FieldType::DateTime, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "assignee".into(), name: "assignee".into(), label: "Assignee".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "targetRecordId".into(), name: "targetRecordId".into(), label: "Related Record ID".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "targetObjectId".into(), name: "targetObjectId".into(), label: "Related Object".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                ],
            },
            ObjectMetadata {
                id: "note".to_string(),
                name_singular: "note".to_string(),
                name_plural: "notes".to_string(),
                label_singular: "Note".to_string(),
                label_plural: "Notes".to_string(),
                description: "Executive notes, call transcripts, and strategic memos".to_string(),
                icon: "FileText".to_string(),
                is_custom: false,
                fields: vec![
                    FieldMetadata { id: "title".into(), name: "title".into(), label: "Note Title".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "body".into(), name: "body".into(), label: "Note Content".into(), field_type: FieldType::Text, is_required: true, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "targetRecordId".into(), name: "targetRecordId".into(), label: "Related Record ID".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                    FieldMetadata { id: "targetObjectId".into(), name: "targetObjectId".into(), label: "Related Object".into(), field_type: FieldType::Text, is_required: false, is_custom: false, options: None, target_object: None, description: None },
                ],
            },
        ];

        let mut records = Vec::new();

        // Seed companies in INR
        let companies = vec![
            ("comp-1", "Tata Consultancy Services", "tcs.com", 615000, 2400000000.0, "Enterprise", "Mumbai, Maharashtra"),
            ("comp-2", "Infosys Limited", "infosys.com", 335000, 1800000000.0, "Enterprise", "Bengaluru, Karnataka"),
            ("comp-3", "Zomato Limited", "zomato.com", 38000, 850000000.0, "Mid-Market", "Gurugram, Haryana"),
            ("comp-4", "Razorpay Software", "razorpay.com", 3200, 650000000.0, "Mid-Market", "Bengaluru, Karnataka"),
            ("comp-5", "Zerodha Broking", "zerodha.com", 1200, 1100000000.0, "Enterprise", "Bengaluru, Karnataka"),
        ];

        for (id, name, domain, emp, arr, tier, addr) in companies {
            let mut values = HashMap::new();
            values.insert("name".into(), serde_json::json!(name));
            values.insert("domain".into(), serde_json::json!(domain));
            values.insert("employees".into(), serde_json::json!(emp));
            values.insert("annualRecurringRevenue".into(), serde_json::json!(arr));
            values.insert("tier".into(), serde_json::json!(tier));
            values.insert("address".into(), serde_json::json!(addr));
            values.insert("linkedinUrl".into(), serde_json::json!(format!("https://linkedin.com/company/{}", domain.split('.').next().unwrap_or(""))));

            records.push(CrmRecord {
                id: id.to_string(),
                object_id: "company".to_string(),
                created_at: Utc::now().to_rfc3339(),
                updated_at: Utc::now().to_rfc3339(),
                values,
            });
        }

        // Seed people
        let people = vec![
            ("pers-1", "Natarajan", "Chandrasekaran", "chandra@tata.com", "+91 (22) 6665-8282", "Executive Chairman", "comp-1", "Mumbai"),
            ("pers-2", "Salil", "Parekh", "salil.parekh@infosys.com", "+91 (80) 2852-0261", "Chief Executive Officer", "comp-2", "Bengaluru"),
            ("pers-3", "Deepinder", "Goyal", "deepinder@zomato.com", "+91 (124) 432-8000", "Founder & CEO", "comp-3", "Gurugram"),
            ("pers-4", "Harshil", "Mathur", "harshil@razorpay.com", "+91 (80) 6745-7777", "CEO & Co-founder", "comp-4", "Bengaluru"),
            ("pers-5", "Nithin", "Kamath", "nithin@zerodha.com", "+91 (80) 4040-2020", "Founder & CEO", "comp-5", "Bengaluru"),
        ];

        for (id, first, last, email, phone, job, comp_id, city) in people {
            let mut values = HashMap::new();
            values.insert("firstName".into(), serde_json::json!(first));
            values.insert("lastName".into(), serde_json::json!(last));
            values.insert("email".into(), serde_json::json!(email));
            values.insert("phone".into(), serde_json::json!(phone));
            values.insert("jobTitle".into(), serde_json::json!(job));
            values.insert("companyId".into(), serde_json::json!(comp_id));
            values.insert("city".into(), serde_json::json!(city));
            values.insert("linkedinUrl".into(), serde_json::json!(format!("https://linkedin.com/in/{}", first.to_lowercase())));

            records.push(CrmRecord {
                id: id.to_string(),
                object_id: "person".to_string(),
                created_at: Utc::now().to_rfc3339(),
                updated_at: Utc::now().to_rfc3339(),
                values,
            });
        }

        // Seed opportunities in INR (₹)
        let opps = vec![
            ("opp-1", "TCS Core Banking AI Orchestration Suite", 4500000.0, "PROPOSAL", "2026-05-15", 75, "comp-1", "pers-1"),
            ("opp-2", "Infosys Cloud Native Workspace Agreement", 2800000.0, "MEETING", "2026-06-01", 60, "comp-2", "pers-2"),
            ("opp-3", "Zomato Quick-Commerce Fleet Sync License", 1850000.0, "WON", "2026-03-25", 100, "comp-3", "pers-3"),
            ("opp-4", "Razorpay Payment Gateway Custom Connector", 1200000.0, "DISCOVERY", "2026-06-30", 40, "comp-4", "pers-4"),
            ("opp-5", "Zerodha High-Frequency Trading Terminal", 3200000.0, "NEW", "2026-07-15", 25, "comp-5", "pers-5"),
        ];

        for (id, name, amount, stage, close, prob, comp_id, person_id) in opps {
            let mut values = HashMap::new();
            values.insert("name".into(), serde_json::json!(name));
            values.insert("amount".into(), serde_json::json!(amount));
            values.insert("stage".into(), serde_json::json!(stage));
            values.insert("closeDate".into(), serde_json::json!(close));
            values.insert("probability".into(), serde_json::json!(prob));
            values.insert("companyId".into(), serde_json::json!(comp_id));
            values.insert("pointOfContactId".into(), serde_json::json!(person_id));

            records.push(CrmRecord {
                id: id.to_string(),
                object_id: "opportunity".to_string(),
                created_at: Utc::now().to_rfc3339(),
                updated_at: Utc::now().to_rfc3339(),
                values,
            });
        }

        // Seed tasks
        let tasks = vec![
            ("task-1", "Review legal master agreement for TCS ₹45,00,000 proposal", "IN_PROGRESS", "HIGH", "2026-04-05", "Arjun Mehta", "opp-1", "opportunity"),
            ("task-2", "Schedule technical deep dive with Harshil & Razorpay payment ops team", "TODO", "URGENT", "2026-04-02", "Priya Sharma", "opp-4", "opportunity"),
            ("task-3", "Issue deployment credentials to Zomato engineering team", "DONE", "MEDIUM", "2026-03-26", "Rohan Verma", "opp-3", "opportunity"),
        ];

        for (id, title, status, priority, due, assignee, target_id, target_obj) in tasks {
            let mut values = HashMap::new();
            values.insert("title".into(), serde_json::json!(title));
            values.insert("body".into(), serde_json::json!(""));
            values.insert("status".into(), serde_json::json!(status));
            values.insert("priority".into(), serde_json::json!(priority));
            values.insert("dueAt".into(), serde_json::json!(due));
            values.insert("assignee".into(), serde_json::json!(assignee));
            values.insert("targetRecordId".into(), serde_json::json!(target_id));
            values.insert("targetObjectId".into(), serde_json::json!(target_obj));

            records.push(CrmRecord {
                id: id.to_string(),
                object_id: "task".to_string(),
                created_at: Utc::now().to_rfc3339(),
                updated_at: Utc::now().to_rfc3339(),
                values,
            });
        }

        // Seed notes
        let mut n1 = HashMap::new();
        n1.insert("title".into(), serde_json::json!("Meeting Notes: TCS Architecture Review for TeraRobots CRM"));
        n1.insert("body".into(), serde_json::json!("Discussed deploying TeraRobots CRM desktop client across enterprise account managers. High appreciation for local-first SQLite architecture, sub-millisecond query speed, and Indian Rupee (INR) financial tracking."));
        n1.insert("targetRecordId".into(), serde_json::json!("comp-1"));
        n1.insert("targetObjectId".into(), serde_json::json!("company"));

        records.push(CrmRecord {
            id: "note-1".to_string(),
            object_id: "note".to_string(),
            created_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
            values: n1,
        });

        // Seed timeline
        let timeline = vec![
            TimelineActivity {
                id: "act-1".into(),
                activity_type: "RECORD_CREATED".into(),
                record_id: "comp-1".into(),
                record_object: "company".into(),
                title: "Created Company Tata Consultancy Services".into(),
                description: "Added TCS with Enterprise tier and 615,000 employees.".into(),
                created_at: "2026-01-10T09:00:00Z".into(),
                author: "System Admin".into(),
            },
            TimelineActivity {
                id: "act-2".into(),
                activity_type: "RECORD_CREATED".into(),
                record_id: "opp-1".into(),
                record_object: "opportunity".into(),
                title: "New Deal created: TCS Core Banking AI Suite".into(),
                description: "Target contract value: ₹45,00,000.".into(),
                created_at: "2026-02-05T10:00:00Z".into(),
                author: "Arjun Mehta".into(),
            },
            TimelineActivity {
                id: "act-3".into(),
                activity_type: "STAGE_CHANGED".into(),
                record_id: "opp-1".into(),
                record_object: "opportunity".into(),
                title: "Opportunity moved to Proposal Sent".into(),
                description: "Stage updated to Proposal Sent (₹45,00,000)".into(),
                created_at: "2026-03-26T14:00:00Z".into(),
                author: "Arjun Mehta".into(),
            },
            TimelineActivity {
                id: "act-4".into(),
                activity_type: "STAGE_CHANGED".into(),
                record_id: "opp-3".into(),
                record_object: "opportunity".into(),
                title: "Opportunity Won! 🎉".into(),
                description: "Zomato contract signed for ₹18,50,000 ARR.".into(),
                created_at: "2026-03-25T11:00:00Z".into(),
                author: "Priya Sharma".into(),
            },
        ];

        let views = vec![
            CrmView {
                id: "view-companies-all".into(),
                object_id: "company".into(),
                name: "All Companies".into(),
                view_type: "TABLE".into(),
                kanban_field: None,
                visible_fields: vec!["name".into(), "domain".into(), "tier".into(), "annualRecurringRevenue".into(), "employees".into(), "address".into()],
                filters: vec![],
                sorts: vec![ViewSort { field: "annualRecurringRevenue".into(), direction: "DESC".into() }],
            },
            CrmView {
                id: "view-people-all".into(),
                object_id: "person".into(),
                name: "All People".into(),
                view_type: "TABLE".into(),
                kanban_field: None,
                visible_fields: vec!["firstName".into(), "lastName".into(), "email".into(), "jobTitle".into(), "companyId".into(), "city".into()],
                filters: vec![],
                sorts: vec![ViewSort { field: "lastName".into(), direction: "ASC".into() }],
            },
            CrmView {
                id: "view-opps-kanban".into(),
                object_id: "opportunity".into(),
                name: "Pipeline Board".into(),
                view_type: "KANBAN".into(),
                kanban_field: Some("stage".into()),
                visible_fields: vec!["name".into(), "amount".into(), "stage".into(), "companyId".into(), "closeDate".into()],
                filters: vec![],
                sorts: vec![ViewSort { field: "amount".into(), direction: "DESC".into() }],
            },
            CrmView {
                id: "view-opps-table".into(),
                object_id: "opportunity".into(),
                name: "Opportunities Table".into(),
                view_type: "TABLE".into(),
                kanban_field: None,
                visible_fields: vec!["name".into(), "amount".into(), "stage".into(), "closeDate".into(), "probability".into(), "companyId".into()],
                filters: vec![],
                sorts: vec![ViewSort { field: "amount".into(), direction: "DESC".into() }],
            },
            CrmView {
                id: "view-tasks-all".into(),
                object_id: "task".into(),
                name: "All Tasks".into(),
                view_type: "TABLE".into(),
                kanban_field: None,
                visible_fields: vec!["title".into(), "status".into(), "priority".into(), "dueAt".into(), "assignee".into()],
                filters: vec![],
                sorts: vec![ViewSort { field: "dueAt".into(), direction: "ASC".into() }],
            },
            CrmView {
                id: "view-tasks-kanban".into(),
                object_id: "task".into(),
                name: "Task Board".into(),
                view_type: "KANBAN".into(),
                kanban_field: Some("status".into()),
                visible_fields: vec!["title".into(), "priority".into(), "dueAt".into(), "assignee".into()],
                filters: vec![],
                sorts: vec![ViewSort { field: "dueAt".into(), direction: "ASC".into() }],
            },
        ];

        WorkspaceState {
            workspace_name: "TeraRobots Workspace".to_string(),
            logo: "https://terarobots.com/favicon.ico".to_string(),
            objects,
            records,
            timeline,
            views,
        }
    }
}
