const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 8081);
const server = new WebSocketServer({ port: PORT });
const clients = new Map();
const WORLD_BOUNDS = 52;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomSpawn() {
  return {
    x: (Math.random() - 0.5) * WORLD_BOUNDS * 1.6,
    y: 0,
    z: (Math.random() - 0.5) * WORLD_BOUNDS * 1.6,
  };
}

function serializePlayers() {
  return Array.from(clients.values()).map((player) => ({
    id: player.id,
    kind: player.kind,
    x: Number(player.x),
    y: Number(player.y),
    z: Number(player.z),
    name: player.name,
    color: player.color,
    heading: Number(player.heading || 0),
    sessionTag: player.sessionTag,
    vpnLocation: player.vpnLocation,
  }));
}

function broadcast() {
  const payload = {
    type: 'world-state',
    players: serializePlayers(),
    tick: Date.now(),
  };

  for (const socket of clients.keys()) {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(payload));
    }
  }
}

function registerPlayer(socket, message) {
  const point = randomSpawn();
  const player = {
    id: message.id || `player-${Math.random().toString(16).slice(2, 10)}`,
    kind: message.kind || 'user',
    name: message.name || 'Guest',
    color: message.color || '#7fe9ff',
    x: Number(message.x ?? point.x),
    y: Number(message.y ?? point.y),
    z: Number(message.z ?? point.z),
    heading: Number(message.heading || 0),
    sessionTag: message.sessionTag || 'default',
    vpnLocation: message.vpnLocation || 'local',
    connectedAt: Date.now(),
  };

  clients.set(socket, player);
  socket.send(JSON.stringify({
    type: 'welcome',
    id: player.id,
    world: { bounds: WORLD_BOUNDS },
    sessionTag: player.sessionTag,
    vpnLocation: player.vpnLocation,
  }));
}

server.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      if (message.type === 'join') {
        registerPlayer(socket, message);
        broadcast();
        return;
      }

      if (message.type === 'move') {
        const player = clients.get(socket);
        if (!player) return;

        player.x = clamp(Number(message.x ?? player.x), -WORLD_BOUNDS, WORLD_BOUNDS);
        player.y = clamp(Number(message.y ?? player.y), 0, 10);
        player.z = clamp(Number(message.z ?? player.z), -WORLD_BOUNDS, WORLD_BOUNDS);
        player.heading = Number(message.heading ?? player.heading ?? 0);
        player.sessionTag = message.sessionTag || player.sessionTag;
        player.vpnLocation = message.vpnLocation || player.vpnLocation;
        broadcast();
        return;
      }

      if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      }
    } catch (error) {
      console.error('Message parse error:', error);
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    console.log('Client disconnected');
    broadcast();
  });
});

server.on('listening', () => {
  console.log(`Multiplayer server listening on ws://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

setInterval(() => {
  broadcast();
}, 60);
