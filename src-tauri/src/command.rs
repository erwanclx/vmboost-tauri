use std::fs::File;
use std::io::Write;
use tauri::window;

#[tauri::command]
pub async fn download() -> String {
  println!("Starting download");
    let url = "https://app.vagrantup.com/uwmidsun/boxes/box/versions/2.1.0/providers/virtualbox.box";
    let name = "virtualbox.box";
    let mut response = reqwest::get(url).await;
    let mut file = File::create(name).unwrap();
    let mut size = 0;
    let total_size = response.as_ref().unwrap().content_length().unwrap();
    let total_size_in_mb = total_size as f64 / 1024.0 / 1024.0;



    while let Some(chunk) = response.as_mut().expect("REASON").chunk().await.unwrap() {
        size = size + chunk.len();     
        let size_in_mb = size as f64 / 1024.0 / 1024.0;
        let _remaining_size = response.as_ref().unwrap().content_length().unwrap();
        let progress_percentage = (size_in_mb / total_size_in_mb * 100.0) as i32;

        println!(
            "Downloading {} MB of {} MB",
            size_in_mb,
            total_size_in_mb as i32
        );

        


        // print!("{}[2J", 27 as char);
        file.write_all(&chunk).unwrap();
    }
    println!("Downloaded");
    "Downloaded".to_string()
}