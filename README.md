A personal website built with SvelteKit, featuring articles, artworks, films, and Last.fm data integration via a Rust proxy server.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later) with npm
- [Rust](https://www.rust-lang.org/) (v1.70 or later) with Cargo
- A Last.fm API key (get one from [Last.fm API](https://www.last.fm/api/account/create))

## Setup

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd about-svelte
   ```

2. Install frontend dependencies:
   ```sh
   bun install
   ```

3. Setup the Last.fm server:
   - Copy `lastfm-server/.env` and set your Last.fm API key:
     ```sh
     LASTFM_API_KEY=your_api_key_here
     ```

   - Ensure Rust is installed, then build the server:
     ```sh
     cd lastfm-server
     cargo build --release
     cd ..
     ```

   - Or use the combined build script: `npm run build:all`

## Development

To run both the frontend and backend in development mode:

1. Start the Last.fm proxy server:
   ```sh
   cd lastfm-server
   cargo run
   ```

2. In a separate terminal, start the Svelte frontend:
   ```sh
   bun run dev
   ```

   The frontend will be available at `http://localhost:5173` and the API server at `http://localhost:3000`

## Building

To create production builds of both components:

```sh
bun run build:all
```

This builds the Svelte application and compiles the Rust server with optimizations.

## Running in Production

After building, start both services:

```sh
bun run start
```

This runs the Svelte preview server and the Rust API server concurrently.

## Scripts

- `bun run dev` - Start the development server
- `bun run build` - Build the frontend for production
- `bun run build:all` - Build both frontend and Rust server
- `bun run preview` - Preview the production build
- `bun run start` - Run production server and Rust API
- `bun run check` - Run TypeScript and Svelte checks
- `bun run format` - Format code with Prettier
- `bun run lint` - Check code formatting and linting

## Project Structure

```
.
├── src/                    # SvelteKit application
│   ├── routes/             # App routes and pages
│   ├── lib/                # Reusable components and utilities
│   └── app.html            # HTML template
├── static/                 # Static assets
├── lastfm-server/          # Rust Last.fm proxy server
│   ├── src/                # Rust source code
│   └── Cargo.toml          # Rust project configuration
└── package.json            # Node.js dependencies and scripts
```

