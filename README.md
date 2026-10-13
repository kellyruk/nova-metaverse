# Metaverse Web NPC Starter

This project now includes a Babylon.js scene with a luxury villa and elevator entry flow, while retaining the WebSocket server and NPC scaling model.

## Requirements

- Node.js 20+
- npm
- Flutter SDK
- Chrome for Flutter web preview
- Optional: Docker + Docker Compose
- Optional: VPS/cloud VM for Windscribe-isolated NPCs

## Local run

1. Start the server:
```bash
cd server && npm install && node src/index.js
```

2. Start NPCs:
```bash
cd npc && npm install && SERVER_URL=ws://localhost:8081 NPC_COUNT=10 node src/index.js
```

3. Start Flutter web:
```bash
cd flutter_app && flutter pub get && flutter run -d chrome
```

## REST API

The repo also includes a lightweight REST service for session and NPC orchestration:

```bash
cd server-rest && npm install && node index.js
```

Example endpoints:
- `POST /api/session`
- `GET /api/npcs`
- `POST /api/npcs`
- `POST /api/npcs/:id/status`
- `POST /api/npcs/:id/vpn`

## Babylon scene notes

The browser scene now uses Babylon.js and includes:
- enterable luxury villas
- multilevel interior shell
- elevator panel to move between floors
- click-to-enter doors
- player movement + keyboard controls

## Windscribe note

For Windscribe per-NPC routing, run the NPC fleet on a VPS/cloud VM and assign each process a different `SESSION_TAG` and `VPN_LOCATION`.

## License

MIT
