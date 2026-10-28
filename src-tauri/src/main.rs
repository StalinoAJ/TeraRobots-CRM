// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    {
        // Fix for Linux Wayland WebKitGTK: "Error 71 (Protocol error) dispatching to Wayland display"
        // WebKitGTK on Wayland frequently fails with protocol error 71; using XWayland/x11 or disabling DMABUF fixes it.
        unsafe {
            if std::env::var("GDK_BACKEND").is_err() {
                std::env::set_var("GDK_BACKEND", "x11");
            }
            if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
                std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
            }
        }
    }

    app_lib::run();
}
