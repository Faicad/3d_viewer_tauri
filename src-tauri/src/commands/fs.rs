use base64::{engine::general_purpose::STANDARD, Engine};
use serde::Serialize;
use std::fs;
use std::time::UNIX_EPOCH;

// Synced from src/renderer/config/file-formats.ts — ALL_EXTENSIONS (enabled formats only).
// If you add a format in file-formats.ts, add its extension here too.
const SUPPORTED_EXTENSIONS: &[&str] = &[
    "stl", "glb", "gltf", "3mf", "step", "stp", "obj", "ply", "fbx", "dae",
    "3ds", "usdz", "drc", "bvh", "vtk", "vtp", "xyz", "pdb", "nrrd", "gcode",
    "wrl", "vox", "kmz", "amf", "lwo", "md2", "pcd", "3dm",
];

#[derive(Serialize)]
pub struct FileInfo {
    name: String,
    path: String,
    #[serde(rename = "mtimeMs")]
    mtime_ms: u64,
}

#[derive(Serialize)]
pub struct ReadDirResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    files: Option<Vec<FileInfo>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[tauri::command]
pub fn read_directory(dir_path: &str) -> ReadDirResult {
    let dir = match fs::read_dir(dir_path) {
        Ok(d) => d,
        Err(e) => {
            return ReadDirResult {
                success: false,
                files: None,
                error: Some(e.to_string()),
            }
        }
    };

    let mut files: Vec<FileInfo> = Vec::new();
    for entry in dir.flatten() {
        let path = entry.path();
        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if SUPPORTED_EXTENSIONS.contains(&ext.to_lowercase().as_str()) {
                let mtime = entry
                    .metadata()
                    .ok()
                    .and_then(|m| m.modified().ok())
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                    .map(|d| d.as_millis() as u64)
                    .unwrap_or(0);
                files.push(FileInfo {
                    name: path
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .into(),
                    path: path.to_string_lossy().into(),
                    mtime_ms: mtime,
                });
            }
        }
    }

    ReadDirResult {
        success: true,
        files: Some(files),
        error: None,
    }
}

#[derive(Serialize)]
pub struct ReadFileResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[tauri::command]
pub fn read_file(file_path: &str) -> ReadFileResult {
    match fs::read(file_path) {
        Ok(bytes) => ReadFileResult {
            success: true,
            data: Some(STANDARD.encode(&bytes)),
            error: None,
        },
        Err(e) => ReadFileResult {
            success: false,
            data: None,
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
pub fn read_file_base64(file_path: &str) -> ReadFileResult {
    match fs::read(file_path) {
        Ok(bytes) => ReadFileResult {
            success: true,
            data: Some(STANDARD.encode(&bytes)),
            error: None,
        },
        Err(e) => ReadFileResult {
            success: false,
            data: None,
            error: Some(e.to_string()),
        },
    }
}
