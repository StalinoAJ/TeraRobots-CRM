mod db;
mod models;
mod commands;

use db::Database;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Determine data path
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::env::current_dir().unwrap().join(".terarobots_crm_data"));

            let database = Arc::new(Database::new(app_data_dir));
            app.manage(database);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_workspace_meta,
            commands::list_records,
            commands::get_record,
            commands::create_record,
            commands::update_record,
            commands::delete_record,
            commands::update_opportunity_stage,
            commands::update_task_status,
            commands::create_custom_object,
            commands::create_custom_field,
            commands::list_views,
            commands::save_view,
            commands::get_analytics_summary,
            commands::export_data,
            commands::import_data,
            commands::reset_to_demo_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
