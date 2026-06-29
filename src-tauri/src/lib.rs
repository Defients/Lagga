use serde::Serialize;
use serde::Deserialize;
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use sysinfo::System;
use tauri::{AppHandle, Emitter, Manager, State, WebviewWindowBuilder, WebviewUrl};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;

#[cfg(windows)]
use windows::Win32::Foundation::POINT;
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;
#[cfg(windows)]
use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_LBUTTON};

struct AppState {
    system: Mutex<System>,
}

#[derive(Serialize, Clone)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub memory_used_mb: u64,
    pub memory_total_mb: u64,
    pub memory_percent: f32,
}

#[derive(Clone, Serialize)]
struct CursorPosition {
    x: i32,
    y: i32,
}

#[derive(Serialize, Clone)]
pub struct MonitorInfo {
    pub count: usize,
    pub primary_width: u32,
    pub primary_height: u32,
}

#[tauri::command]
fn get_monitor_count(app_handle: AppHandle) -> MonitorInfo {
    let monitors = app_handle.available_monitors().unwrap_or_default();
    let count = monitors.len();
    let (pw, ph) = if let Some(primary) = app_handle.primary_monitor().ok().flatten() {
        (primary.size().width, primary.size().height)
    } else if let Some(first) = monitors.first() {
        (first.size().width, first.size().height)
    } else {
        (0, 0)
    };
    MonitorInfo { count, primary_width: pw, primary_height: ph }
}

#[derive(Clone, Serialize, Deserialize)]
struct SettingsPayload {
    global: serde_json::Value,
    trails: Vec<serde_json::Value>,
}

#[tauri::command]
fn broadcast_settings(app_handle: AppHandle, payload: SettingsPayload) {
    let _ = app_handle.emit("settings-changed", payload);
}

#[tauri::command]
fn get_system_metrics(state: State<'_, AppState>) -> SystemMetrics {
    let mut sys = state.system.lock().unwrap();
    sys.refresh_cpu_usage();
    sys.refresh_memory();
    let used = sys.used_memory();
    let total = sys.total_memory();
    SystemMetrics {
        cpu_usage: sys.global_cpu_usage(),
        memory_used_mb: used / 1024 / 1024,
        memory_total_mb: total / 1024 / 1024,
        memory_percent: if total > 0 {
            (used as f32 / total as f32) * 100.0
        } else {
            0.0
        },
    }
}

#[cfg(windows)]
fn start_cursor_polling(app_handle: AppHandle) {
    thread::spawn(move || {
        let mut point = POINT::default();
        let mut was_pressed = false;
        loop {
            unsafe {
                let _ = GetCursorPos(&mut point);

                let pressed = (GetAsyncKeyState(VK_LBUTTON.0 as i32) as u16 & 0x8000) != 0;
                if pressed && !was_pressed {
                    let _ = app_handle.emit(
                        "cursor-click",
                        CursorPosition {
                            x: point.x,
                            y: point.y,
                        },
                    );
                }
                was_pressed = pressed;
            }
            let _ = app_handle.emit(
                "cursor-move",
                CursorPosition {
                    x: point.x,
                    y: point.y,
                },
            );
            thread::sleep(Duration::from_millis(5));
        }
    });
}

fn configure_overlay(overlay: &tauri::WebviewWindow) {
    let _ = overlay.set_ignore_cursor_events(true);
    let _ = overlay.set_always_on_top(true);
    let _ = overlay.show();
    println!("[overlay] configured: {} visible={}, always_on_top={}", overlay.label(), overlay.is_visible().unwrap_or(false), overlay.is_always_on_top().unwrap_or(false));
}

fn get_overlay_windows(app: &AppHandle) -> Vec<tauri::WebviewWindow> {
    let mut windows = Vec::new();
    if let Some(win) = app.get_webview_window("overlay") {
        windows.push(win);
    }
    for i in 1..10u32 {
        let label = format!("overlay-{}", i);
        if let Some(win) = app.get_webview_window(&label) {
            windows.push(win);
        } else {
            break;
        }
    }
    windows
}

fn setup_overlay_windows(app: &AppHandle) {
    let monitors = app.available_monitors().unwrap_or_default();
    println!("[overlay] setup_overlay_windows: {} monitors", monitors.len());
    if monitors.is_empty() {
        if let Some(overlay) = app.get_webview_window("overlay") {
            if let Ok(Some(monitor)) = overlay.primary_monitor() {
                let size = monitor.size();
                let pos = monitor.position();
                let _ = overlay.set_position(tauri::PhysicalPosition::new(pos.x, pos.y));
                let _ = overlay.set_size(tauri::PhysicalSize::new(size.width, size.height));
            }
            configure_overlay(&overlay);
        }
        return;
    }

    for (i, monitor) in monitors.iter().enumerate() {
        let pos = monitor.position();
        let size = monitor.size();
        println!("[overlay] monitor {}: pos=({},{}), size={}x{}", i, pos.x, pos.y, size.width, size.height);

        if i == 0 {
            if let Some(overlay) = app.get_webview_window("overlay") {
                let _ = overlay.set_position(tauri::PhysicalPosition::new(pos.x, pos.y));
                let _ = overlay.set_size(tauri::PhysicalSize::new(size.width, size.height));
                configure_overlay(&overlay);
            }
        } else {
            let label = format!("overlay-{}", i);
            let builder = WebviewWindowBuilder::new(
                app,
                &label,
                WebviewUrl::App("/overlay.html".into()),
            )
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .position(pos.x as f64, pos.y as f64)
            .inner_size(size.width as f64, size.height as f64);

            if let Ok(overlay) = builder.build() {
                configure_overlay(&overlay);
            }
        }
    }
}

fn start_topmost_enforcer(app_handle: AppHandle) {
    thread::spawn(move || {
        let mut last_monitor_count = app_handle.available_monitors().map(|m| m.len()).unwrap_or(0);
        loop {
            thread::sleep(Duration::from_secs(2));

            // Check for monitor hot-plug changes
            let current_count = app_handle.available_monitors().map(|m| m.len()).unwrap_or(0);
            if current_count != last_monitor_count {
                // Close any extra overlay windows
                for i in 1..10u32 {
                    let label = format!("overlay-{}", i);
                    if let Some(win) = app_handle.get_webview_window(&label) {
                        let _ = win.destroy();
                    }
                }
                // Re-setup all overlay windows
                setup_overlay_windows(&app_handle);
                last_monitor_count = current_count;
            }

            for overlay in get_overlay_windows(&app_handle) {
                let _ = overlay.set_always_on_top(true);
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut sys = System::new();
    sys.refresh_cpu_usage();
    sys.refresh_memory();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            system: Mutex::new(sys),
        })
        .invoke_handler(tauri::generate_handler![get_system_metrics, get_monitor_count, broadcast_settings])
        .setup(|app| {
            // --- System tray ---
            let toggle = MenuItem::with_id(app, "toggle", "Toggle Overlay", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Lagga", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle, &quit])?;

            let mut tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Lagga")
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "toggle" => {
                            let overlays = get_overlay_windows(app);
                            let any_visible = overlays.iter().any(|o| o.is_visible().unwrap_or(false));
                            for overlay in &overlays {
                                if any_visible {
                                    let _ = overlay.hide();
                                } else {
                                    let _ = overlay.show();
                                    let _ = overlay.set_always_on_top(true);
                                }
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                });

            if let Some(icon) = app.default_window_icon().cloned() {
                tray = tray.icon(icon);
            }
            let _ = tray.build(app);

            // --- Overlay windows: one per monitor, fullscreen transparent topmost ---
            setup_overlay_windows(app.handle());

            // --- Background threads ---
            #[cfg(windows)]
            start_cursor_polling(app.handle().clone());
            start_topmost_enforcer(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
