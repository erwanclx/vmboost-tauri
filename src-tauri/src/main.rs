// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
mod command;

use tauri::Window;
use std::{thread, time};
use std::fs::File;
use std::io::Write;

#[derive(Clone, serde::Serialize)]
struct Payload {
    progress: i32,
}

#[tauri::command]
async fn progress_tracker(window: Window){

  let url = "https://app.vagrantup.com/uwmidsun/boxes/box/versions/2.1.0/providers/virtualbox.box";
  let name = "virtualbox.box";
  let mut response = reqwest::get(url).await;
  let mut file = File::create(name).unwrap();
  let mut size = 0;
  let total_size = response.as_ref().unwrap().content_length().unwrap();
  let total_size_in_mb = total_size as f64 / 1024.0 / 1024.0;


  let mut progress = 0;

while let Some(chunk) = response.as_mut().expect("REASON").chunk().await.unwrap() {
    size = size + chunk.len();     
    let size_in_mb = size as f64 / 1024.0 / 1024.0;
    let _remaining_size = response.as_ref().unwrap().content_length().unwrap();
    progress = (size_in_mb / total_size_in_mb * 100.0) as i32;
    window.emit("PROGRESS", Payload { progress }).unwrap();

    println!(
        "Downloading {} MB of {} MB",
        size_in_mb,
        total_size_in_mb as i32
    );
    // print!("{}[2J", 27 as char);
    file.write_all(&chunk).unwrap();
}
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            progress_tracker,
            command::download,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}