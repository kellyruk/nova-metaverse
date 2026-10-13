# Metaverse Web NPC Starter

This project is a starter for a Flutter Web app that embeds a Three.js metaverse scene, plus a Node.js multiplayer server and headless NPC client.

## Overview

- Flutter Web front end
- Three.js scene embedded in Flutter via `HtmlElementView`
- Real-time server for world state and player movement
- NPC workers that can be scaled to 50 instances
- Docker Compose template for running the multiplayer server and NPC fleet

## Requirements

- Node.js 20+
- npm
- Flutter SDK (for web builds)
- Docker + Docker Compose (optional for containerized NPCs)
- A VPS/cloud VM for VPNed NPCs; shared cPanel hosting will not support privileged VPN/container networking reliably.

## Quick start

1. Install server dependencies:
   ```bash
   cd server && npm install
   ```

2. Install NPC dependencies:
   ```bash
   cd npc && npm install
   ```

3. Start the multiplayer server:
   ```bash
   cd server && node src/index.js
   ```

4. Run a local NPC fleet (example 50):
   ```bash
   SERVER_URL=ws://localhost:8081 NPC_COUNT=50 node npc/src/index.js
   ```

5. Or run the bundled fleet script:
   ```bash
   chmod +x scripts/run-npc-fleet.sh
   SERVER_URL=ws://localhost:8081 NPC_COUNT=50 ./scripts/run-npc-fleet.sh
   ```

6. Start the Flutter web app:
   ```bash
   cd flutter_app && flutter pub get && flutter run -d chrome
   ```

## Docker flow

Start server and 50 NPC workers:

```bash
cp .env.example .env
# Edit .env if needed

docker compose up --scale npc=50
```

## Windscribe note

This repository includes the runtime architecture for VPN-isolated NPCs, but credentials must be supplied via environment variables or a secrets manager. Do not commit `email/password` to source control.

Example:

```bash
export WINDSCRIBE_EMAIL=your@email.com
export WINDSCRIBE_PASSWORD=yourpassword
export SERVER_URL=ws://server:8081
export NPC_COUNT=50
```

The VPN setup must run on a VPS/cloud VM or local machine. cPanel/shared hosting generally cannot run Docker and VPN networking in the way needed for this architecture.

## Project layout

- `server/` — authoritative multiplayer server
- `npc/` — headless AI NPC clients
- `flutter_app/` — Flutter web app that embeds Three.js
- `scripts/` — fleet launcher helpers
- `docker-compose.yml` — launch the server and NPC workers
- `Dockerfile.server` and `Dockerfile.npc` — container builds

## Files to customize

- `flutter_app/web/three-loader.js` — Three.js scene implementation
- `server/src/index.js` — WebSocket server and state broadcast
- `npc/src/index.js` and `npc/src/ai.js` — NPC behavior and connection logic

## License

MIT
