# Metaverse Web NPC Starter

This project is a starter for a Flutter Web app that embeds a Three.js metaverse scene, plus a Node.js multiplayer server and headless NPC client.

The project is designed to let you:
- run a 3D web world in Flutter web
- connect a real-time multiplayer server
- spawn NPC characters as separate clients
- scale that NPC layer toward 50 separate sessions
- optionally route each NPC through a different Windscribe VPN location on a VPS/cloud machine

## Requirements

Install these first:
- Node.js 20+
- npm
- Flutter SDK (for web builds)
- Chrome or Edge for Flutter web preview
- Docker + Docker Compose (optional, only for containerized runtime)
- A VPS/cloud VM if you want Windscribe VPN per NPC; cPanel/shared hosting generally cannot run Docker + VPN networking correctly.

## Step-by-step setup

### 1) Open the repo

```bash
git clone https://github.com/kellyruk/nova-metaverse.git
cd nova-metaverse
git checkout metaverse-flutter-threejs
```

### 2) Install Node dependencies

Install the server dependencies:

```bash
cd server
npm install
cd ..
```

Install the NPC dependencies:

```bash
cd npc
npm install
cd ..
```

### 3) Install Flutter web dependencies

```bash
cd flutter_app
flutter pub get
cd ..
```

If Flutter is not installed or recognized:

```bash
flutter --version
```

If it is not available in your PATH, install Flutter and ensure the Flutter SDK binary is on PATH before continuing.

### 4) Start the multiplayer server

Open one terminal and run:

```bash
cd server
node src/index.js
```

Expected output:

```bash
Multiplayer server listening on ws://localhost:8081
```

### 5) Start NPCs (local session)

Open a second terminal and run a local NPC fleet. Example: 10 NPCs:

```bash
cd npc
NPC_COUNT=10 SERVER_URL=ws://localhost:8081 node src/index.js
```

To run 50 NPCs via the provided helper:

```bash
chmod +x scripts/run-npc-fleet.sh
SERVER_URL=ws://localhost:8081 NPC_COUNT=50 ./scripts/run-npc-fleet.sh
```

This helper starts multiple NPC processes in one shell. Each client connects to the same world server with a unique session tag and generated ID.

### 6) Start the Flutter web app

Open a third terminal and run:

```bash
cd flutter_app
flutter run -d chrome
```

If you want a production web build instead:

```bash
cd flutter_app
flutter build web --web-renderer html
```

Then serve the generated output from the `build/web` directory using any static host.

## Local full-stack run flow

The normal flow is:

1. Start `server`
2. Start `npc` fleet
3. Start `flutter_app` in Chrome
4. Move around using WASD or arrow keys
5. See NPC avatars appear in the same world

If the world does not connect:
- make sure the websocket server is still running
- make sure the server port is not blocked
- make sure you are using `ws://localhost:8081` in the frontend script

## Docker run option

This repo also includes a Docker Compose setup that can run the server and NPC worker pool.

### 1) Create env file

```bash
cp .env.example .env
```

### 2) Edit the env file if needed

```env
SERVER_URL=ws://server:8081
PORT=8081
NPC_COUNT=50
WINDSCRIBE_EMAIL=
WINDSCRIBE_PASSWORD=
WINDSCRIBE_LOCATION=us-east
```

### 3) Launch the stack

```bash
docker compose up --build
```

Or start with a scaled NPC fleet:

```bash
docker compose up --build --scale npc=50
```

Note: Docker is optional. For a local prototype, the direct Node and Flutter commands above are simpler.

## Windscribe / VPN setup note

This project includes the architecture needed for isolated NPC sessions and multiple VPN locations, but the credentials must not be committed to source control.

Use environment variables or a secrets manager:

```bash
export WINDSCRIBE_EMAIL=your@email.com
export WINDSCRIBE_PASSWORD=yourpassword
export SERVER_URL=ws://server:8081
export NPC_COUNT=50
```

Important:
- Shared cPanel hosting is usually not suitable for this.
- A VPS or cloud VM is required for a stable Windscribe-per-NPC setup.
- Each VPNed process needs a separate networking namespace or VM/container privileges.

## Project structure

- `server/` — WebSocket multiplayer server
- `npc/` — headless NPC clients
- `flutter_app/` — Flutter web app embedding Three.js
- `scripts/` — helper scripts for running the NPC fleet
- `docker-compose.yml` — Dockerized stack
- `Dockerfile.server` — server container
- `Dockerfile.npc` — NPC container
- `.env.example` — env template

## What to customize

Edit these files to change behavior:
- `flutter_app/web/three-loader.js` — Three.js scene and movement logic
- `server/src/index.js` — world state and player sync logic
- `npc/src/index.js` — NPC connection and session generation
- `npc/src/ai.js` — NPC movement behavior

## Troubleshooting

### Flutter app does not start
- confirm Flutter is installed and on PATH
- run `flutter doctor`
- ensure Chrome is available

### WebSocket connection fails
- confirm the server is still running
- confirm the port is `8081`
- confirm the client is using `ws://localhost:8081`

### NPCs do not appear
- confirm `npc` is running
- confirm `SERVER_URL` matches the server URL
- confirm the NPC script is not failing due to missing dependencies

### Docker stack fails
- make sure Docker is running
- make sure no port conflict exists on `8081`
- make sure the `SERVER_URL` points to the correct service name when running containers

## License

MIT
