use axum::{
    extract::State,
    http::{header, Method, StatusCode},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use dotenvy::dotenv;
use reqwest::Client;
use serde_json::{json, Value};
use std::{env, sync::Arc};
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let api_key = env::var("LASTFM_API_KEY").expect("Missing LASTFM_API_KEY");
    let state = Arc::new(AppState { client: Client::new(), api_key });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET])
        .allow_headers([header::CONTENT_TYPE]);

    let app = Router::new()
        .route("/api/lastfm-track", get(get_lastfm_track))
        .with_state(state)
        .layer(cors);

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    println!("Server running on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

struct AppState {
    client: Client,
    api_key: String,
}

async fn get_lastfm_track(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let username = "Kirkr101";
    let api_url = format!(
        "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user={}&api_key={}&format=json&limit=1",
        username, state.api_key
    );

    match state.client
        .get(&api_url)
        .header("User-Agent", "kirkr.xyz-website/1.0")
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => {
            let data: Value = response.json().await.unwrap_or_default();
            let track = &data["recenttracks"]["track"][0];

            if track.is_null() {
                return (
                    StatusCode::NOT_FOUND,
                    Json(json!({ "error": "No tracks found." })),
                );
            }

            let now_playing = track["@attr"]["nowplaying"].as_str() == Some("true");

            let body = json!({
                "status": if now_playing { "Currently playing" } else { "Last Listen" },
                "title": track["name"],
                "artist": track["artist"]["#text"],
                "albumArtUrl": track["image"]
                    .as_array()
                    .and_then(|arr| arr.iter().find(|img| img["size"] == "medium"))
                    .and_then(|img| img["#text"].as_str())
                    .unwrap_or(""),
                "trackUrl": track["url"]
            });

            (StatusCode::OK, Json(body))
        }
        Ok(response) => (
            StatusCode::from_u16(response.status().as_u16()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR),
            Json(json!({ "error": format!("Last.fm API responded with {}", response.status()) })),
        ),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": err.to_string() })),
        ),
    }
}
