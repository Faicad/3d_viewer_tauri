mod commands;

use commands::{fs::*, window::*};
use std::sync::Mutex;
use tauri::{Emitter, Manager};

const SUPPORTED_EXTENSIONS: &[&str] = &[
    "stl", "glb", "gltf", "3mf", "step", "stp", "obj", "ply", "fbx", "dae",
    "3ds", "usdz", "drc", "bvh", "vtk", "vtp", "xyz", "pdb", "nrrd", "gcode",
    "wrl", "vox", "kmz", "amf", "lwo", "md2", "pcd", "3dm",
];

struct PendingFilePath(Mutex<Option<String>>);

fn extract_file_path(args: &[String]) -> Option<String> {
    let supported: std::collections::HashSet<&&str> =
        SUPPORTED_EXTENSIONS.iter().collect();

    for arg in args.iter().skip(1) {
        if arg.starts_with('-') {
            continue;
        }
        if let Some(ext) = std::path::Path::new(arg)
            .extension()
            .and_then(std::ffi::OsStr::to_str)
            .map(|e| e.to_lowercase())
        {
            if supported.contains(&ext.as_str()) {
                return Some(arg.clone());
            }
        }
    }
    None
}

#[tauri::command]
fn get_pending_file_path(state: tauri::State<'_, PendingFilePath>) -> Option<String> {
    state.0.lock().ok()?.take()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let initial_path = extract_file_path(&std::env::args().collect::<Vec<_>>());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            if let Some(path) = extract_file_path(&argv) {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("open-external-file", path);
                }
            }
        }))
        .manage(PendingFilePath(Mutex::new(initial_path)))
        .invoke_handler(tauri::generate_handler![
            read_directory,
            read_file,
            read_file_base64,
            toggle_fullscreen,
            get_app_version,
            get_pending_file_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
