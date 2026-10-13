const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const readmePath = path.join(projectRoot, 'README.md');

const readme = `# Metaverse Platform Starter

This project is a production-oriented starter for a Flutter Web + Babylon.js metaverse with multiplayer state, NPC clients, and a REST orchestration layer.

## Features included

- Babylon.js 3D world with large map and sky
- Open-world terrain plus roads and plaza layout
- Player avatar and movement controls
- Enterable villa concept with multi-floor architecture
- Elevator panel and floor switching
- WebSocket multiplayer state synchronization
- Headless NPC clients with unique session IDs
- REST API for session creation and NPC orchestration
- regional / VPN metadata support for NPCs
- Docker templates for service deployment
- projected path to realtime production deployment

## Quick start

1. Install the realtime server dependencies:
   \`\`\`
   cd server && npm install
   \`\`\`

2. Install the NPC client dependencies:
   \`\`\`
   cd npc && npm install
   \`\`\`

3. Install the REST admin service dependencies:
   \`\`\`
   cd server-rest && npm install
   \`\`\`

4. Start the server:
   \`\`\`
   cd server && node src/index.js
   \`\`\`

5. Start the NPC fleet (example 50):
   \`\`\`
   cd npc && SERVER_URL=ws://localhost:8081 NPC_COUNT=50 SESSION_TAG=group-a VPN_LOCATION=us-east node src/index.js
   \`\`\`

6. Start the REST API:
   \`\`\`
   cd server-rest && node index.js
   \`\`\`

7. Run Flutter web:
   \`\`\`
   cd flutter_app && flutter pub get && flutter run -d chrome
   \`\`\`

## API endpoints

- GET /api/health
- POST /api/session
- GET /api/sessions
- GET /api/npcs
- POST /api/npcs
- POST /api/npcs/:id/status
- POST /api/npcs/:id/vpn
- DELETE /api/npcs/:id

## Notes

- Use environment variables for Windscribe credentials and do not commit them to source control.
- A VPS or cloud VM is required for Windscribe-per-NPC location routing.
- Shared cPanel hosting generally cannot support privileged VPN container networking.

## Production roadmap

- realistic luxury villas with complete interiors
- elevator door animation and indoor navigation
- Live NPC admin dashboard
- health checks and autoscaling
- Redis or database-backed session storage
- secure JWT + role management
- CDN, TLS, and deployment automation

## License

MIT
`;

fs.writeFileSync(readmePath, readme, 'utf8');
console.log('README updated');
