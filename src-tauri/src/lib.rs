use std::sync::Mutex;

/// État partagé contenant le port du backend Python
struct BackendPort {
    port: Mutex<u16>,
}

/// Commande pour récupérer le port du backend Python
#[tauri::command]
fn get_backend_port(state: tauri::State<'_, BackendPort>) -> u16 {
    *state.port.lock().unwrap()
}

/// Commande pour définir le port du backend (appelée lors de l'init)
#[tauri::command]
fn set_backend_port(state: tauri::State<'_, BackendPort>, port: u16) {
    *state.port.lock().unwrap() = port;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(BackendPort {
            port: Mutex::new(0),
        })
        .invoke_handler(tauri::generate_handler![get_backend_port, set_backend_port])
        .run(tauri::generate_context!())
        .expect("Erreur lors du lancement de l'application FinMap");
}
