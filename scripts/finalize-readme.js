const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const target = path.join(root, 'README.md');

const content = `# Metaverse Platform Starter

This project is a production-oriented metaphysical web starter built around a Flutter Web front end, a Babylon.js 3D world, a realtime WebSocket server, and a headless NPC runtime.

## Included components

- Babylon.js world with open terrain and luxury villa architecture
- Enterable villa and multi-floor behavior with a simple elevator control panel
- Player movement and camera orbit
- WebSocket multiplayer server for realtime player syncing
- Server-side NPC tagging with session and location metadata
- REST admin API for session and NPC orchestration
- Local run instructions for web, server, and NPC layers
- Production guidance for Windscribe VPN routing on a VPS or cloud VM

## Quick start

### 1. Install dependencies

```bash
cd server && npm install
cd ../npc && npm install
cd ../server-rest && npm install
cd ../flutter_app && flutter pub get
```

### 2. Start the realtime server

```bash
cd server
node src/index.js
```

### 3. Start NPC clients

```bash
cd npc
SESSION_TAG=group-a VPN_LOCATION=us-east SERVER_URL=ws://localhost:8081 NPC_COUNT=50 node src/index.js
```

### 4. Start the REST admin service

```bash
cd server-rest
node index.js
```

### 5. Start the Flutter web app

```bash
cd flutter_app
flutter run -d chrome
```

## API endpoints

- GET /api/health
- POST /api/session
- GET /api/sessions
- GET /api/npcs
- POST /api/npcs
- POST /api/npcs/:id/status
- POST /api/npcs/:id/vpn
- DELETE /api/npcs/:id

## Windscribe and mult-location notes

- Windscribe-based NPC routing must be run on a VPS or cloud VM.
- Do not commit Windscribe credentials into the repository.
- Use environment variables or a secrets manager.
- Shared cPanel hosting is generally not suitable for this architecture.

## Production roadmap

- more complete world architecture and realistic interior rooms
- animated door and elevator transitions
- NPC auto-navigation into buildings
- stronger AI pathing and patrol loops
- admin dashboard for NPC spawn and region assignment
- Redis/JWT session management
- secure deployment and monitoring

## License

MIT
`;

fs.writeFileSync(target, content, 'utf8');
console.log('README updated');
